export async function compressImage(
  file: File,
  maxWidth = 1024,
  quality = 0.8,
  targetBytes = 300 * 1024 // 300 KB
): Promise<string> {
  const readFileAsDataUrl = (f: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(f);
    });

  const dataUrlToBlob = (dataUrl: string) => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  };

  const origDataUrl = await readFileAsDataUrl(file);

  return await new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error('Failed to load image'));
    img.onload = async () => {
      try {
        const ratio = img.width / img.height;
        const width = Math.min(img.width, maxWidth);
        const height = Math.round(width / ratio);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas unsupported'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        let q = quality;
        let dataUrl = canvas.toDataURL('image/jpeg', q);
        let blob = dataUrlToBlob(dataUrl);
        // Iteratively reduce quality until under targetBytes or quality floor
        while (blob.size > targetBytes && q > 0.4) {
          q -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', Math.max(q, 0.4));
          blob = dataUrlToBlob(dataUrl);
        }

        // If still too big, try reducing dimensions further
        let currentWidth = width;
        while (blob.size > targetBytes && currentWidth > 300) {
          currentWidth = Math.round(currentWidth * 0.8);
          const currentHeight = Math.round(currentWidth / ratio);
          canvas.width = currentWidth;
          canvas.height = currentHeight;
          ctx.clearRect(0, 0, currentWidth, currentHeight);
          ctx.drawImage(img, 0, 0, currentWidth, currentHeight);
          dataUrl = canvas.toDataURL('image/jpeg', Math.max(q, 0.4));
          blob = dataUrlToBlob(dataUrl);
        }

        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };
    img.src = origDataUrl;
  });
}


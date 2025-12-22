"use client";

import { useState, useMemo } from "react";
import { X, Search, Music, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Classical composers and their notable pieces
const CLASSICAL_DATABASE = [
  // Bach
  { composer: "Johann Sebastian Bach", piece: "Goldberg Variations, BWV 988", era: "Baroque" },
  { composer: "Johann Sebastian Bach", piece: "The Well-Tempered Clavier, Book I", era: "Baroque" },
  { composer: "Johann Sebastian Bach", piece: "Toccata and Fugue in D minor, BWV 565", era: "Baroque" },
  { composer: "Johann Sebastian Bach", piece: "Cello Suite No. 1 in G major", era: "Baroque" },
  { composer: "Johann Sebastian Bach", piece: "Brandenburg Concerto No. 3", era: "Baroque" },
  { composer: "Johann Sebastian Bach", piece: "Prelude in C Major, BWV 846", era: "Baroque" },
  
  // Mozart
  { composer: "Wolfgang Amadeus Mozart", piece: "Piano Sonata No. 11 in A major, K. 331", era: "Classical" },
  { composer: "Wolfgang Amadeus Mozart", piece: "Symphony No. 40 in G minor", era: "Classical" },
  { composer: "Wolfgang Amadeus Mozart", piece: "Piano Concerto No. 21", era: "Classical" },
  { composer: "Wolfgang Amadeus Mozart", piece: "Requiem in D minor", era: "Classical" },
  { composer: "Wolfgang Amadeus Mozart", piece: "Eine kleine Nachtmusik", era: "Classical" },
  { composer: "Wolfgang Amadeus Mozart", piece: "Turkish March (Rondo Alla Turca)", era: "Classical" },
  
  // Beethoven
  { composer: "Ludwig van Beethoven", piece: "Moonlight Sonata, Op. 27 No. 2", era: "Romantic" },
  { composer: "Ludwig van Beethoven", piece: "Für Elise", era: "Romantic" },
  { composer: "Ludwig van Beethoven", piece: "Symphony No. 5 in C minor", era: "Romantic" },
  { composer: "Ludwig van Beethoven", piece: "Symphony No. 9 (Ode to Joy)", era: "Romantic" },
  { composer: "Ludwig van Beethoven", piece: "Piano Sonata No. 8 (Pathétique)", era: "Romantic" },
  { composer: "Ludwig van Beethoven", piece: "Piano Concerto No. 5 (Emperor)", era: "Romantic" },
  { composer: "Ludwig van Beethoven", piece: "Violin Sonata No. 9 (Kreutzer)", era: "Romantic" },
  
  // Chopin
  { composer: "Frédéric Chopin", piece: "Nocturne in E-flat major, Op. 9 No. 2", era: "Romantic" },
  { composer: "Frédéric Chopin", piece: "Ballade No. 1 in G minor", era: "Romantic" },
  { composer: "Frédéric Chopin", piece: "Polonaise in A-flat major (Heroic)", era: "Romantic" },
  { composer: "Frédéric Chopin", piece: "Fantaisie-Impromptu", era: "Romantic" },
  { composer: "Frédéric Chopin", piece: "Waltz in D-flat major (Minute Waltz)", era: "Romantic" },
  { composer: "Frédéric Chopin", piece: "Étude Op. 10 No. 12 (Revolutionary)", era: "Romantic" },
  { composer: "Frédéric Chopin", piece: "Prelude in D-flat major (Raindrop)", era: "Romantic" },
  
  // Debussy
  { composer: "Claude Debussy", piece: "Clair de Lune", era: "Impressionist" },
  { composer: "Claude Debussy", piece: "Arabesque No. 1", era: "Impressionist" },
  { composer: "Claude Debussy", piece: "Rêverie", era: "Impressionist" },
  { composer: "Claude Debussy", piece: "La Mer", era: "Impressionist" },
  { composer: "Claude Debussy", piece: "Prélude à l'après-midi d'un faune", era: "Impressionist" },
  
  // Liszt
  { composer: "Franz Liszt", piece: "La Campanella", era: "Romantic" },
  { composer: "Franz Liszt", piece: "Liebestraum No. 3", era: "Romantic" },
  { composer: "Franz Liszt", piece: "Hungarian Rhapsody No. 2", era: "Romantic" },
  { composer: "Franz Liszt", piece: "Consolation No. 3", era: "Romantic" },
  { composer: "Franz Liszt", piece: "Un Sospiro", era: "Romantic" },
  
  // Rachmaninoff
  { composer: "Sergei Rachmaninoff", piece: "Piano Concerto No. 2 in C minor", era: "Romantic" },
  { composer: "Sergei Rachmaninoff", piece: "Piano Concerto No. 3 in D minor", era: "Romantic" },
  { composer: "Sergei Rachmaninoff", piece: "Prelude in C-sharp minor", era: "Romantic" },
  { composer: "Sergei Rachmaninoff", piece: "Rhapsody on a Theme of Paganini", era: "Romantic" },
  { composer: "Sergei Rachmaninoff", piece: "Vocalise", era: "Romantic" },
  
  // Tchaikovsky
  { composer: "Pyotr Ilyich Tchaikovsky", piece: "Swan Lake", era: "Romantic" },
  { composer: "Pyotr Ilyich Tchaikovsky", piece: "The Nutcracker Suite", era: "Romantic" },
  { composer: "Pyotr Ilyich Tchaikovsky", piece: "Piano Concerto No. 1", era: "Romantic" },
  { composer: "Pyotr Ilyich Tchaikovsky", piece: "Symphony No. 6 (Pathétique)", era: "Romantic" },
  { composer: "Pyotr Ilyich Tchaikovsky", piece: "1812 Overture", era: "Romantic" },
  
  // Vivaldi
  { composer: "Antonio Vivaldi", piece: "The Four Seasons - Spring", era: "Baroque" },
  { composer: "Antonio Vivaldi", piece: "The Four Seasons - Summer", era: "Baroque" },
  { composer: "Antonio Vivaldi", piece: "The Four Seasons - Autumn", era: "Baroque" },
  { composer: "Antonio Vivaldi", piece: "The Four Seasons - Winter", era: "Baroque" },
  
  // Schubert
  { composer: "Franz Schubert", piece: "Ave Maria", era: "Romantic" },
  { composer: "Franz Schubert", piece: "Serenade (Ständchen)", era: "Romantic" },
  { composer: "Franz Schubert", piece: "Impromptu Op. 90 No. 3", era: "Romantic" },
  { composer: "Franz Schubert", piece: "Symphony No. 8 (Unfinished)", era: "Romantic" },
  
  // Brahms
  { composer: "Johannes Brahms", piece: "Hungarian Dance No. 5", era: "Romantic" },
  { composer: "Johannes Brahms", piece: "Lullaby (Wiegenlied)", era: "Romantic" },
  { composer: "Johannes Brahms", piece: "Symphony No. 4", era: "Romantic" },
  { composer: "Johannes Brahms", piece: "Piano Concerto No. 2", era: "Romantic" },
  
  // Handel
  { composer: "George Frideric Handel", piece: "Messiah - Hallelujah Chorus", era: "Baroque" },
  { composer: "George Frideric Handel", piece: "Water Music", era: "Baroque" },
  { composer: "George Frideric Handel", piece: "Music for the Royal Fireworks", era: "Baroque" },
  
  // Schumann
  { composer: "Robert Schumann", piece: "Träumerei", era: "Romantic" },
  { composer: "Robert Schumann", piece: "Kinderszenen (Scenes from Childhood)", era: "Romantic" },
  { composer: "Robert Schumann", piece: "Piano Concerto in A minor", era: "Romantic" },
  
  // Ravel
  { composer: "Maurice Ravel", piece: "Boléro", era: "Impressionist" },
  { composer: "Maurice Ravel", piece: "Pavane pour une infante défunte", era: "Impressionist" },
  { composer: "Maurice Ravel", piece: "Gaspard de la Nuit", era: "Impressionist" },
  { composer: "Maurice Ravel", piece: "Jeux d'eau", era: "Impressionist" },
  
  // Satie
  { composer: "Erik Satie", piece: "Gymnopédie No. 1", era: "Impressionist" },
  { composer: "Erik Satie", piece: "Gymnopédie No. 3", era: "Impressionist" },
  { composer: "Erik Satie", piece: "Gnossienne No. 1", era: "Impressionist" },
  
  // Prokofiev
  { composer: "Sergei Prokofiev", piece: "Romeo and Juliet", era: "20th Century" },
  { composer: "Sergei Prokofiev", piece: "Peter and the Wolf", era: "20th Century" },
  { composer: "Sergei Prokofiev", piece: "Piano Concerto No. 3", era: "20th Century" },
  
  // Grieg
  { composer: "Edvard Grieg", piece: "Piano Concerto in A minor", era: "Romantic" },
  { composer: "Edvard Grieg", piece: "Morning Mood (Peer Gynt)", era: "Romantic" },
  { composer: "Edvard Grieg", piece: "In the Hall of the Mountain King", era: "Romantic" },
  
  // Mendelssohn
  { composer: "Felix Mendelssohn", piece: "Wedding March", era: "Romantic" },
  { composer: "Felix Mendelssohn", piece: "Violin Concerto in E minor", era: "Romantic" },
  { composer: "Felix Mendelssohn", piece: "Songs Without Words", era: "Romantic" },
  
  // Saint-Saëns
  { composer: "Camille Saint-Saëns", piece: "Carnival of the Animals", era: "Romantic" },
  { composer: "Camille Saint-Saëns", piece: "Danse Macabre", era: "Romantic" },
  { composer: "Camille Saint-Saëns", piece: "The Swan", era: "Romantic" },
  
  // Dvořák
  { composer: "Antonín Dvořák", piece: "Symphony No. 9 (New World)", era: "Romantic" },
  { composer: "Antonín Dvořák", piece: "Cello Concerto in B minor", era: "Romantic" },
  { composer: "Antonín Dvořák", piece: "Humoresque No. 7", era: "Romantic" },
  
  // Paganini
  { composer: "Niccolò Paganini", piece: "Caprice No. 24", era: "Romantic" },
  { composer: "Niccolò Paganini", piece: "Violin Concerto No. 1", era: "Romantic" },
  
  // Shostakovich
  { composer: "Dmitri Shostakovich", piece: "Piano Concerto No. 2", era: "20th Century" },
  { composer: "Dmitri Shostakovich", piece: "Waltz No. 2", era: "20th Century" },
  { composer: "Dmitri Shostakovich", piece: "Symphony No. 5", era: "20th Century" },
  
  // Bartók
  { composer: "Béla Bartók", piece: "Mikrokosmos", era: "20th Century" },
  { composer: "Béla Bartók", piece: "Piano Concerto No. 3", era: "20th Century" },
  
  // Gershwin
  { composer: "George Gershwin", piece: "Rhapsody in Blue", era: "20th Century" },
  { composer: "George Gershwin", piece: "Summertime", era: "20th Century" },
  { composer: "George Gershwin", piece: "An American in Paris", era: "20th Century" },
  
  // Einaudi
  { composer: "Ludovico Einaudi", piece: "Nuvole Bianche", era: "Contemporary" },
  { composer: "Ludovico Einaudi", piece: "Una Mattina", era: "Contemporary" },
  { composer: "Ludovico Einaudi", piece: "I Giorni", era: "Contemporary" },
  { composer: "Ludovico Einaudi", piece: "Experience", era: "Contemporary" },
  
  // Yiruma
  { composer: "Yiruma", piece: "River Flows in You", era: "Contemporary" },
  { composer: "Yiruma", piece: "Kiss the Rain", era: "Contemporary" },
  { composer: "Yiruma", piece: "May Be", era: "Contemporary" },
];

interface AddPieceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (piece: { title: string; composer: string; era: string }) => void;
}

export const AddPieceModal = ({ isOpen, onClose, onAdd }: AddPieceModalProps) => {
  const [search, setSearch] = useState("");
  const [selectedPiece, setSelectedPiece] = useState<typeof CLASSICAL_DATABASE[0] | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [customComposer, setCustomComposer] = useState("");

  const filteredPieces = useMemo(() => {
    if (!search.trim()) return CLASSICAL_DATABASE.slice(0, 20);
    const query = search.toLowerCase();
    return CLASSICAL_DATABASE.filter(
      (p) =>
        p.piece.toLowerCase().includes(query) ||
        p.composer.toLowerCase().includes(query) ||
        p.era.toLowerCase().includes(query)
    ).slice(0, 30);
  }, [search]);

  const composers = useMemo(() => {
    return [...new Set(CLASSICAL_DATABASE.map((p) => p.composer))].sort();
  }, []);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (selectedPiece) {
      onAdd({ 
        title: selectedPiece.piece, 
        composer: selectedPiece.composer, 
        era: selectedPiece.era 
      });
    } else if (customTitle && customComposer) {
      onAdd({ 
        title: customTitle, 
        composer: customComposer, 
        era: "Other" 
      });
    }
    onClose();
    setSelectedPiece(null);
    setCustomTitle("");
    setCustomComposer("");
    setSearch("");
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-900" />
          </button>
          <h2 className="text-base font-semibold text-gray-900">Add to Library</h2>
          <Button
            onClick={handleAdd}
            disabled={!selectedPiece && (!customTitle || !customComposer)}
            size="sm"
            className="bg-gray-900 hover:bg-black text-white font-bold px-5 h-8 rounded-md disabled:opacity-40 disabled:bg-gray-500"
          >
            Add
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pieces or composers..."
              className="pl-9 bg-gray-100 border-0"
            />
          </div>
        </div>

        {/* Pieces List */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              {search ? "Search Results" : "Popular Pieces"}
            </p>
          </div>
          
          <div className="divide-y divide-gray-50">
            {filteredPieces.map((piece, i) => (
              <button
                key={`${piece.composer}-${piece.piece}-${i}`}
                onClick={() => setSelectedPiece(selectedPiece?.piece === piece.piece ? null : piece)}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${
                  selectedPiece?.piece === piece.piece ? "bg-accent/10" : ""
                }`}
              >
                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Music className="h-5 w-5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{piece.piece}</p>
                  <p className="text-xs text-muted-foreground truncate">{piece.composer}</p>
                </div>
                <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
                  {piece.era}
                </span>
                {selectedPiece?.piece === piece.piece && (
                  <Check className="h-5 w-5 text-accent flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Custom Piece */}
          <div className="px-4 py-4 border-t border-gray-100">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Or add custom piece
            </p>
            <div className="space-y-3">
              <Input
                value={customTitle}
                onChange={(e) => { setCustomTitle(e.target.value); setSelectedPiece(null); }}
                placeholder="Piece title"
                className="bg-gray-100 border-0"
              />
              <Input
                value={customComposer}
                onChange={(e) => { setCustomComposer(e.target.value); setSelectedPiece(null); }}
                placeholder="Composer name"
                className="bg-gray-100 border-0"
                list="composers"
              />
              <datalist id="composers">
                {composers.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPieceModal;


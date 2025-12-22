"use client";

import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white text-black px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link 
          href="/" 
          className="text-gray-500 hover:text-black text-3xl mb-8 inline-block transition-colors"
          style={{ fontFamily: "Courier New, Courier, monospace" }}
        >
          ←
        </Link>

        {/* Title */}
        <h1 
          className="text-4xl font-bold mb-8"
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          Privacy Policy
        </h1>

        {/* Content */}
        <div 
          className="space-y-6 text-gray-700"
          style={{ fontFamily: "Courier New, Courier, monospace" }}
        >
          <p className="text-sm text-gray-500">
            Last updated: December 21, 2025
          </p>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">1. Information We Collect</h2>
            <p>
              We collect information you provide directly, including your email address, username, profile information, and practice data you choose to log.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">2. How We Use Your Information</h2>
            <p>
              We use your information to provide and improve Pronia, personalize your experience, and communicate with you about your account and updates.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">3. Information Sharing</h2>
            <p>
              We do not sell your personal information. We may share information with service providers who help us operate Pronia, or when required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">5. Your Rights</h2>
            <p>
              You may access, update, or delete your account information at any time through your profile settings. You may also request a copy of your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">6. Contact</h2>
            <p>
              For questions about this Privacy Policy, please contact{" "}
              <a 
                href="mailto:support@pronia.app"
                className="text-black underline"
              >
                support@pronia.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

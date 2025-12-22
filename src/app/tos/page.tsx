"use client";

import Link from "next/link";

export default function TermsOfService() {
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
          Terms of Service
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
            <h2 className="text-xl font-bold text-black mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Pronia, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">2. Description of Service</h2>
            <p>
              Pronia is a social platform for musicians to track practice sessions, share progress, and connect with other musicians.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">4. User Content</h2>
            <p>
              You retain ownership of content you post on Pronia. By posting content, you grant us a non-exclusive license to display and distribute your content on our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">5. Prohibited Conduct</h2>
            <p>
              You agree not to use Pronia to post harmful, offensive, or illegal content. We reserve the right to remove content and suspend accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-black mb-3">6. Contact</h2>
            <p>
              For questions about these Terms, please contact{" "}
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

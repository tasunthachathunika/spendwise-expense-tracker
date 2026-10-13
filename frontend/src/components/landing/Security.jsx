import React from 'react';
import { ShieldCheck, Lock, UserCheck, CheckCircle2 } from 'lucide-react';

const SECURITY_CARDS = [
  {
    icon: ShieldCheck,
    title: 'JWT Authentication',
    description:
      'Stateless JSON Web Tokens with cryptographically signed payloads ensure tamper-proof user sessions across every request.',
  },
  {
    icon: Lock,
    title: 'bcrypt Password Hashing',
    description:
      'Passwords are salted and irreversibly hashed with bcrypt before touching MongoDB. Plaintext passwords are never stored.',
  },
  {
    icon: UserCheck,
    title: 'Protected Routes',
    description:
      'Backend authentication middleware verifies tokens on every mutation. All database queries are strictly scoped to your verified user ID.',
  },
  {
    icon: CheckCircle2,
    title: 'Validated Input',
    description:
      'Strict schema validation and parameter sanitization on all REST endpoints safeguard against malformed data and injection vulnerabilities.',
  },
];

const Security = () => {
  return (
    <section
      id="security"
      aria-labelledby="security-heading"
      className="scroll-mt-20 lg:scroll-mt-24 py-20 lg:py-24 bg-cream border-t border-line/60 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered Section Header matching reference image */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-14">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand block mb-3">
            SECURITY ARCHITECTURE
          </span>
          <h2
            id="security-heading"
            className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-bold text-ink tracking-tight leading-[1.15] max-w-2xl mx-auto text-balance"
          >
            Built with privacy and security at the core
          </h2>
          <p className="mt-3.5 text-sm sm:text-base text-ink-soft max-w-xl mx-auto leading-relaxed">
            Your personal financial data is strictly isolated to your authenticated account.
          </p>
        </div>

        {/* 4 Cards Grid Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {SECURITY_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="bg-card border border-line rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-start group"
              >
                {/* Micro Orange Rounded Badge Icon */}
                <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mb-6 flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>

                {/* Serif Card Title */}
                <h3 className="font-serif font-bold text-lg text-ink mb-2.5 tracking-tight">
                  {card.title}
                </h3>

                {/* Description Body */}
                <p className="text-xs text-ink-soft leading-relaxed">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Security;

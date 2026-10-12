import React from 'react';
import { KeyRound, ShieldCheck, Lock, CheckCheck } from 'lucide-react';

const securityItems = [
  {
    icon: KeyRound,
    title: 'JWT authentication',
    desc: 'Stateless session tokens cryptographically signed and verified on every server API request.',
  },
  {
    icon: Lock,
    title: 'bcrypt password hashing',
    desc: 'Passwords are salted and securely hashed with bcrypt. Never stored as plain text.',
  },
  {
    icon: ShieldCheck,
    title: 'Protected routes',
    desc: 'Strict authorization middleware ensures your financial logs and budgets are accessible only to you.',
  },
  {
    icon: CheckCheck,
    title: 'Validated input',
    desc: 'Rigorous client and server-side data sanitization and boundary checks across all endpoints.',
  },
];

const SecuritySection = () => {
  return (
    <section id="security" className="py-20 lg:py-28 bg-cream dark:bg-[#0a0e17] scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="uppercase tracking-widest text-xs font-semibold text-brand mb-3">
            Security
          </div>
          <h2 className="font-serif font-bold text-4xl lg:text-5xl text-ink tracking-tight">
            Your data stays yours
          </h2>
          <p className="mt-4 text-ink-soft text-lg max-w-2xl mx-auto">
            Architected with defense-in-depth principles to keep your financial records private and intact.
          </p>
        </div>

        {/* 4 Security Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {securityItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-bg-card border border-line rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-soft dark:bg-brand/15 text-brand flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h3 className="font-serif font-bold text-lg text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-ink-body text-xs leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default SecuritySection;

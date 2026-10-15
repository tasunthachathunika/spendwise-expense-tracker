import React, { useState } from 'react';
import { ShieldCheck, Lock, UserCheck, CheckCircle2, Shield } from 'lucide-react';

const SECURITY_CARDS = [
  {
    step: '01',
    icon: ShieldCheck,
    title: 'JWT Authentication',
    description:
      'Stateless JSON Web Tokens with cryptographically signed payloads ensure tamper-proof user sessions across every request.',
  },
  {
    step: '02',
    icon: Lock,
    title: 'bcrypt Password Hashing',
    description:
      'Passwords are salted and irreversibly hashed with 12 rounds of bcrypt before touching MongoDB. Plaintext passwords are never stored or returned.',
  },
  {
    step: '03',
    icon: UserCheck,
    title: 'Protected Routes',
    description:
      'Backend authentication middleware verifies tokens on every mutation. All database queries are strictly scoped to your verified user ID.',
  },
  {
    step: '04',
    icon: CheckCircle2,
    title: 'Validated Input',
    description:
      'Server-side validation and field whitelisting on every write endpoint safeguard financial records against malformed inputs.',
  },
];

const TRUST_CHIPS = [
  { icon: ShieldCheck, label: 'JWT sessions' },
  { icon: Lock, label: 'bcrypt hashing' },
  { icon: UserCheck, label: 'Per-user data isolation' },
  { icon: CheckCircle2, label: 'Server-side validation' },
];

const Security = () => {
  const [lightImgFailed, setLightImgFailed] = useState(false);
  const [darkImgFailed, setDarkImgFailed] = useState(false);

  return (
    <section
      id="security"
      aria-labelledby="security-title"
      className="relative isolate overflow-hidden scroll-mt-24 py-24 lg:py-32 bg-cream transition-colors"
    >
      {/* ─── Background Layer (z-0) ─── */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        {/* Fallback Layer: Dotted Grid + Ambient Circles + Watermark Shield */}
        <div className="security-dotted-grid absolute inset-0 opacity-40 dark:opacity-20" />
        <div className="absolute -top-28 -left-28 w-96 h-96 rounded-full bg-brand/10 pointer-events-none" />
        <div className="absolute -bottom-28 -right-28 w-96 h-96 rounded-full bg-info/10 pointer-events-none" />

        {/* Subtle Watermark Shield in Line Token */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] text-line pointer-events-none opacity-[0.06] flex items-center justify-center">
          <Shield className="w-full h-full stroke-[1.2]" />
        </div>

        {/* Light Mode High-Resolution Background Image */}
        {!lightImgFailed && (
          <img
            src="/landing/security-bg.webp"
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            width={2560}
            height={1440}
            onError={() => setLightImgFailed(true)}
            className="absolute inset-0 h-full w-full object-cover object-center dark:hidden"
          />
        )}

        {/* Dark Mode High-Resolution Background Image */}
        {!darkImgFailed && (
          <img
            src="/landing/security-bg-dark.webp"
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            width={2560}
            height={1440}
            onError={() => setDarkImgFailed(true)}
            className="hidden dark:block absolute inset-0 h-full w-full object-cover object-center"
          />
        )}

        {/* Readability Overlays: Top and Bottom gradient to cream-band to blend with adjacent sections */}
        <div className="absolute inset-0 bg-gradient-to-b from-cream-band via-transparent to-cream-band pointer-events-none" />

        {/* Dark Mode Uniform Tint: Prevents image from overpowering text in dark theme */}
        <div className="hidden dark:block absolute inset-0 bg-cream/40 pointer-events-none" />
      </div>

      {/* ─── Content Layer (z-10) ─── */}
      <div className="container-page relative z-10">

        {/* Centered Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 lg:mb-12">
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-brand block mb-3">
            SECURITY ARCHITECTURE
          </span>
          <h2
            id="security-title"
            tabIndex={-1}
            className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-bold text-ink tracking-tight leading-[1.15] max-w-2xl mx-auto text-balance outline-none focus-visible:ring-2 focus-visible:ring-brand/50 rounded-lg px-2"
          >
            Built with privacy and security at the core
          </h2>
          <p
            className="mt-4 text-base sm:text-lg text-ink-body max-w-xl mx-auto leading-relaxed"
            style={{ textShadow: '0 1px 12px rgb(var(--cream) / 0.8)' }}
          >
            Your personal financial data is strictly isolated to your authenticated account.
          </p>

          {/* Trust Chips Row (Verified facts only) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-6">
            {TRUST_CHIPS.map((chip) => {
              const ChipIcon = chip.icon;
              return (
                <div
                  key={chip.label}
                  className="rounded-full bg-card/75 border border-line text-xs sm:text-sm px-3.5 py-1.5 backdrop-blur-xs flex items-center gap-2 text-ink-body font-medium shadow-2xs"
                >
                  <ChipIcon className="w-3.5 h-3.5 text-brand flex-shrink-0" />
                  <span>{chip.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 mt-12 lg:mt-14 items-stretch">
          {SECURITY_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="security-glass-card relative overflow-hidden rounded-3xl border border-line p-6 lg:p-7 shadow-[0_8px_30px_rgb(var(--ink)/0.08)] dark:shadow-none dark:border-line-light/40 flex flex-col justify-between group transition-all duration-250 hover:-translate-y-1.5 hover:border-brand/40 focus-within:-translate-y-1.5 focus-within:border-brand/40 motion-reduce:transform-none motion-reduce:transition-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/50 dark:before:bg-white/[0.06] before:pointer-events-none"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand border border-brand/20 flex items-center justify-center mb-6 flex-shrink-0 transition-transform duration-250 group-hover:scale-105 group-focus-within:scale-105">
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-ink mb-2 tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-sm text-ink-body leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Security;

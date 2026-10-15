import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Github,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Send,
  ArrowUp,
  Lock,
  Mail,
  Heart,
  Linkedin,
  Twitter,
  FileText,
  X,
  Layers,
  Database,
  Cpu,
  Coins
} from 'lucide-react';
import toast from 'react-hot-toast';
import SpendWiseLogo from './SpendWiseLogo';

const TECH_STACK = [
  { name: 'React 18', bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' },
  { name: 'Tailwind CSS', bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' },
  { name: 'Node.js', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  { name: 'Express', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  { name: 'MongoDB', bg: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' },
  { name: 'Vite', bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  { name: 'Recharts', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
  { name: 'jsPDF', bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
];

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState(null); // 'privacy' | 'terms' | 'security' | null

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSubscribed(true);
    toast.success('🎉 You are now subscribed to SpendWise product updates!');
    setNewsletterEmail('');
  };

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-cream via-cream-band to-[#ede4ce] dark:from-[#14110d] dark:via-[#191510] dark:to-[#0c0a08] border-t border-line text-ink-body transition-colors">
      
      {/* ─── Glowing Ambient Lights & Tech Grid Background ───────────────── */}
      <div
        className="absolute -top-36 right-1/4 w-[500px] h-[500px] bg-brand/12 dark:bg-brand/15 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -left-20 w-[420px] h-[420px] bg-emerald-500/10 dark:bg-emerald-500/12 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-1/3 w-[350px] h-[350px] bg-cyan-500/8 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Subtle Dot Matrix Grid */}
      <div
        className="absolute inset-0 bg-[radial-gradient(#ea580c_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.035] dark:opacity-[0.06] pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Hairline Glowing Gradient Accent */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-brand/60 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        
        {/* ─── 1. Modern Interactive Newsletter & Status Card ────────────── */}
        <div className="relative rounded-3xl p-6 sm:p-8 md:p-10 mb-16 overflow-hidden bg-gradient-to-br from-card/90 via-card/60 to-brand/5 dark:from-card/75 dark:via-card/45 dark:to-brand/10 border border-line/90 shadow-xl shadow-brand/5 backdrop-blur-md">
          
          {/* Subtle card glow border */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand/10 dark:bg-brand/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Heading & Value Prop */}
            <div className="lg:col-span-7 space-y-3.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light border border-brand/20">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Financial Mindfulness</span>
              </div>

              <h3 className="font-serif font-bold text-2xl sm:text-3xl text-ink tracking-tight leading-snug">
                Master your personal wealth with clarity & intent
              </h3>

              <p className="text-sm text-ink-soft leading-relaxed max-w-xl">
                Stay updated on new budgeting features, export enhancements, and personal finance strategies for mindful everyday living.
              </p>

              {/* Live Status Indicators */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                {/* 100% Operational Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Systems 100% Operational</span>
                </div>

                {/* Sri Lanka Currency Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-medium">
                  <Coins className="w-3.5 h-3.5" />
                  <span>Sri Lanka (LKR Rs.) Native</span>
                </div>

                {/* Encryption Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-medium">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Encrypted Ledger</span>
                </div>
              </div>
            </div>

            {/* Right Column: Newsletter Subscription Box */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              {subscribed ? (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm">You&apos;re subscribed!</h4>
                    <p className="text-xs opacity-90">Thank you for joining our community of mindful spenders.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Mail className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="Enter your email..."
                        className="w-full bg-cream-band dark:bg-card/90 border border-line focus:border-brand text-ink text-sm rounded-xl pl-10 pr-3.5 py-3 outline-none transition shadow-inner placeholder:text-ink-soft/70"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-brand to-brand-dark hover:from-brand-light hover:to-brand text-white font-semibold text-sm shadow-md shadow-brand/25 hover:shadow-brand/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                      <span>Join</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-ink-soft/80 flex items-center gap-1.5 pl-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand flex-shrink-0" />
                    <span>No spam. Strict privacy. Unsubscribe anytime.</span>
                  </p>
                </form>
              )}
            </div>

          </div>
        </div>

        {/* ─── 2. 4-Column High-Hierarchy Directory Grid ──────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-line">
          
          {/* Column 1: Brand, Mission, & Socials (Span 4) */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="inline-flex hover:opacity-95 transition-opacity group">
              <SpendWiseLogo size="md" showTagline={true} />
            </Link>

            <p className="text-sm text-ink-soft leading-relaxed max-w-sm">
              SpendWise is a personal expense and budget management system engineered for clarity, speed, and real financial awareness.
            </p>

            {/* Region & Currency Chip */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card/60 dark:bg-card/40 border border-line text-xs text-ink-soft">
              <span className="text-base leading-none">🇱🇰</span>
              <span>Built for Sri Lankan Rupees &bull; <strong className="text-ink">LKR (Rs.)</strong></span>
            </div>

            {/* Social Media Links */}
            <div className="pt-1">
              <span className="text-xs font-semibold text-ink uppercase tracking-wider block mb-2.5">
                Connect With Us
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://github.com/tasunthachathunika/spendwise-expense-tracker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-card border border-line hover:border-brand/40 text-ink-soft hover:text-brand flex items-center justify-center transition-all hover:-translate-y-0.5 shadow-xs"
                  aria-label="GitHub Repository"
                  title="GitHub Repository"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-card border border-line hover:border-[#0077b5]/40 text-ink-soft hover:text-[#0077b5] flex items-center justify-center transition-all hover:-translate-y-0.5 shadow-xs"
                  aria-label="LinkedIn Profile"
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-card border border-line hover:border-[#1da1f2]/40 text-ink-soft hover:text-[#1da1f2] flex items-center justify-center transition-all hover:-translate-y-0.5 shadow-xs"
                  aria-label="Twitter / X"
                  title="Twitter / X"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => toast('Have questions? Feel free to reach out via GitHub issues or email!', { icon: '💬' })}
                  className="w-9 h-9 rounded-xl bg-card border border-line hover:border-brand/40 text-ink-soft hover:text-brand flex items-center justify-center transition-all hover:-translate-y-0.5 shadow-xs cursor-pointer"
                  aria-label="Contact Support"
                  title="Contact Support"
                >
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Column 2: Product & Features (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand"></span>
              <h4 className="font-semibold text-xs uppercase tracking-widest text-ink">
                Product
              </h4>
            </div>
            
            <ul className="space-y-3 text-sm text-ink-soft">
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('features')}
                  className="hover:text-brand hover:translate-x-1 transition-all cursor-pointer text-left flex items-center gap-1.5 group"
                >
                  <span className="text-ink-soft/40 group-hover:text-brand transition-colors">&rsaquo;</span>
                  <span>Features</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('how-it-works')}
                  className="hover:text-brand hover:translate-x-1 transition-all cursor-pointer text-left flex items-center gap-1.5 group"
                >
                  <span className="text-ink-soft/40 group-hover:text-brand transition-colors">&rsaquo;</span>
                  <span>How It Works</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('budgets')}
                  className="hover:text-brand hover:translate-x-1 transition-all cursor-pointer text-left flex items-center gap-1.5 group"
                >
                  <span className="text-ink-soft/40 group-hover:text-brand transition-colors">&rsaquo;</span>
                  <span>Budget System</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-brand/10 text-brand border border-brand/20">
                    PRO
                  </span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('security')}
                  className="hover:text-brand hover:translate-x-1 transition-all cursor-pointer text-left flex items-center gap-1.5 group"
                >
                  <span className="text-ink-soft/40 group-hover:text-brand transition-colors">&rsaquo;</span>
                  <span>Security</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('faq')}
                  className="hover:text-brand hover:translate-x-1 transition-all cursor-pointer text-left flex items-center gap-1.5 group"
                >
                  <span className="text-ink-soft/40 group-hover:text-brand transition-colors">&rsaquo;</span>
                  <span>FAQ</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Account & Portals (Span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <h4 className="font-semibold text-xs uppercase tracking-widest text-ink">
                Account & Portals
              </h4>
            </div>

            <ul className="space-y-3 text-sm text-ink-soft">
              <li>
                <Link
                  to="/login"
                  className="hover:text-brand hover:translate-x-1 transition-all flex items-center gap-1.5 group"
                >
                  <span className="text-ink-soft/40 group-hover:text-brand transition-colors">&rsaquo;</span>
                  <span>Sign In</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="hover:text-brand hover:translate-x-1 transition-all flex items-center gap-1.5 group"
                >
                  <span className="text-ink-soft/40 group-hover:text-brand transition-colors">&rsaquo;</span>
                  <span>Create Free Account</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    FREE
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="hover:text-brand hover:translate-x-1 transition-all flex items-center gap-1.5 group"
                >
                  <span className="text-ink-soft/40 group-hover:text-brand transition-colors">&rsaquo;</span>
                  <span>Dashboard Overview</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/transactions"
                  className="hover:text-brand hover:translate-x-1 transition-all flex items-center gap-1.5 group"
                >
                  <span className="text-ink-soft/40 group-hover:text-brand transition-colors">&rsaquo;</span>
                  <span>Transactions Ledger</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                    LIVE
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/analytics"
                  className="hover:text-brand hover:translate-x-1 transition-all flex items-center gap-1.5 group"
                >
                  <span className="text-ink-soft/40 group-hover:text-brand transition-colors">&rsaquo;</span>
                  <span>Monthly Analytics</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Engineering & Tech Stack (Span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              <h4 className="font-semibold text-xs uppercase tracking-widest text-ink">
                Full-Stack Architecture
              </h4>
            </div>

            {/* GitHub Repo Card */}
            <a
              href="https://github.com/tasunthachathunika/spendwise-expense-tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-2xl bg-card border border-line hover:border-brand/50 transition-all flex flex-col gap-2 group shadow-xs hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-ink group-hover:text-brand transition-colors" />
                  <span className="font-semibold text-xs text-ink truncate">spendwise-expense-tracker</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-ink-soft group-hover:text-brand transition-colors" />
              </div>
              <p className="text-[11px] text-ink-soft">
                Explore the open-source code on GitHub. Contributions welcome!
              </p>
            </a>

            {/* Colorful Tech Stack Badges */}
            <div>
              <p className="text-[11px] font-semibold text-ink-soft uppercase tracking-wider mb-2">
                Tech Stack
              </p>
              <div className="flex flex-wrap gap-1.5">
                {TECH_STACK.map((tech) => (
                  <span
                    key={tech.name}
                    className={`text-[11px] font-medium px-2.5 py-0.5 rounded-lg border transition-all hover:scale-105 cursor-default ${tech.bg}`}
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ─── 3. Bottom Legal & Copyright Bar ────────────────────────────── */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-5 text-xs text-ink-soft">
          
          {/* Left: Copyright & Mission */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <span>&copy; {new Date().getFullYear()} SpendWise Personal Finance.</span>
            <span className="hidden sm:inline text-line-light">&bull;</span>
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for financial awareness.
            </span>
          </div>

          {/* Center: Legal Modals / Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveLegalModal('privacy')}
              className="hover:text-brand transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-line-light">&bull;</span>
            <button
              type="button"
              onClick={() => setActiveLegalModal('terms')}
              className="hover:text-brand transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <span className="text-line-light">&bull;</span>
            <button
              type="button"
              onClick={() => scrollTo('security')}
              className="hover:text-brand transition-colors cursor-pointer"
            >
              Security Architecture
            </button>
          </div>

          {/* Right: Back to Top Floating Button */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-card border border-line hover:border-brand/40 text-ink-soft hover:text-ink shadow-xs hover:shadow-md transition-all cursor-pointer font-medium hover:-translate-y-0.5"
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <div className="w-5 h-5 rounded-lg bg-cream-band dark:bg-card-hover flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
              <ArrowUp className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </button>

        </div>

      </div>

      {/* ─── 4. Accessible Legal & Policy Modal ───────────────────────────── */}
      {activeLegalModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveLegalModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-card border border-line rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2 font-serif font-bold text-lg text-ink">
                <FileText className="w-5 h-5 text-brand" />
                <span>
                  {activeLegalModal === 'privacy' && 'Privacy Policy'}
                  {activeLegalModal === 'terms' && 'Terms of Service'}
                  {activeLegalModal === 'security' && 'Security Whitepaper'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveLegalModal(null)}
                className="w-8 h-8 rounded-xl bg-cream-band dark:bg-card-hover border border-line text-ink-soft hover:text-ink flex items-center justify-center transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-ink-soft leading-relaxed">
              {activeLegalModal === 'privacy' && (
                <>
                  <p className="font-semibold text-ink">
                    1. Data Sovereignty &amp; Zero Ad Tracking
                  </p>
                  <p>
                    SpendWise is built with strict privacy at its foundation. We do not sell, rent, or monetize your personal financial records or transaction history with third-party advertisers.
                  </p>
                  <p className="font-semibold text-ink">
                    2. Encryption and Authentication
                  </p>
                  <p>
                    All passwords are salted and hashed with bcrypt. Requests are securely verified with stateless JSON Web Tokens (JWT) ensuring only you have access to your budgets and ledgers.
                  </p>
                  <p className="font-semibold text-ink">
                    3. Local Storage &amp; Cookies
                  </p>
                  <p>
                    We store your session token and theme preferences locally in your browser for seamless re-authentication. No marketing tracking pixels or third-party cookies are used.
                  </p>
                </>
              )}

              {activeLegalModal === 'terms' && (
                <>
                  <p className="font-semibold text-ink">
                    1. Educational &amp; Personal Finance Tracking
                  </p>
                  <p>
                    SpendWise is provided as an open-source personal financial tool to assist in tracking everyday expenses and budgets. It is not an accredited financial advisory firm.
                  </p>
                  <p className="font-semibold text-ink">
                    2. User Responsibilities
                  </p>
                  <p>
                    Users are responsible for keeping their credentials secure. You may export or delete your transaction data at any point from your dashboard.
                  </p>
                  <p className="font-semibold text-ink">
                    3. Open Source Usage
                  </p>
                  <p>
                    The codebase is maintained under the MIT license on GitHub for educational and non-commercial community benefit.
                  </p>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-line flex justify-end">
              <button
                type="button"
                onClick={() => setActiveLegalModal(null)}
                className="px-5 py-2 rounded-xl bg-brand text-white font-semibold text-xs shadow-md shadow-brand/20 hover:bg-brand-dark transition cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

    </footer>
  );
};

export default Footer;

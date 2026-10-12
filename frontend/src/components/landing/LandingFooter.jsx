import React from 'react';
import { Link } from 'react-router-dom';
import { WalletCards, Github, Shield, ExternalLink } from 'lucide-react';

const LandingFooter = () => {
  const scrollTo = (id) => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-cream-band dark:bg-[#111827] border-t border-line py-16 text-sm text-ink-body">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 pb-12 border-b border-line">
          
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white shadow-md shadow-brand/20">
                <WalletCards className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="font-serif font-bold text-xl tracking-tight text-ink">
                Spend<span className="text-brand">Wise</span>
              </span>
            </Link>
            <p className="mt-4 text-ink-soft text-sm leading-relaxed max-w-sm">
              A modern, production-grade personal expense and budget tracking application engineered to give you complete visibility over every rupee.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-ink-soft font-semibold px-3 py-1 rounded-full bg-cream dark:bg-[#161f30] border border-line">
              <Shield className="w-3.5 h-3.5 text-brand" />
              <span>Full-Stack MERN Architecture</span>
            </div>
          </div>

          {/* Col 3: Product Navigation */}
          <div>
            <div className="font-serif font-bold text-ink mb-4 text-base">Product</div>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => scrollTo('features')}
                  className="hover:text-brand transition-colors cursor-pointer text-left"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('how-it-works')}
                  className="hover:text-brand transition-colors cursor-pointer text-left"
                >
                  How it works
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('budgets')}
                  className="hover:text-brand transition-colors cursor-pointer text-left"
                >
                  Budget system
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('security')}
                  className="hover:text-brand transition-colors cursor-pointer text-left"
                >
                  Security
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Account */}
          <div>
            <div className="font-serif font-bold text-ink mb-4 text-base">Account</div>
            <ul className="space-y-2.5">
              <li>
                <Link to="/login" className="hover:text-brand transition-colors">
                  Sign in
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand transition-colors">
                  Create account
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-brand transition-colors">
                  Live dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Open Source & Code */}
          <div>
            <div className="font-serif font-bold text-ink mb-4 text-base">Project</div>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://github.com/tasunthachathunika/spendwise-expense-tracker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-brand transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub repository</span>
                  <ExternalLink className="w-3 h-3 text-ink-soft" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/tasunthachathunika/spendwise-expense-tracker#readme"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-brand transition-colors"
                >
                  <span>Project README</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-soft">
          <div>
            © {new Date().getFullYear()} SpendWise. Built as a full-stack MERN project.
          </div>
          <div className="flex items-center gap-6">
            <span>Currency: LKR (Rs.)</span>
            <span>•</span>
            <span>MongoDB + Express + React + Node.js</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default LandingFooter;

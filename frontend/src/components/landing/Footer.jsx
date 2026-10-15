import React from 'react';
import { Link } from 'react-router-dom';
import { Github, ArrowUpRight } from 'lucide-react';
import SpendWiseLogo from './SpendWiseLogo';

const Footer = () => {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-cream-band border-t border-line pt-10 lg:pt-12 pb-7 text-ink-body transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 4 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 pb-8 border-b border-line">
          
          {/* Column 1: Brand & Bio */}
          <div className="space-y-2.5">
            <Link to="/" className="inline-flex hover:opacity-90 transition-opacity">
              <SpendWiseLogo size="md" showTagline={true} />
            </Link>

            <p className="text-sm text-ink-soft leading-relaxed">
              Personal expense and budget tracking engineered for simplicity, speed, and real financial awareness.
            </p>
          </div>

          {/* Column 2: Product Links */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-ink mb-3">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-ink-soft">
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('features')}
                  className="hover:text-brand transition cursor-pointer text-left"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('how-it-works')}
                  className="hover:text-brand transition cursor-pointer text-left"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('budgets')}
                  className="hover:text-brand transition cursor-pointer text-left"
                >
                  Budget System
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('security')}
                  className="hover:text-brand transition cursor-pointer text-left"
                >
                  Security
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollTo('faq')}
                  className="hover:text-brand transition cursor-pointer text-left"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Account Links */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-ink mb-3">
              Account
            </h4>
            <ul className="space-y-2 text-sm text-ink-soft">
              <li>
                <Link to="/login" className="hover:text-brand transition">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand transition">
                  Create Free Account
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-brand transition">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/transactions" className="hover:text-brand transition">
                  Transactions Ledger
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Project & Repository */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-ink mb-3">
              Project
            </h4>
            <ul className="space-y-2 text-sm text-ink-soft">
              <li>
                <a
                  href="https://github.com/tasunthachathunika/spendwise-expense-tracker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-brand transition group"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub Repository</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li className="text-xs text-ink-soft pt-0.5">
                React 18 • Tailwind CSS • Vite
              </li>
              <li className="text-xs text-ink-soft">
                Node.js • Express • MongoDB
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-soft">
          <p>© {new Date().getFullYear()} SpendWise. Built as a full-stack MERN project.</p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-brand transition cursor-pointer"
            >
              Back to top ↑
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

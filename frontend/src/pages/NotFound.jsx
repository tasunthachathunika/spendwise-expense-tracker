import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft, Home } from 'lucide-react';
import SpendWiseLogo from '../components/landing/SpendWiseLogo';

const NotFound = () => {
  useEffect(() => {
    document.title = 'Page Not Found — SpendWise';
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col justify-between p-6 sm:p-10 transition-colors">
      {/* Header */}
      <header className="flex items-center justify-between max-w-6xl w-full mx-auto">
        <Link to="/" className="inline-flex items-center">
          <SpendWiseLogo size="sm" showTagline={false} />
        </Link>
        <Link
          to="/dashboard"
          className="text-xs font-semibold text-ink-soft hover:text-ink transition flex items-center gap-1.5"
        >
          <Home size={14} />
          <span>Dashboard</span>
        </Link>
      </header>

      {/* Main 404 Hero */}
      <main className="max-w-md w-full mx-auto my-12 text-center bg-bg-card border border-line rounded-3xl p-8 sm:p-12 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Compass className="w-8 h-8 stroke-[2.2]" />
        </div>

        <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand">
          Error 404
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink mt-2 mb-3">
          Page Not Found
        </h1>

        <p className="text-sm text-ink-soft leading-relaxed mb-8">
          The page or financial resource you are looking for does not exist or may have been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-sm transition shadow-sm"
          >
            <Home size={16} />
            <span>Go to Dashboard</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-bg-secondary hover:bg-cream-hover text-ink border border-line font-semibold text-sm transition"
          >
            <ArrowLeft size={16} />
            <span>Home Page</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-ink-muted">
        SpendWise Personal Finance Tracker • Team 405
      </footer>
    </div>
  );
};

export default NotFound;

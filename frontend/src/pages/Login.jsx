import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import SpendWiseLogo from '../components/landing/SpendWiseLogo';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Login = () => {
  useDocumentTitle('Sign In');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', formData);
      if (res.data.success) {
        login(res.data.token, res.data.user);
        toast.success(`Welcome back, ${res.data.user.name}!`);
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-cream font-sans selection:bg-brand selection:text-white">
      {/* ─── LEFT COLUMN: Brand Panel (Hidden below lg, Fixed Dark Brand Styling) ─── */}
      <aside className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden h-screen min-h-[640px] p-10 xl:p-14 bg-[#14110d]">
        {/* Background Photo with Boosted Clarity & Slow Ken Burns Zoom */}
        {!imgError && (
          <img
            src="/auth-bg.webp"
            alt=""
            aria-hidden="true"
            decoding="async"
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none brightness-110 contrast-105 saturate-110 animate-ken-burns will-change-transform"
          />
        )}

        {/* Faint Dotted Grid Fallback (visible if image fails) */}
        {imgError && (
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
            aria-hidden="true"
          />
        )}

        {/* Flat, Light Multi-layer Overlay Stack: Middle stays bright */}
        {/* (a) Uniform light tint */}
        <div className="absolute inset-0 bg-[#14110d]/25 pointer-events-none" aria-hidden="true" />

        {/* (b) Warm glow */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(234,88,12,0.20),transparent_60%)] pointer-events-none"
          aria-hidden="true"
        />

        {/* (d) Top gradient behind logo (top 20%) */}
        <div
          className="absolute top-0 inset-x-0 h-[20%] bg-gradient-to-b from-[#14110d]/55 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* (c) Bottom gradient over lower 60% */}
        <div
          className="absolute bottom-0 inset-x-0 h-[60%] bg-gradient-to-t from-[#14110d]/90 via-[#14110d]/45 via-50% to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Content: Top-left Brand Logo (Matches Register Page) */}
        <div className="relative z-10">
          <SpendWiseLogo size="md" onDark={true} asLink={true} />
        </div>

        {/* Content: Bottom Editorial Block */}
        <div className="relative z-10 max-w-lg text-left space-y-4 xl:space-y-5">
          {/* Eyebrow with 24px orange accent line */}
          <div
            className="flex items-center gap-2.5 animate-auth-fade-up"
            style={{ animationDelay: '0ms' }}
          >
            <span className="w-6 h-[2px] bg-[#ea580c] rounded-full flex-shrink-0" aria-hidden="true" />
            <span className="text-xs uppercase tracking-widest text-[#ea580c] font-semibold">
              Welcome back
            </span>
          </div>

          {/* Main Statement */}
          <p
            className="font-serif font-semibold text-2xl xl:text-3xl leading-snug tracking-tight text-balance text-[#fdf9ef] animate-auth-fade-up"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.45)', animationDelay: '80ms' }}
          >
            Smart budgeting, precise expense tracking, and real-time financial intelligence built for modern life.
          </p>

          {/* 3 Compact Feature Cards */}
          <div className="space-y-2.5">
            {/* Feature 1: Live Cashflow Analytics */}
            <div
              className="rounded-2xl border border-white/15 bg-[#14110d]/55 backdrop-blur-sm px-4 py-3 flex items-center gap-3 hover:bg-[#14110d]/65 hover:border-white/25 transition-all duration-200 shadow-lg shadow-black/20 animate-auth-fade-up"
              style={{ animationDelay: '160ms' }}
            >
              <div className="w-10 h-10 rounded-xl bg-[#4ade80]/15 border border-[#4ade80]/25 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-[#4ade80]" strokeWidth={2.3} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[#fdf9ef]">
                  Live Cashflow Analytics
                </div>
                <div className="text-[13px] text-[#d6cdbd] leading-snug xl:truncate mt-0.5">
                  Track income vs expenses with responsive charts.
                </div>
              </div>
            </div>

            {/* Feature 2: Dynamic Budget Limits */}
            <div
              className="rounded-2xl border border-white/15 bg-[#14110d]/55 backdrop-blur-sm px-4 py-3 flex items-center gap-3 hover:bg-[#14110d]/65 hover:border-white/25 transition-all duration-200 shadow-lg shadow-black/20 animate-auth-fade-up"
              style={{ animationDelay: '240ms' }}
            >
              <div className="w-10 h-10 rounded-xl bg-[#fbbf24]/15 border border-[#fbbf24]/25 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#fbbf24]" strokeWidth={2.3} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[#fdf9ef]">
                  Dynamic Budget Limits
                </div>
                <div className="text-[13px] text-[#d6cdbd] leading-snug xl:truncate mt-0.5">
                  Instant warnings when spending crosses thresholds.
                </div>
              </div>
            </div>

            {/* Feature 3: Multi-Category Filtering */}
            <div
              className="rounded-2xl border border-white/15 bg-[#14110d]/55 backdrop-blur-sm px-4 py-3 flex items-center gap-3 hover:bg-[#14110d]/65 hover:border-white/25 transition-all duration-200 shadow-lg shadow-black/20 animate-auth-fade-up"
              style={{ animationDelay: '320ms' }}
            >
              <div className="w-10 h-10 rounded-xl bg-[#38bdf8]/15 border border-[#38bdf8]/25 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-[#38bdf8]" strokeWidth={2.3} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[#fdf9ef]">
                  Multi-Category Filtering
                </div>
                <div className="text-[13px] text-[#d6cdbd] leading-snug xl:truncate mt-0.5">
                  Organize and search transactions effortlessly.
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── RIGHT COLUMN: Form Panel (bg-cream with theme tokens only) ─── */}
      <main className="relative flex-1 flex flex-col justify-center px-6 py-8 sm:py-10 lg:px-12 xl:px-16 bg-cream border-l border-line/60 min-h-screen lg:h-screen lg:overflow-y-auto">
        {/* Faint Dotted Grid Background with radial mask */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, rgb(var(--line)) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 20%, transparent 75%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 w-full max-w-md mx-auto my-auto">
          {/* Mobile-only Logo (Shown centered above Back button when left panel is hidden below lg) */}
          <div className="lg:hidden flex justify-center mb-6">
            <SpendWiseLogo size="md" asLink={true} />
          </div>

          {/* Back Button (Colourful pill with hover nudge and focus ring) */}
          <div className="mb-5 sm:mb-6">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-brand-soft text-brand border border-brand/30 hover:bg-brand hover:text-white hover:border-brand shadow-sm hover:shadow-md hover:shadow-brand/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
            >
              <ArrowLeft
                className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1"
                strokeWidth={2.2}
              />
              <span>Back to landing page</span>
            </Link>
          </div>

          {/* Heading Accent Bar & Titles */}
          <div className="mb-5 sm:mb-6">
            <div className="w-10 h-[3px] rounded-full bg-brand mb-3" aria-hidden="true" />
            <h2 className="font-serif font-bold tracking-tight text-3xl xl:text-4xl text-ink">
              Sign in to SpendWise
            </h2>
            <p className="font-sans text-sm sm:text-base text-ink-soft mt-1.5">
              Enter your credentials to access your financial dashboard.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            {/* Decoy hidden inputs to prevent browser password managers from auto-filling */}
            <input type="text" name="decoy_user" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" autoComplete="off" />
            <input type="password" name="decoy_pass" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" autoComplete="off" />

            {/* Email Field */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold uppercase tracking-wider text-ink-soft mb-1.5"
              >
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft group-focus-within:text-brand transition-colors duration-200">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  name="spendwise-email"
                  type="email"
                  required
                  autoComplete="off"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line bg-card text-ink text-sm md:text-base placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all duration-200 shadow-2xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold uppercase tracking-wider text-ink-soft mb-1.5"
              >
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft group-focus-within:text-brand transition-colors duration-200">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  name="spendwise-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-line bg-card text-ink text-sm md:text-base placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all duration-200 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-soft hover:text-ink transition cursor-pointer p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-xs sm:text-sm pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-ink-body select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-line text-brand focus:ring-brand accent-brand cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => toast('To reset your credentials, please contact your administrator.', { duration: 4000 })}
                className="font-medium text-brand hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-brand hover:bg-brand-dark text-white font-semibold text-sm md:text-base py-3 rounded-xl shadow-lg shadow-brand/25 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 cursor-pointer mt-5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    strokeWidth={2.2}
                  />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation Links */}
          <div className="mt-6 pt-5 border-t border-line/60 text-center space-y-3">
            <p className="text-sm text-ink-soft">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-brand font-semibold hover:underline">
                Create one here
              </Link>
            </p>

            <div>
              <Link
                to="/"
                className="text-xs text-ink-soft hover:text-ink transition-colors inline-flex items-center gap-1.5 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to SpendWise Landing Page</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;

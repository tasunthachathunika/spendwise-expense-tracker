import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Zap,
  Check,
} from 'lucide-react';
import SpendWiseLogo from '../components/landing/SpendWiseLogo';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const getPasswordStrength = (pwd) => {
  if (!pwd) return null;
  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasDigit = /\d/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
  const typesCount = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length;

  if (pwd.length < 6) {
    return { score: 1, label: 'Weak', barClass: 'bg-expense', textClass: 'text-expense' };
  }
  if (pwd.length >= 12 || (pwd.length >= 8 && typesCount >= 3)) {
    return { score: 4, label: 'Strong', barClass: 'bg-income', textClass: 'text-income' };
  }
  if (pwd.length >= 8 && typesCount >= 2) {
    return { score: 3, label: 'Good', barClass: 'bg-info', textClass: 'text-info' };
  }
  return { score: 2, label: 'Fair', barClass: 'bg-warn', textClass: 'text-warn' };
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imgError, setImgError] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (backendError) {
      setBackendError('');
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setBackendError('');

    try {
      const res = await api.post('/auth/register', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (res.data.success) {
        login(res.data.token, res.data.user);
        toast.success(`Account created! Welcome, ${res.data.user.name}`);
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setBackendError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

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

        {/* Re-balanced Overlay Stack: Photo remains luminous in the center */}
        {/* (a) Light uniform tint */}
        <div className="absolute inset-0 bg-[#14110d]/25 pointer-events-none" aria-hidden="true" />

        {/* (b) Soft warm glow */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(234,88,12,0.20),transparent_60%)] pointer-events-none"
          aria-hidden="true"
        />

        {/* (c) Top readability gradient behind logo (top 20%) */}
        <div
          className="absolute top-0 inset-x-0 h-[20%] bg-gradient-to-b from-[#14110d]/55 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* (c) Left-and-bottom readability gradient covering lower 55% */}
        <div
          className="absolute bottom-0 inset-x-0 h-[55%] bg-gradient-to-t from-[#14110d]/90 via-[#14110d]/45 via-45% to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Content: Top Logo */}
        <div className="relative z-10">
          <SpendWiseLogo size="md" onDark={true} asLink={true} />
        </div>

        {/* Content: Bottom Editorial Block */}
        <div className="relative z-10 max-w-lg text-left">
          {/* Eyebrow with 24px orange accent line */}
          <div
            className="flex items-center gap-2.5 mb-3 animate-auth-fade-up"
            style={{ animationDelay: '0ms' }}
          >
            <span className="w-6 h-[2px] bg-[#ea580c] rounded-full flex-shrink-0" aria-hidden="true" />
            <span className="text-xs uppercase tracking-widest text-[#ea580c] font-semibold">
              Join SpendWise
            </span>
          </div>

          {/* Heading */}
          <h1
            className="font-serif text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight text-[#fdf9ef] text-balance animate-auth-fade-up"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.45)', animationDelay: '80ms' }}
          >
            Take full control of your financial journey today.
          </h1>

          {/* Paragraph */}
          <p
            className="font-sans text-base xl:text-lg text-[#d6cdbd] leading-relaxed mt-4 animate-auth-fade-up"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.45)', animationDelay: '160ms' }}
          >
            Set targets, cut down wasteful expenses, and achieve financial clarity.
          </p>

          {/* 3 Compact Glass Trust Pills */}
          <div
            className="mt-6 flex flex-wrap items-center gap-2.5 text-sm animate-auth-fade-up"
            style={{ animationDelay: '240ms' }}
          >
            <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm text-[#fdf9ef] bg-white/10 border border-white/15 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-[#ea580c] flex-shrink-0" strokeWidth={2.2} />
              <span className="whitespace-nowrap">JWT authentication</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm text-[#fdf9ef] bg-white/10 border border-white/15 backdrop-blur-md">
              <Lock className="w-4 h-4 text-[#ea580c] flex-shrink-0" strokeWidth={2.2} />
              <span className="whitespace-nowrap">bcrypt-hashed passwords</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm text-[#fdf9ef] bg-white/10 border border-white/15 backdrop-blur-md">
              <Zap className="w-4 h-4 text-[#ea580c] flex-shrink-0" strokeWidth={2.2} />
              <span className="whitespace-nowrap">Real-time LKR tracking</span>
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
              <span>Back to home</span>
            </Link>
          </div>

          {/* Heading Accent Bar & Titles */}
          <div className="mb-5">
            <div className="w-10 h-[3px] rounded-full bg-brand mb-3" aria-hidden="true" />
            <h2 className="font-serif font-bold tracking-tight text-3xl xl:text-4xl text-ink">
              Create an account
            </h2>
            <p className="font-sans text-sm sm:text-base text-ink-soft mt-1.5">
              Start tracking your income and expenses in seconds.
            </p>
          </div>

          {/* Backend Error Banner */}
          {backendError && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-xl bg-expense/10 border border-expense/30 text-expense text-sm flex items-start gap-2.5 animate-in fade-in duration-200"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="leading-snug">{backendError}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold uppercase tracking-wider text-ink-soft mb-1.5"
              >
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft group-focus-within:text-brand transition-colors duration-200">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  className={`w-full bg-card border rounded-xl pl-10 pr-3.5 py-2.5 text-sm md:text-base text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all duration-200 shadow-2xs ${
                    errors.name ? 'border-expense focus:border-expense focus:ring-expense/30' : 'border-line'
                  }`}
                />
              </div>
              {errors.name && (
                <p id="name-error" className="text-sm text-expense flex items-center gap-1.5 mt-1">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-ink-soft mb-1.5"
              >
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft group-focus-within:text-brand transition-colors duration-200">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className={`w-full bg-card border rounded-xl pl-10 pr-3.5 py-2.5 text-sm md:text-base text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all duration-200 shadow-2xs ${
                    errors.email ? 'border-expense focus:border-expense focus:ring-expense/30' : 'border-line'
                  }`}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-sm text-expense flex items-center gap-1.5 mt-1">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-ink-soft mb-1.5"
              >
                Password (min. 6 characters)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft group-focus-within:text-brand transition-colors duration-200">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className={`w-full bg-card border rounded-xl pl-10 pr-10 py-2.5 text-sm md:text-base text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all duration-200 shadow-2xs ${
                    errors.password ? 'border-expense focus:border-expense focus:ring-expense/30' : 'border-line'
                  }`}
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

              {/* Password Strength Visual Meter */}
              {passwordStrength && (
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="flex-1 flex items-center gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${
                          step <= passwordStrength.score ? passwordStrength.barClass : 'bg-line'
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`text-xs font-semibold ${passwordStrength.textClass}`}
                    aria-live="polite"
                  >
                    {passwordStrength.label}
                  </span>
                </div>
              )}

              {errors.password && (
                <p id="password-error" className="text-sm text-expense flex items-center gap-1.5 mt-1">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold uppercase tracking-wider text-ink-soft mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft group-focus-within:text-brand transition-colors duration-200">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                  className={`w-full bg-card border rounded-xl pl-10 pr-16 py-2.5 text-sm md:text-base text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all duration-200 shadow-2xs ${
                    errors.confirmPassword
                      ? 'border-expense focus:border-expense focus:ring-expense/30'
                      : 'border-line'
                  }`}
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center gap-2">
                  {formData.confirmPassword &&
                    formData.password &&
                    formData.confirmPassword === formData.password && (
                      <Check
                        className="w-4 h-4 text-income flex-shrink-0 animate-in fade-in duration-200"
                        strokeWidth={2.5}
                      />
                    )}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="text-ink-soft hover:text-ink transition cursor-pointer p-0.5"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="text-sm text-expense flex items-center gap-1.5 mt-1">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
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
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create account</span>
                  <ArrowRight
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    strokeWidth={2.2}
                  />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-5 text-center text-sm text-ink-soft">
            <span>Already have an account? </span>
            <Link to="/login" className="text-brand font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;

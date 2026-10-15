import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  DollarSign,
  Receipt,
  ShieldCheck,
  Target,
  Sun,
  Moon,
  LogOut,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  TriangleAlert,
  Trash2,
  X,
  Download,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { formatDate, getInitials, formatLKR, useCurrency } from '../utils/helpers';
import api from '../utils/api';
import toast from 'react-hot-toast';

// ─── Error Boundary Component (Guarantees Page Never Renders Blank) ───────────
class ProfileErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Profile Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-xl mx-auto my-12 p-8 rounded-2xl bg-card border border-line text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-expense/10 text-expense mx-auto flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-ink">We couldn't load your profile</h2>
          <p className="text-sm text-ink-soft mt-2 mb-6">
            An unexpected error occurred while rendering your profile. Please try reloading.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-sm transition shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try again</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Helper: Password Strength Evaluation ─────────────────────────────────────
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

// ─── Main Profile View ────────────────────────────────────────────────────────
const ProfileContent = () => {
  const { user, logout, updateUser } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const navigate = useNavigate();

  // State
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [txCount, setTxCount] = useState(null);
  const [activeBudget, setActiveBudget] = useState(null);

  // Personal Info Form
  const [name, setName] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSuccess, setNameSuccess] = useState('');
  const [nameError, setNameError] = useState('');

  // Password Change Form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Delete Account Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const deleteTriggerRef = useRef(null);
  const deletePasswordRef = useRef(null);
  const deleteDialogRef = useRef(null);

  // Fetch initial profile & stats from real APIs
  const fetchProfileData = async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      // 1. Fetch current user from /api/auth/me
      const meRes = await api.get('/auth/me');
      if (meRes.data.success && meRes.data.user) {
        updateUser(meRes.data.user);
        setName(meRes.data.user.name || '');
      } else if (user) {
        setName(user.name || '');
      }

      // 2. Fetch real transaction count
      try {
        const txRes = await api.get('/transactions?limit=1');
        if (txRes.data.success && typeof txRes.data.total === 'number') {
          setTxCount(txRes.data.total);
        }
      } catch (txErr) {
        // Non-fatal, keep txCount as null
      }

      // 3. Fetch active budget (monthly or custom period)
      try {
        const budgetRes = await api.get('/budgets/current');
        if (budgetRes.data?.success && budgetRes.data?.budget) {
          setActiveBudget(budgetRes.data.budget);
        } else {
          setActiveBudget(null);
        }
      } catch (bErr) {
        // Non-fatal, keep activeBudget as null
      }
    } catch (err) {
      console.error('Failed to load profile details:', err);
      if (user) {
        setName(user.name || '');
      } else {
        setProfileError('Failed to load profile information from server.');
      }
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // Update Name Handler
  const handleUpdateName = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) {
      setNameError('Name must be at least 2 characters.');
      return;
    }
    if (trimmed.length > 50) {
      setNameError('Name cannot exceed 50 characters.');
      return;
    }

    setNameSaving(true);
    setNameError('');
    setNameSuccess('');

    try {
      const res = await api.put('/auth/profile', { name: trimmed });
      if (res.data.success) {
        updateUser(res.data.user);
        setNameSuccess('Profile name updated successfully.');
        toast.success('Profile updated!');
        setTimeout(() => setNameSuccess(''), 4000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update name.';
      setNameError(msg);
      toast.error(msg);
    } finally {
      setNameSaving(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError('New password must be different from current password.');
      return;
    }

    setPasswordSaving(true);

    try {
      const res = await api.put('/auth/password', {
        currentPassword,
        newPassword,
      });

      if (res.data.success) {
        setPasswordSuccess('Password changed successfully.');
        toast.success('Password updated successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setTimeout(() => setPasswordSuccess(''), 4000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password.';
      setPasswordError(msg);
      toast.error(msg);
    } finally {
      setPasswordSaving(false);
    }
  };

  // Sign out handler
  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully.');
    navigate('/login');
  };

  // Lock body scroll and set initial focus when delete dialog opens
  useEffect(() => {
    if (isDeleteDialogOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        deletePasswordRef.current?.focus();
      }, 50);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape' && !isDeleting) {
          e.preventDefault();
          closeDeleteDialog();
          return;
        }

        // Focus trap
        if (e.key === 'Tab' && deleteDialogRef.current) {
          const focusableElements = deleteDialogRef.current.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), a[href]:not([disabled])'
          );
          if (focusableElements.length > 0) {
            const first = focusableElements[0];
            const last = focusableElements[focusableElements.length - 1];

            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isDeleteDialogOpen, isDeleting]);

  const openDeleteDialog = () => {
    setDeletePassword('');
    setShowDeletePassword(false);
    setDeleteConfirmation('');
    setDeleteError('');
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    if (isDeleting) return;
    setIsDeleteDialogOpen(false);
    setDeletePassword('');
    setDeleteConfirmation('');
    setDeleteError('');
    // Restore focus to delete trigger button
    setTimeout(() => {
      deleteTriggerRef.current?.focus();
    }, 50);
  };

  const handleConfirmDeleteAccount = async (e) => {
    if (e) e.preventDefault();
    if (deleteConfirmation !== 'DELETE' || !deletePassword.trim()) return;

    setIsDeleting(true);
    setDeleteError('');

    try {
      const res = await api.delete('/auth/account', {
        data: {
          password: deletePassword,
          confirmation: deleteConfirmation,
        },
      });

      if (res.data?.success) {
        sessionStorage.setItem(
          'sw_account_deleted_toast',
          'Your account and all associated data have been permanently deleted.'
        );
        closeDeleteDialog();
        logout();
        navigate('/', { replace: true });
      } else {
        setDeleteError(res.data?.message || 'Failed to delete account.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Server error while deleting account. Please try again.';
      setDeleteError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const isDeleteValid = deletePassword.trim().length > 0 && deleteConfirmation === 'DELETE';

  // Loading skeleton state
  if (profileLoading && !user) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-4 w-64 bg-line rounded" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-card border border-line rounded-2xl p-6 h-80" />
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-line rounded-2xl p-6 h-56" />
            <div className="bg-card border border-line rounded-2xl p-6 h-72" />
          </div>
        </div>
      </div>
    );
  }

  // Error fallback card
  if (profileError && !user) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-2xl bg-card border border-line text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-expense/10 text-expense mx-auto flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-ink">We couldn't load your profile</h2>
        <p className="text-sm text-ink-soft mt-2 mb-6">{profileError}</p>
        <button
          onClick={fetchProfileData}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-sm transition shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try again</span>
        </button>
      </div>
    );
  }

  const currentUser = user || {};
  const currentDisplayName = name || currentUser.name || 'User';
  const avatarInitials = getInitials(currentDisplayName) || 'U';
  const isNameDirty = name.trim() !== (currentUser.name || '') && name.trim().length >= 2;
  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  // Real "Member Since" month and year
  const memberSinceText = currentUser.createdAt
    ? formatDate(currentUser.createdAt, { month: 'long', year: 'numeric' })
    : 'Recent Member';

  return (
    <div className="max-w-6xl mx-auto">
      {/* Subtitle only — avoids duplicating the Topbar title */}
      <div className="mb-6">
        <p className="text-sm text-ink-soft">
          Manage your personal identity, login security, and dashboard preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── LEFT COLUMN: Identity Card ─────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-line rounded-2xl p-6 text-center shadow-xs flex flex-col items-center sticky top-24 transition-all">
            {/* Live Interactive Avatar */}
            <div className="relative">
              <div
                className="w-24 h-24 rounded-full bg-brand text-white flex items-center justify-center font-serif text-3xl font-bold ring-4 ring-brand-soft shadow-md shadow-brand/20 select-none"
                aria-label={`Avatar for ${currentDisplayName}`}
              >
                {avatarInitials}
              </div>
            </div>

            {/* Display Name & Email */}
            <h2 className="font-serif text-xl font-bold text-ink mt-4 truncate w-full" title={currentDisplayName}>
              {currentDisplayName}
            </h2>
            <p className="text-sm text-ink-soft truncate w-full mt-0.5" title={currentUser.email || ''}>
              {currentUser.email || 'user@example.com'}
            </p>

            {/* Account Status Badge */}
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-income/10 text-income border border-income/20">
                <span className="w-1.5 h-1.5 rounded-full bg-income animate-pulse" />
                Account active
              </span>
            </div>

            <div className="w-full border-t border-line my-5" />

            {/* Real Verified Account Facts */}
            <div className="w-full space-y-3 text-left">
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-ink-soft flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand" />
                  Member since
                </span>
                <span className="font-semibold text-ink">{memberSinceText}</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-ink-soft flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-income" />
                  Primary Currency
                </span>
                <span className="font-semibold text-ink">
                  {currency === 'USD' ? 'USD ($)' : 'LKR (Rs.)'}
                </span>
              </div>

              {txCount !== null && (
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-ink-soft flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-warn" />
                    Transactions recorded
                  </span>
                  <span className="font-semibold text-ink">{txCount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-ink-soft flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-brand" />
                  Active Budget
                </span>
                <span className="font-semibold text-ink truncate max-w-[150px] text-right" title={activeBudget ? `${activeBudget.label}: ${formatLKR(activeBudget.amount)}` : 'No budget set'}>
                  {activeBudget ? activeBudget.label : 'None'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-ink-soft flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-info" />
                  Security level
                </span>
                <span className="font-semibold text-income">Standard JWT</span>
              </div>
            </div>

            {/* Quick Mobile-friendly Sign out button */}
            <div className="w-full mt-6 pt-4 border-t border-line lg:hidden">
              <button
                onClick={handleLogout}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-card hover:bg-cream-hover text-ink text-sm font-semibold transition"
              >
                <LogOut className="w-4 h-4 text-expense" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Stacked Settings Cards ───────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Settings Preview Panel: Active Budget / This Month at a Glance */}
          <section className="bg-card border border-line rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-ink">
                  {activeBudget?.periodType === 'custom' ? 'Active budget at a glance' : 'This month at a glance'}
                </h3>
                <p className="text-sm text-ink-soft mt-0.5">
                  {activeBudget
                    ? `Current active budget threshold for ${activeBudget.label}`
                    : 'Track your current spending cycle against your limit.'}
                </p>
              </div>
              {activeBudget?.periodType === 'custom' && (
                <span className="self-start sm:self-auto text-xs bg-info/10 text-info border border-info/20 font-bold px-2.5 py-0.5 rounded-full">
                  Custom Period
                </span>
              )}
            </div>

            {activeBudget ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-cream-band border border-line rounded-xl text-xs">
                  <div>
                    <span className="text-ink-soft block font-medium">Period</span>
                    <span className="font-bold text-ink text-sm">{activeBudget.label}</span>
                  </div>
                  <div>
                    <span className="text-ink-soft block font-medium">Budget Limit</span>
                    <span className="font-bold text-ink text-sm">{formatLKR(activeBudget.amount)}</span>
                  </div>
                  <div>
                    <span className="text-ink-soft block font-medium">Spent to Date</span>
                    <span className="font-bold text-expense text-sm">{formatLKR(activeBudget.spent)}</span>
                  </div>
                  <div>
                    <span className="text-ink-soft block font-medium">Remaining</span>
                    <span className={`font-bold text-sm ${activeBudget.remaining < 0 ? 'text-expense' : 'text-income'}`}>
                      {formatLKR(activeBudget.remaining)}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-cream-band h-2 rounded-full overflow-hidden border border-line">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      activeBudget.percent >= 90 ? 'bg-expense' : activeBudget.percent >= 70 ? 'bg-warn' : 'bg-brand'
                    }`}
                    style={{ width: `${Math.min(activeBudget.percent, 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-cream-band border border-line flex items-center justify-between">
                <span className="text-xs text-ink-soft">No active budget set for current period.</span>
                <button
                  type="button"
                  onClick={() => navigate('/budgets')}
                  className="text-xs font-semibold text-brand hover:text-brand-dark transition cursor-pointer"
                >
                  Set budget &rarr;
                </button>
              </div>
            )}
          </section>

          {/* Card 1: Personal Information */}
          <section className="bg-card border border-line rounded-2xl p-6 shadow-xs">
            <div className="mb-5">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-ink">Personal information</h3>
              <p className="text-sm text-ink-soft mt-0.5">
                Update your display name. This name will appear across your financial dashboard and receipts.
              </p>
            </div>

            {nameSuccess && (
              <div
                role="status"
                className="mb-4 p-3 rounded-xl bg-income/10 border border-income/30 text-income text-sm flex items-center gap-2 animate-in fade-in"
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{nameSuccess}</span>
              </div>
            )}

            {nameError && (
              <div
                role="alert"
                className="mb-4 p-3 rounded-xl bg-expense/10 border border-expense/30 text-expense text-sm flex items-center gap-2 animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{nameError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-xs font-semibold uppercase tracking-wider text-ink-soft mb-1.5">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft group-focus-within:text-brand transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (nameError) setNameError('');
                    }}
                    placeholder="Your full name"
                    className="w-full bg-card border border-line rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="emailAddress" className="block text-xs font-semibold uppercase tracking-wider text-ink-soft mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="emailAddress"
                    type="email"
                    readOnly
                    disabled
                    value={currentUser.email || ''}
                    className="w-full bg-cream-band/60 border border-line rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-ink-soft cursor-not-allowed select-none"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-ink-soft mt-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Email address cannot be changed once registered.</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!isNameDirty || nameSaving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-sm transition shadow-sm hover:shadow-brand/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {nameSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{nameSaving ? 'Saving...' : 'Save changes'}</span>
                </button>
              </div>
            </form>
          </section>

          {/* Card 2: Security & Change Password */}
          <section className="bg-card border border-line rounded-2xl p-6 shadow-xs">
            <div className="mb-5">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-ink">Change password</h3>
              <p className="text-sm text-ink-soft mt-0.5">
                Ensure your account is using a strong password with at least 6 characters.
              </p>
            </div>

            {passwordSuccess && (
              <div
                role="status"
                className="mb-4 p-3 rounded-xl bg-income/10 border border-income/30 text-income text-sm flex items-center gap-2 animate-in fade-in"
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div
                role="alert"
                className="mb-4 p-3 rounded-xl bg-expense/10 border border-expense/30 text-expense text-sm flex items-center gap-2 animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label htmlFor="currentPassword" className="block text-xs font-semibold uppercase tracking-wider text-ink-soft mb-1.5">
                  Current Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft group-focus-within:text-brand transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, currentPassword: e.target.value });
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder="••••••••"
                    className="w-full bg-card border border-line rounded-xl pl-10 pr-10 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-soft hover:text-ink transition cursor-pointer p-0.5"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-xs font-semibold uppercase tracking-wider text-ink-soft mb-1.5">
                  New Password (min. 6 characters)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft group-focus-within:text-brand transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, newPassword: e.target.value });
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder="••••••••"
                    className="w-full bg-card border border-line rounded-xl pl-10 pr-10 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-soft hover:text-ink transition cursor-pointer p-0.5"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                    <span className={`text-xs font-semibold ${passwordStrength.textClass}`} aria-live="polite">
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-ink-soft mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-soft group-focus-within:text-brand transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder="••••••••"
                    className="w-full bg-card border border-line rounded-xl pl-10 pr-10 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-soft hover:text-ink transition cursor-pointer p-0.5"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={passwordSaving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-sm transition shadow-sm hover:shadow-brand/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {passwordSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{passwordSaving ? 'Updating...' : 'Update password'}</span>
                </button>
              </div>
            </form>
          </section>

          {/* Card 3: Preferences (Appearance & Currency) */}
          <section className="bg-card border border-line rounded-2xl p-6 shadow-xs">
            <div className="mb-5">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-ink">Preferences</h3>
              <p className="text-sm text-ink-soft mt-0.5">
                Customize your theme appearance and regional currency settings.
              </p>
            </div>

            <div className="space-y-4 divide-y divide-line">
              {/* Appearance Mode */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div>
                  <span className="text-sm font-semibold text-ink block">Theme Appearance</span>
                  <span className="text-xs text-ink-soft">Select between Warm Cream and Warm Dark theme.</span>
                </div>
                {/* Segmented Light / Dark Toggle */}
                <div className="inline-flex p-1 rounded-xl bg-cream-band border border-line self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setTheme && setTheme('light')}
                    aria-pressed={!isDark}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      !isDark
                        ? 'bg-card text-ink shadow-xs border border-line'
                        : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Light (Warm Cream)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme && setTheme('dark')}
                    aria-pressed={isDark}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      isDark
                        ? 'bg-card text-ink shadow-xs border border-line'
                        : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-brand" />
                    <span>Dark (Warm Fintech)</span>
                  </button>
                </div>
              </div>

              {/* Currency Preference Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-line/60">
                <div>
                  <span className="text-sm font-semibold text-ink block">Base Currency</span>
                  <span className="text-xs text-ink-soft">
                    All transaction values and metrics are evaluated in {currency === 'USD' ? 'US Dollar • USD ($)' : 'Sri Lankan Rupee • LKR (Rs.)'}.
                  </span>
                </div>
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-cream-band border border-line w-fit">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrency('LKR');
                      toast.success('Base currency set to Sri Lankan Rupee • LKR (Rs.)');
                    }}
                    aria-pressed={currency === 'LKR'}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      currency === 'LKR'
                        ? 'bg-card text-ink shadow-xs border border-line'
                        : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${currency === 'LKR' ? 'bg-income' : 'bg-ink-soft/40'}`} />
                    <span>LKR (Rs.)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrency('USD');
                      toast.success('Base currency set to US Dollar • USD ($)');
                    }}
                    aria-pressed={currency === 'USD'}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      currency === 'USD'
                        ? 'bg-card text-ink shadow-xs border border-line'
                        : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${currency === 'USD' ? 'bg-income' : 'bg-ink-soft/40'}`} />
                    <span>USD ($)</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Card 4: Session & Sign Out */}
          <section className="bg-card border border-line rounded-2xl p-6 shadow-xs hidden lg:block">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-ink">Active Session</h3>
                <p className="text-sm text-ink-soft mt-0.5">
                  Sign out of your active session on this device.
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-card hover:bg-cream-hover text-ink hover:text-expense hover:border-expense/40 text-sm font-semibold transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </section>

          {/* Card 5: Danger Zone */}
          <section
            aria-labelledby="danger-zone-heading"
            className="rounded-2xl border border-expense/30 bg-expense/5 p-5 lg:p-6 transition-colors shadow-xs"
          >
            {/* Header Row */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-expense/10 text-expense border border-expense/20 flex items-center justify-center flex-shrink-0">
                <TriangleAlert className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 id="danger-zone-heading" className="font-serif text-lg sm:text-xl font-bold text-expense tracking-tight">
                  Danger zone
                </h3>
                <p className="text-sm text-ink-soft mt-0.5">
                  Permanent actions that cannot be undone.
                </p>
              </div>
            </div>

            {/* Action Row */}
            <div className="border-t border-expense/20 mt-4 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="max-w-xl">
                <h4 className="text-sm font-semibold text-ink">
                  Delete account
                </h4>
                <p className="text-sm text-ink-body mt-0.5 leading-relaxed">
                  Permanently delete your account, transactions, budgets and settings. This action cannot be undone.
                </p>
              </div>
              <button
                ref={deleteTriggerRef}
                type="button"
                onClick={openDeleteDialog}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-card text-expense border border-expense/40 hover:bg-expense hover:text-white hover:border-expense hover:shadow-md hover:shadow-expense/20 focus-visible:ring-2 focus-visible:ring-expense/40 active:scale-[0.98] transition-all duration-200 cursor-pointer w-full md:w-auto flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete account</span>
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* ─── Confirmation Dialog (role="alertdialog") ───────────────────── */}
      {isDeleteDialogOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4 max-sm:items-end max-sm:p-0 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) {
              closeDeleteDialog();
            }
          }}
          role="presentation"
        >
          <div
            ref={deleteDialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            aria-describedby="delete-account-desc"
            className="bg-card border border-line rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 max-h-[90vh] max-sm:rounded-b-none max-sm:max-h-[92vh] overflow-y-auto relative animate-in zoom-in-95 duration-150 motion-reduce:animate-none"
          >
            {/* Close X Button */}
            <button
              type="button"
              onClick={closeDeleteDialog}
              disabled={isDeleting}
              aria-label="Close"
              className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-cream-band text-ink-soft hover:text-ink hover:bg-cream-hover flex items-center justify-center border border-line transition cursor-pointer disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="w-12 h-12 rounded-2xl bg-expense/10 text-expense border border-expense/20 flex items-center justify-center flex-shrink-0 mb-4 shadow-2xs">
              <TriangleAlert className="w-6 h-6 stroke-[2.2]" />
            </div>

            <h3
              id="delete-account-title"
              className="font-serif text-xl sm:text-2xl font-bold text-ink tracking-tight"
            >
              Delete your account?
            </h3>

            <p
              id="delete-account-desc"
              className="text-sm text-ink-body mt-2 leading-relaxed"
            >
              This will permanently delete your account and all of your data. This cannot be undone.
            </p>

            {/* What will be deleted List */}
            <div className="mt-4 p-3.5 rounded-xl bg-cream-band border border-line space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-soft block">
                What will be deleted
              </span>
              <ul className="space-y-1.5 text-xs text-ink-body">
                <li className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-expense flex-shrink-0" />
                  <span>Your profile and login credentials</span>
                </li>
                <li className="flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5 text-expense flex-shrink-0" />
                  <span>
                    All income and expense transactions
                    {typeof txCount === 'number' ? ` (${txCount.toLocaleString()} recorded)` : ''}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-expense flex-shrink-0" />
                  <span>All monthly budgets, custom periods and preferences</span>
                </li>
              </ul>
            </div>

            {/* Tip Row: Export Advice */}
            <div className="rounded-xl bg-info/10 border border-info/20 p-3 mt-3 flex items-start gap-2.5 text-xs text-ink-body">
              <Download className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-ink font-semibold block">Want a copy first?</span>
                <span>Export your transactions as CSV or PDF before deleting.</span>
                <Link
                  to="/transactions"
                  onClick={closeDeleteDialog}
                  className="font-semibold text-info hover:underline block mt-1"
                >
                  Go to Transactions Ledger &rarr;
                </Link>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmDeleteAccount} className="mt-4 space-y-3.5">
              {/* Password Field */}
              <div>
                <label
                  htmlFor="delete-password"
                  className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5"
                >
                  Enter your password to confirm
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ink-soft absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="delete-password"
                    ref={deletePasswordRef}
                    type={showDeletePassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    disabled={isDeleting}
                    value={deletePassword}
                    onChange={(e) => {
                      setDeletePassword(e.target.value);
                      setDeleteError('');
                    }}
                    placeholder="••••••••"
                    className="w-full bg-card border border-line rounded-xl py-2.5 pl-10 pr-10 text-sm text-ink focus:ring-2 focus:ring-expense/30 focus:border-expense outline-none transition disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    aria-label={showDeletePassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition cursor-pointer"
                  >
                    {showDeletePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmation Text Field */}
              <div>
                <label
                  htmlFor="delete-confirm"
                  className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5"
                >
                  Type{' '}
                  <span className="font-mono font-bold bg-cream-band border border-line px-1.5 py-0.5 rounded text-xs text-ink">
                    DELETE
                  </span>{' '}
                  to confirm
                </label>
                <input
                  id="delete-confirm"
                  type="text"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  disabled={isDeleting}
                  value={deleteConfirmation}
                  onChange={(e) => {
                    setDeleteConfirmation(e.target.value);
                    setDeleteError('');
                  }}
                  placeholder="DELETE"
                  className="w-full bg-card border border-line rounded-xl py-2.5 px-3 text-sm text-ink font-mono focus:ring-2 focus:ring-expense/30 focus:border-expense outline-none transition disabled:opacity-50"
                />
              </div>

              {/* Error Banner */}
              {deleteError && (
                <div
                  role="alert"
                  className="bg-expense/10 border border-expense/30 text-expense rounded-xl p-3 text-xs sm:text-sm flex items-start gap-2.5 mt-2"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{deleteError}</span>
                </div>
              )}

              {/* Buttons Footer */}
              <div className="pt-4 border-t border-line flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeDeleteDialog}
                  disabled={isDeleting}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-line bg-card hover:bg-cream-hover text-ink text-sm font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isDeleteValid || isDeleting}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-expense text-white hover:opacity-90 font-semibold text-sm transition shadow-md shadow-expense/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Exported Component with Error Boundary Wrap ──────────────────────────────
const Profile = () => {
  return (
    <ProfileErrorBoundary>
      <ProfileContent />
    </ProfileErrorBoundary>
  );
};

export default Profile;

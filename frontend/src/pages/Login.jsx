import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WalletCards, ShieldCheck, TrendingUp, BarChart3, Lock, Mail } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
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
    <div className="auth-page">
      {/* Visual Showcase Panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand-icon">
            <WalletCards size={36} color="#fff" />
          </div>
          <h1 className="auth-brand-name">SpendWise</h1>
          <p className="auth-brand-tagline">
            Smart budgeting, precise expense tracking, and real-time financial intelligence built for modern life.
          </p>

          <div className="auth-features">
            <div className="auth-feature-item">
              <div className="auth-feature-icon" style={{ background: 'rgba(34, 197, 94, 0.2)' }}>
                <TrendingUp size={20} color="#22c55e" />
              </div>
              <div>
                <div className="auth-feature-text">Live Cashflow Analytics</div>
                <div className="text-xs text-gray-400">Track income vs expenses with responsive charts.</div>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon" style={{ background: 'rgba(245, 158, 11, 0.2)' }}>
                <ShieldCheck size={20} color="#f59e0b" />
              </div>
              <div>
                <div className="auth-feature-text">Dynamic Budget Limits</div>
                <div className="text-xs text-gray-400">Instant warnings when spending crosses thresholds.</div>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon" style={{ background: 'rgba(108, 99, 255, 0.2)' }}>
                <BarChart3 size={20} color="#8b85ff" />
              </div>
              <div>
                <div className="auth-feature-text">Multi-Category Filtering</div>
                <div className="text-xs text-gray-400">Organize and search transactions effortlessly.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Form Panel */}
      <div className="auth-right">
        <div className="auth-form-container">
          <h2 className="auth-form-title">Sign in to SpendWise</h2>
          <p className="auth-form-subtitle">Enter your credentials to access your financial dashboard.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="form-control"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary w-full py-3" disabled={loading}>
              {loading && <span className="spinner"></span>}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider space-y-2">
            <div>
              Don't have an account yet? <Link to="/register">Create one here</Link>
            </div>
            <div>
              <Link to="/landing" className="text-xs text-ink-muted hover:text-brand transition inline-flex items-center gap-1">
                ← Back to SpendWise Landing Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

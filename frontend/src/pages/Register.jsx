import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WalletCards, ShieldCheck, Lock, Mail, User } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter your full name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (res.data.success) {
        login(res.data.token, res.data.user);
        toast.success(`Account created! Welcome, ${res.data.user.name}`);
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand-icon">
            <WalletCards size={36} color="#fff" />
          </div>
          <h1 className="auth-brand-name">SpendWise</h1>
          <p className="auth-brand-tagline">
            Take full control of your financial journey today. Set targets, cut down wasteful expenses, and achieve financial clarity.
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <h2 className="auth-form-title">Create an Account</h2>
          <p className="auth-form-subtitle">Start tracking your income and expenses in seconds.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                placeholder="John Doe"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password (Min. 6 chars)</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="form-control"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="form-control"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary w-full py-3" disabled={loading}>
              {loading && <span className="spinner"></span>}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-divider space-y-2">
            <div>
              Already have an account? <Link to="/login">Sign in here</Link>
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

export default Register;

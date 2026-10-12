import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">My Profile</h2>
          <p className="page-subtitle">Personal account information and security status</p>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>

        <div className="text-center">
          <h3 className="profile-name">{user?.name || 'Authorized User'}</h3>
          <p className="profile-email">{user?.email || 'user@example.com'}</p>
        </div>

        <div className="w-full space-y-3 mt-4">
          <div className="profile-detail-row">
            <User size={18} className="text-indigo-400" />
            <span className="profile-detail-label">Full Name:</span>
            <span className="profile-detail-value">{user?.name || '—'}</span>
          </div>

          <div className="profile-detail-row">
            <Mail size={18} className="text-emerald-400" />
            <span className="profile-detail-label">Email:</span>
            <span className="profile-detail-value">{user?.email || '—'}</span>
          </div>

          <div className="profile-detail-row">
            <Calendar size={18} className="text-amber-400" />
            <span className="profile-detail-label">Member Since:</span>
            <span className="profile-detail-value">
              {user?.createdAt ? formatDate(user.createdAt, { dateStyle: 'long' }) : '—'}
            </span>
          </div>

          <div className="profile-detail-row">
            <Shield size={18} className="text-blue-400" />
            <span className="profile-detail-label">Security:</span>
            <span className="profile-detail-value text-green-400 font-semibold">
              JWT Authenticated & Bcrypt Hashed
            </span>
          </div>
        </div>

        <button 
          onClick={handleLogout} 
          className="btn btn-danger w-full mt-6"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  PieChart, 
  Target, 
  User, 
  LogOut,
  WalletCards
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { to: '/budgets', label: 'Budgets', icon: Target },
    { to: '/analytics', label: 'Analytics', icon: PieChart },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Logo */}
        <div className="sidebar-logo">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand to-brand-light flex items-center justify-center shadow-lg shadow-brand/20 flex-shrink-0">
            <WalletCards size={22} className="text-brand-dark" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-ink flex items-center">
              Spend<span className="text-brand">Wise</span>
            </span>
            <span className="text-[10px] text-ink-muted block uppercase tracking-wider font-semibold">
              Emerald Wealth
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <div className="nav-label">Menu</div>
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="nav-icon" />
              <span>{label}</span>
            </NavLink>
          ))}

          {/* Logout Action */}
          <button onClick={handleLogout} className="nav-item logout">
            <LogOut className="nav-icon" />
            <span>Sign Out</span>
          </button>
        </nav>

        {/* Footer User Info */}
        <div className="sidebar-footer">
          <div className="flex items-center gap-3">
            <div className="user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

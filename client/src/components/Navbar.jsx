import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Menu, X, Bell, LogOut, LayoutDashboard, Ticket, Clock, Sun, Moon,
  ChevronDown, User, Settings, History
} from 'lucide-react';

const Navbar = ({ darkMode, setDarkMode }) => {
  const { user, logout } = useAuth();
  const { notifications, markAllRead } = useSocket() || {};
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
  };

  const navLinks = user ? (
    user.role === 'admin'
      ? [
          { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/admin/services', label: 'Services', icon: Settings },
        ]
      : [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/book', label: 'Book Token', icon: Ticket },
          { to: '/queue', label: 'Live Queue', icon: Clock },
          { to: '/history', label: 'History', icon: History },
        ]
  ) : [];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-gray-200/50 dark:border-gray-700/50" style={{borderRadius: 0}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/'} className="flex items-center gap-2 no-underline">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <span className="text-xl font-bold text-gradient">SmartQ</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all no-underline ${
                  isActive(to)
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user && (
              <>
                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) markAllRead?.(); }}
                    className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse-slow">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in z-50">
                      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications?.length > 0 ? notifications.slice(0, 10).map((n) => (
                          <div key={n.id} className={`p-4 border-b border-gray-50 dark:border-gray-700/50 ${!n.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                          </div>
                        )) : (
                          <div className="p-8 text-center text-gray-400">
                            <Bell size={32} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No notifications yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{user.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">{user.name?.split(' ')[0]}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in z-50">
                      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 font-medium">
                          {user.role}
                        </span>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {!user && (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm no-underline">Log In</Link>
                <Link to="/signup" className="btn-primary text-sm no-underline">Get Started</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-700 animate-fade-in">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium no-underline ${
                  isActive(to)
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
            {!user && (
              <div className="mt-4 flex flex-col gap-2 px-4">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-sm text-center no-underline">Log In</Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary text-sm text-center no-underline">Get Started</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

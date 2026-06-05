import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Terminal, LogOut, Settings, Sun, Moon, Sparkles, FolderGit2, Menu, X } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.slice(0, 2).toUpperCase();
  };

  const isLinkActive = (path) => location.pathname === path;

  const closeMenus = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-darkBorder bg-white/85 dark:bg-darkBg/85 backdrop-blur-xl transition-colors duration-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group" onClick={closeMenus}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accentBlue/10 border border-accentBlue/30 text-accentBlue transition group-hover:scale-105">
            <Terminal className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <h1 className="text-md font-bold tracking-tight text-slate-800 dark:text-white">GitFix</h1>
            <span className="text-[10px] font-sans text-slate-400 dark:text-slate-500">AI Conflict Merger</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
        <Link
          to="/"
          onClick={closeMenus}
          className={`text-sm font-sans transition-colors ${
            isLinkActive('/')
              ? 'text-accentBlue font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Home
        </Link>
        <a
          href="#features"
          className="text-sm font-sans text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          Pipeline
        </a>
        </nav>

        {/* Action / Dropdown Section */}
        <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden md:flex md:items-center md:gap-4">
        {user ? (
          <div className="relative flex items-center gap-3" ref={dropdownRef}>
            <Link
              to="/dashboard"
              onClick={closeMenus}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-accentBlue/40 bg-accentBlue/5 px-3 py-1.5 text-xs font-sans text-accentBlue transition hover:bg-accentBlue/10"
            >
              <FolderGit2 className="h-3.5 w-3.5" /> Workspace
            </Link>

            <Link
              to="/repo-manager"
              onClick={closeMenus}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-accentBlue/40 bg-accentBlue/5 px-3 py-1.5 text-xs font-mono text-accentBlue transition hover:bg-accentBlue/10"
            >
              <Sparkles className="h-3.5 w-3.5" /> Repo Manager
            </Link>

            {/* Profile Dropdown Toggle */}
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-300 bg-slate-100 text-slate-700 transition-all duration-200 hover:border-accentBlue focus:outline-none dark:border-darkBorder dark:bg-slate-900 dark:text-slate-300"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none'; // Fallback to letter
                  }}
                />
              ) : (
                <span className="text-xs font-sans font-bold">{getInitials(user.username)}</span>
              )}
            </button>

            {/* Dropdown Menu Box */}
            {dropdownOpen && (
              <div className="absolute right-0 top-11 w-56 rounded-xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-slate-900 p-2.5 shadow-2xl transition-all duration-200 text-left">
                {/* Profile header */}
                <div className="px-3.5 py-3 border-b border-slate-100 dark:border-darkBorder/40 mb-2">
                  <p className="text-xs font-sans font-semibold text-slate-800 dark:text-white truncate">
                    {user.username}
                  </p>
                  <p className="text-[10px] font-sans text-slate-400 dark:text-slate-500 truncate mt-0.5">
                    {user.email}
                  </p>
                </div>

                {/* Navigation items */}
                <div className="space-y-0.5">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-sans rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-darkPanel/50 hover:text-slate-800 dark:hover:text-white transition"
                  >
                    <Settings className="h-4 w-4" /> Edit Profile
                  </Link>

                  <Link
                    to="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-sans rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-darkPanel/50 hover:text-slate-800 dark:hover:text-white transition"
                  >
                    <FolderGit2 className="h-4 w-4" /> Go to Workspace
                  </Link>

                  <Link
                    to="/repo-manager"
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-mono rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-darkPanel/50 hover:text-slate-800 dark:hover:text-white transition"
                  >
                    <Sparkles className="h-4 w-4" /> Repo Manager
                  </Link>

                  <Link
                    to="/history"
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-mono rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-darkPanel/50 hover:text-slate-800 dark:hover:text-white transition"
                  >
                    <FolderGit2 className="h-4 w-4" /> History
                  </Link>

                  {/* Dark Mode Toggle Switch within dropdown */}
                  <button
                    onClick={toggleTheme}
                    className="flex w-full items-center justify-between px-3 py-2 text-xs font-sans rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-darkPanel/50 hover:text-slate-800 dark:hover:text-white transition"
                  >
                    <span className="flex items-center gap-2">
                      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                      {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                    </span>
                    <span className="h-4 w-7 rounded-full bg-slate-200 dark:bg-slate-700 relative p-0.5 flex items-center">
                      <span
                        className={`h-3 w-3 rounded-full bg-white dark:bg-slate-400 shadow-md transform transition duration-200 ${
                          theme === 'dark' ? 'translate-x-3' : 'translate-x-0'
                        }`}
                      ></span>
                    </span>
                  </button>

                  <div className="border-t border-slate-100 dark:border-darkBorder/40 my-2"></div>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-sans rounded-lg text-accentRed hover:bg-accentRed/5 transition"
                  >
                    <LogOut className="h-4 w-4" /> Logout Workspace
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick theme control for public users */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-200 dark:border-darkBorder hover:bg-slate-50 dark:hover:bg-darkPanel text-slate-600 dark:text-slate-400 transition"
              title="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            <Link
              to="/login"
              className="px-4 py-2 rounded-lg text-xs font-sans font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-sans font-semibold bg-accentBlue text-white hover:bg-blue-600 shadow-md transition"
            >
              <Sparkles className="h-3 w-3" /> Get Started
            </Link>
          </div>
        )}
        </div>

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-darkBorder dark:text-slate-300 dark:hover:bg-darkPanel md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className={`border-t border-slate-200/80 dark:border-darkBorder md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6">
          <Link to="/" onClick={closeMenus} className="rounded-lg px-3 py-2 text-sm font-sans text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-darkPanel">
            Home
          </Link>
          <a href="#features" onClick={closeMenus} className="rounded-lg px-3 py-2 text-sm font-sans text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-darkPanel">
            Pipeline
          </a>
          <a href="#security" onClick={closeMenus} className="rounded-lg px-3 py-2 text-sm font-sans text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-darkPanel">
            Security
          </a>
          {user ? (
            <div className="grid gap-2 pt-2">
              <Link to="/dashboard" onClick={closeMenus} className="rounded-lg border border-accentBlue/30 bg-accentBlue/5 px-3 py-2 text-sm font-sans text-accentBlue">
                Workspace
              </Link>
              <Link to="/history" onClick={closeMenus} className="rounded-lg px-3 py-2 text-sm font-sans text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-darkPanel">
                History
              </Link>
              <Link to="/profile" onClick={closeMenus} className="rounded-lg px-3 py-2 text-sm font-sans text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-darkPanel">
                Edit Profile
              </Link>
              <button onClick={toggleTheme} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-sans text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-darkPanel">
                <span className="flex items-center gap-2">{theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
              <button onClick={handleLogout} className="rounded-lg px-3 py-2 text-left text-sm font-sans text-accentRed hover:bg-accentRed/5">
                Logout Workspace
              </button>
            </div>
          ) : (
            <div className="grid gap-2 pt-2">
              <Link to="/login" onClick={closeMenus} className="rounded-lg px-3 py-2 text-sm font-sans text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-darkPanel">
                Log In
              </Link>
              <Link to="/register" onClick={closeMenus} className="rounded-lg bg-accentBlue px-3 py-2 text-sm font-sans font-semibold text-white">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Flame, Menu, X, Phone, User as UserIcon, LogOut, ChevronDown, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/dashboard';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'RIDER') return '/rider';
    return '/dashboard';
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Products', path: '/products' },
    { name: 'How to Order', path: '/how-to-order' },
    { name: 'Delivery', path: '/delivery' },
    { name: 'Safety', path: '/safety' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      {/* Main navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border-light shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200 border border-primary/20">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-extrabold text-lg sm:text-xl tracking-tight leading-none text-text-primary">
                  D.S SHINDE <span className="text-secondary">GAS AGENCY</span>
                </div>
                <div className="text-[10px] sm:text-xs text-text-secondary uppercase tracking-widest font-medium mt-0.5">
                  LPG Cylinder Solutions
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors text-text-secondary hover:text-primary hover:bg-background-secondary ${
                      isActive
                        ? 'bg-background-secondary/50 font-semibold'
                        : ''
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>

            {/* Right Action buttons */}
            <div className="hidden sm:flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background-secondary/80 border border-border-light hover:bg-background-secondary/90 text-white text-sm font-medium transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[120px] truncate">{user.name}</span>
                    <ChevronDown className="w-4 h-4 text-text-secondary" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 text-gray-800 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Logged in as <span className="font-bold text-white">{user.role}</span></p>
                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.phone}</p>
                      </div>

                      <Link
                        to={getDashboardPath()}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-background-50 text-gray-700 hover:text-primary transition-colors"
                      >
                        <UserIcon className="w-4 h-4" /> Go to Dashboard
                      </Link>

                      {user.role === 'CUSTOMER' && (
                        <Link
                          to="/dashboard/orders/new"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-background-50 text-accent font-semibold transition-colors"
                        >
                          <ShoppingCart className="w-4 h-4" /> Book New Cylinder
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 transition-colors border-t border-gray-100"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="secondary" size="sm" className="text-white font-medium">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="accent" size="sm" className="font-semibold shadow-md">
                      Register
                    </Button>
                  </Link>
                </div>
              )}

              {/* Quick Book CTA button */}
              <Link to={isAuthenticated ? '/dashboard/orders/new' : '/login'}>
                <Button variant="accent" size="sm" leftIcon={<Flame className="w-4 h-4" />}>
                  Book Cylinder
                </Button>
              </Link>
            </div>

            {/* Mobile menu trigger */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-background-secondary focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-primaryDark border-t border-primary/30 px-4 pt-3 pb-6 space-y-2">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2.5 rounded-lg text-base font-medium ${
                      isActive
                        ? 'bg-primary text-white font-bold'
                        : 'text-text-secondary hover:bg-primary/50 hover:text-white'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>

            <div className="pt-4 border-t border-primary/30/80 space-y-2">
              {isAuthenticated && user ? (
                <>
                  <div className="px-3 py-2 text-xs text-primary">
                    Signed in as <span className="font-bold text-white">{user.name}</span> ({user.role})
                  </div>
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2.5 text-center rounded-lg bg-primary text-white font-medium text-sm"
                  >
                    Open {user.role === 'ADMIN' ? 'Admin Portal' : user.role === 'RIDER' ? 'Rider Portal' : 'Customer Dashboard'}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full py-2.5 text-center rounded-lg bg-red-600/80 text-white font-medium text-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center rounded-lg border border-primary/30 text-white font-medium text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center rounded-lg bg-accent text-white font-bold text-sm shadow"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Flame, Menu, X, Phone, User as UserIcon, LogOut, ChevronDown, ShoppingBag, Clock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { settings } = useSettings();
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
    { name: 'Cylinder Sizes', path: '/#cylinder-gallery' },
    { name: 'How It Works', path: '/how-to-order' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
  ];

  return (
    <>
      {/* Top Hotline Bar */}
      <div className="bg-[#17365D] text-white text-xs py-2 px-4 border-b border-[#1e4a7a]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-slate-200">
            <span className="flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-[#F59E0B]" />
              Hotline: <a href={`tel:${settings.primaryPhone}`} className="hover:text-white font-bold tracking-wide">{settings.primaryPhone}</a>
              {settings.secondaryPhone && (
                <> / <a href={`tel:${settings.secondaryPhone}`} className="hover:text-white font-bold">{settings.secondaryPhone}</a></>
              )}
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {settings.businessHours || '8:00 AM – 8:00 PM'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-200">
            <span className="hidden lg:inline text-slate-400 text-[11px]">Portals:</span>
            <Link 
              to="/quick-book" 
              className="text-[11px] bg-[#F59E0B] hover:bg-[#d97706] text-white px-2.5 py-0.5 rounded-md font-extrabold transition-colors shadow-xs"
            >
              ⚡ Quick Book
            </Link>
            <Link 
              to="/login" 
              className="text-[11px] bg-white/15 hover:bg-white/25 text-white px-2 py-0.5 rounded-md font-bold transition-colors"
            >
              👤 Customer
            </Link>
            <Link 
              to="/rider/login" 
              className="text-[11px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-md font-bold transition-colors"
            >
              🛵 Rider
            </Link>
            <Link 
              to="/admin/login" 
              className="text-[11px] bg-[#2878C8] hover:bg-[#1e5a9e] text-white px-2.5 py-0.5 rounded-md font-bold transition-colors shadow-xs"
            >
              🛡️ Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#17365D] to-[#2878C8] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200 border border-[#2878C8]/30">
                <Flame className="w-6 h-6 text-[#F59E0B] fill-[#F59E0B]" />
              </div>
              <div>
                <div className="font-extrabold text-lg sm:text-xl tracking-tight leading-none text-[#17365D]">
                  {settings.agencyName?.split(' ')[0] || 'D.S'} <span className="text-[#2878C8]">{settings.agencyName?.split(' ').slice(1).join(' ') || 'SHINDE GAS AGENCY'}</span>
                </div>
                <div className="text-[10px] sm:text-xs text-[#64748B] uppercase tracking-widest font-semibold mt-1">
                  Trusted Doorstep LPG Refills
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
                    `px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive && link.path !== '/#cylinder-gallery'
                        ? 'text-[#2878C8] bg-[#F3F8FD]'
                        : 'text-[#1F2937] hover:text-[#2878C8] hover:bg-[#F3F8FD]'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              {isAuthenticated && (
                <NavLink
                  to="/dashboard/orders"
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive ? 'text-[#2878C8] bg-[#F3F8FD]' : 'text-[#1F2937] hover:text-[#2878C8] hover:bg-[#F3F8FD]'
                    }`
                  }
                >
                  My Orders
                </NavLink>
              )}
            </nav>

            {/* Right Action buttons */}
            <div className="hidden sm:flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F3F8FD] border border-[#E2E8F0] hover:border-[#2878C8]/50 text-[#1F2937] text-sm font-medium transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#17365D] text-white flex items-center justify-center text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[120px] truncate font-semibold">{user.name}</span>
                    <ChevronDown className="w-4 h-4 text-[#64748B]" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] py-2 z-50 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-[#E2E8F0]">
                        <p className="text-xs text-[#64748B]">Signed in as</p>
                        <p className="text-sm font-bold text-[#1F2937] truncate">{user.name}</p>
                        <span className="inline-block mt-1 text-[10px] bg-[#F3F8FD] text-[#2878C8] font-bold px-2 py-0.5 rounded">
                          {user.role}
                        </span>
                      </div>

                      <Link
                        to={getDashboardPath()}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1F2937] hover:bg-[#F3F8FD] hover:text-[#2878C8] transition-colors"
                      >
                        <UserIcon className="w-4 h-4" /> Go to Dashboard
                      </Link>

                      <Link
                        to="/dashboard/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1F2937] hover:bg-[#F3F8FD] hover:text-[#2878C8] transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4" /> My Orders History
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#DC2626] hover:bg-red-50 transition-colors border-t border-[#E2E8F0]"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="secondary" size="sm" className="font-semibold text-white">
                      Login
                    </Button>
                  </Link>
                </div>
              )}

              {/* Prominent Quick Cylinder Booking CTA */}
              <Link to="/quick-book">
                <Button
                  variant="accent"
                  size="sm"
                  leftIcon={<Flame className="w-4 h-4 text-white fill-white" />}
                  className="font-bold shadow-md bg-[#F59E0B] hover:bg-[#d97706]"
                >
                  ⚡ Quick Book Refill
                </Button>
              </Link>
            </div>

            {/* Mobile menu hamburger button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                className="p-2 rounded-xl text-[#17365D] hover:bg-[#F3F8FD] focus:outline-none transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[#E2E8F0] px-4 pt-3 pb-6 space-y-2 shadow-lg">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                      isActive && link.path !== '/#cylinder-gallery'
                        ? 'bg-[#F3F8FD] text-[#2878C8]'
                        : 'text-[#1F2937] hover:bg-[#F3F8FD] hover:text-[#2878C8]'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              {isAuthenticated && (
                <NavLink
                  to="/dashboard/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                      isActive ? 'bg-[#F3F8FD] text-[#2878C8]' : 'text-[#1F2937] hover:bg-[#F3F8FD]'
                    }`
                  }
                >
                  My Orders
                </NavLink>
              )}
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] space-y-2">
              {isAuthenticated && user ? (
                <>
                  <div className="px-3 py-2 text-xs text-[#64748B] bg-[#F3F8FD] rounded-lg">
                    Signed in as <span className="font-bold text-[#1F2937]">{user.name}</span> ({user.role})
                  </div>
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2.5 text-center rounded-xl bg-[#17365D] text-white font-bold text-sm shadow-sm"
                  >
                    Open {user.role === 'ADMIN' ? 'Admin Portal' : user.role === 'RIDER' ? 'Rider Portal' : 'Customer Dashboard'}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full py-2 text-center rounded-xl border border-red-200 text-[#DC2626] font-semibold text-sm hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="space-y-2 pt-1">
                  <Link
                    to="/quick-book"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-3 text-center rounded-xl bg-[#F59E0B] text-white font-extrabold text-sm shadow-md hover:bg-[#d97706] flex items-center justify-center gap-2"
                  >
                    <Flame className="w-4 h-4 fill-white" /> ⚡ Quick Book Cylinder (No Login)
                  </Link>

                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[#E2E8F0]">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 text-center rounded-lg border border-[#E2E8F0] text-[#17365D] font-bold text-xs hover:bg-[#F3F8FD]"
                    >
                      👤 Customer
                    </Link>
                    <Link
                      to="/rider/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 text-center rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs hover:bg-amber-100"
                    >
                      🛵 Rider
                    </Link>
                    <Link
                      to="/admin/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 text-center rounded-lg bg-[#17365D] text-white font-bold text-xs hover:bg-[#122b4a]"
                    >
                      🛡️ Admin
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
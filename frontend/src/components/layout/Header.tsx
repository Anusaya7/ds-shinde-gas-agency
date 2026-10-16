import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Flame, Menu, X, Phone, User, LogOut, Bike } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';

const navigation = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'How it works', to: '/how-to-order' },
  { label: 'About us', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { settings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const dashboardPath = user?.role === 'RIDER' ? '/rider' : '/dashboard';

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <div className="bg-[#10284A] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-xs sm:justify-between">
          <span className="hidden text-slate-200 sm:block">
            Trusted local LPG delivery, with safety at every step.
          </span>
          <a
            className="inline-flex items-center gap-2 font-semibold hover:text-orange-300"
            href={`tel:${settings.primaryPhone}`}
            aria-label={`Call DS Shinde Gas at ${settings.primaryPhone}`}
          >
            <Phone className="h-3.5 w-3.5 text-orange-400" />
            Need help? {settings.primaryPhone}
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-3"
            aria-label="DS Shinde Gas home"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#10284A] shadow-sm">
              <Flame className="h-6 w-6 fill-orange-400 text-orange-400" />
            </span>
            <span className="leading-tight">
              <span className="block text-[15px] font-extrabold tracking-tight text-[#10284A] sm:text-lg">
                DS Shinde Gas
              </span>
              <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.17em] text-slate-500">
                LPG, delivered with care
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {navigation.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-blue-50 text-[#10284A]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-[#10284A]'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            {isAuthenticated && user ? (
              <>
                {user.role !== 'ADMIN' && (
                  <Link
                    to={dashboardPath}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-[#10284A] hover:bg-slate-50"
                  >
                    <User className="h-4 w-4" />
                    <span className="max-w-28 truncate">{user.name}</span>
                  </Link>
                )}
                <button
                  onClick={() => void handleLogout()}
                  className="rounded-xl p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"
                  aria-label="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl bg-[#F47721] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#DD6414] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
                >
                  Customer Booking
                </Link>
                <Link
                  to="/rider/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#10284A] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#1C3D65] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                >
                  <Bike className="h-4 w-4" />
                  Rider Booking
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="rounded-xl p-2 text-[#10284A] hover:bg-blue-50 sm:hidden"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 pb-5 pt-3 sm:hidden">
            <nav className="space-y-1" aria-label="Mobile navigation">
              {navigation.map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `block rounded-xl px-4 py-3 text-sm font-semibold ${
                      isActive
                        ? 'bg-blue-50 text-[#10284A]'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-4 grid grid-cols-1 gap-2 border-t border-slate-100 pt-4">
              {isAuthenticated && user?.role !== 'ADMIN' ? (
                <>
                  <Link
                    to={dashboardPath}
                    onClick={closeMenu}
                    className="rounded-xl bg-[#10284A] px-4 py-3 text-center text-sm font-bold text-white"
                  >
                    My dashboard
                  </Link>
                  <button
                    onClick={() => void handleLogout()}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    Sign out
                  </button>
                </>
              ) : isAuthenticated ? (
                <button
                  onClick={() => void handleLogout()}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  Sign out
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="rounded-xl bg-[#F47721] px-4 py-3 text-center text-sm font-bold text-white"
                  >
                    Customer Booking
                  </Link>
                  <Link
                    to="/rider/login"
                    onClick={closeMenu}
                    className="rounded-xl bg-[#10284A] px-4 py-3 text-center text-sm font-bold text-white"
                  >
                    Rider Booking
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

import React from 'react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Flame, Bike, PackageCheck, User, LogOut, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  applicationService,
  RiderApplication,
} from '../../services/application.service';
import { RiderApplicationPage } from '../../pages/rider/RiderApplicationPage';
import { Spinner } from '../ui/Spinner';

export const RiderLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState<RiderApplication | null>(null);
  const [loadingApplication, setLoadingApplication] = useState(true);
  const [applicationError, setApplicationError] = useState('');

  useEffect(() => {
    applicationService
      .getMine()
      .then(setApplication)
      .catch((error: any) => {
        setApplicationError(
          error.response?.data?.message || 'We could not load your rider application. Please retry.'
        );
      })
      .finally(() => setLoadingApplication(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loadingApplication) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" label="Checking your rider application…" />
      </div>
    );
  }

  if (applicationError) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <p role="alert" className="text-sm text-red-700">{applicationError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl bg-[#10284A] px-4 py-2 text-sm font-bold text-white"
        >
          Retry
        </button>
      </main>
    );
  }

  if (!application || application.status !== 'APPROVED') {
    return <RiderApplicationPage />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/rider', icon: Bike, exact: true },
    { name: 'My Tasks', path: '/rider/orders', icon: Flame },
    { name: 'Completed', path: '/rider/completed', icon: PackageCheck },
    { name: 'My Profile', path: '/rider/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row pb-16 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-primaryDark text-white h-screen sticky top-0 shrink-0">
        <div>
          <div className="p-6 border-b border-blue-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center border border-red-400">
              <Bike className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight block">DS Shinde Gas</span>
              <span className="text-xs text-accentLight font-semibold uppercase tracking-wider block">
                Rider Portal
              </span>
            </div>
          </div>

          <div className="p-4 mx-4 my-4 rounded-xl bg-blue-900/40 border border-blue-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <p className="text-xs font-semibold text-emerald-300">Active Duty</p>
            </div>
            <p className="text-sm font-bold text-white mt-1 truncate">{user?.name || 'Rider'}</p>
            <p className="text-xs text-blue-200">{user?.phone}</p>
          </div>

          <nav className="px-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-accent text-white shadow-md'
                        : 'text-blue-200 hover:bg-blue-900/60 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-blue-900">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top header */}
        <header className="md:hidden bg-primary text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Bike className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-sm">Rider Delivery Assistant</span>
          </div>
          <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> Online
          </span>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Tab Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex items-center justify-around py-2 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 text-xs font-semibold transition-colors ${
                  isActive ? 'text-accent' : 'text-gray-500 hover:text-primary'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

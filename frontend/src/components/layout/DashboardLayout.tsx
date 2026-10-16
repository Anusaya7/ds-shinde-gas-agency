import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Flame,
  LayoutDashboard,
  ShoppingCart,
  Package,
  MapPin,
  User,
  LogOut,
  Menu,
  X,
  Phone,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Book New Cylinder', path: '/dashboard/orders/new', icon: ShoppingCart, highlight: true },
    { name: 'My Orders', path: '/dashboard/orders', icon: Package },
    { name: 'Saved Addresses', path: '/dashboard/addresses', icon: MapPin },
    { name: 'My Profile', path: '/dashboard/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile top bar */}
      <div className="md:hidden bg-primary text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight">DS Shinde Gas</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-blue-100 hover:text-white hover:bg-blue-800"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay on Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-primaryDark text-white flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="p-6 border-b border-blue-900 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg border border-red-400">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight block">DS Shinde Gas</span>
                <span className="text-xs text-blue-300 uppercase tracking-wider block">Customer Portal</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-blue-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User quick badge */}
          <div className="p-4 mx-4 my-4 rounded-xl bg-blue-900/60 border border-blue-800/80">
            <p className="text-xs text-blue-300">Welcome,</p>
            <p className="text-sm font-bold text-white truncate">{user?.name || 'Customer'}</p>
            <p className="text-xs text-blue-200 mt-0.5">{user?.phone}</p>
          </div>

          {/* Navigation links */}
          <nav className="px-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? item.highlight
                          ? 'bg-accent text-white font-bold shadow-md'
                          : 'bg-primary text-white font-bold shadow-sm'
                        : item.highlight
                        ? 'text-accentLight hover:bg-blue-900/60 font-semibold'
                        : 'text-blue-200 hover:bg-blue-900/60 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-blue-900 space-y-3">
          <div className="text-[11px] text-blue-300 bg-blue-900/30 p-2.5 rounded-lg">
            <div className="font-semibold text-white flex items-center gap-1.5 mb-1">
              <Phone className="w-3.5 h-3.5 text-accentLight" /> Need Help?
            </div>
            Call 9511760208 / 9975300929
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex bg-white border-b border-gray-200 px-8 py-4 items-center justify-between shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">Customer Portal</h2>
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard/orders/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg text-sm font-semibold shadow transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Book Cylinder</span>
            </Link>
            <div className="text-right">
              <span className="block text-sm font-bold text-gray-900">{user?.name}</span>
              <span className="block text-xs text-gray-500">{user?.phone}</span>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

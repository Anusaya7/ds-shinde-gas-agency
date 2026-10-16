import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Flame,
  LayoutDashboard,
  Package,
  Bike,
  Users,
  Layers,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Globe,
  Mail,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Website CMS', path: '/admin/cms', icon: Globe },
    { name: 'Customer Inquiries', path: '/admin/enquiries', icon: Mail },
    { name: 'Orders Dispatch', path: '/admin/orders', icon: Package },
    { name: 'Customer Applications', path: '/admin/customer-applications', icon: Users },
    { name: 'Rider Applications', path: '/admin/rider-applications', icon: Bike },
    { name: 'Delivery Riders', path: '/admin/riders', icon: Bike },
    { name: 'Customer Directory', path: '/admin/customers', icon: Users },
    { name: 'Products & Pricing', path: '/admin/products', icon: Layers },
    { name: 'Reports & Revenue', path: '/admin/reports', icon: BarChart3 },
    { name: 'Agency Settings', path: '/admin/settings', icon: Settings },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Mobile top bar */}
      <div className="md:hidden bg-primaryDark text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight">DS GAS • ADMIN</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-blue-100 hover:text-white hover:bg-blue-800"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-primaryDark text-white flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Header */}
          <div className="p-5 border-b border-blue-900/80 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-lg border border-red-400">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight block">DS Shinde Gas</span>
                <span className="text-[10px] text-accentLight uppercase tracking-wider font-extrabold block">
                  Admin Console
                </span>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-blue-300">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Tag */}
          <div className="px-4 py-3 mx-3 my-3 rounded-lg bg-blue-950/60 border border-blue-800/50 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-blue-300">Logged in Administrator</p>
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Admin User'}</p>
            </div>
            <span className="text-[10px] bg-accent/90 text-white font-bold px-2 py-0.5 rounded">
              SUPER
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-md border-l-4 border-accent'
                        : 'text-blue-200 hover:bg-blue-900/60 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-blue-900/80 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs text-blue-300 hover:text-white hover:bg-blue-900/40 rounded-lg transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" /> View Public Site
            </span>
            <span className="text-[10px] text-blue-400">Live</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Admin Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex bg-white border-b border-gray-200 px-8 py-3.5 items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-blue-50 px-2.5 py-1 rounded">
              Management Portal
            </span>
            <h1 className="text-base font-bold text-gray-800">
              Agency Operations & Dispatch Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/admin/notifications"
              className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
            </Link>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-900">{user?.name || 'Administrator'}</span>
                <span className="block text-[10px] text-emerald-600 font-semibold">Online</span>
              </div>
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

import React, { useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
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
  FileCheck2,
  ClipboardCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navGroups = [
  {
    label: 'Daily work',
    items: [
      { name: 'Home', path: '/admin', icon: LayoutDashboard, exact: true },
      { name: 'Orders', path: '/admin/orders', icon: Package },
      { name: 'Customer KYC', path: '/admin/customer-applications', icon: FileCheck2 },
      { name: 'Messages', path: '/admin/enquiries', icon: Mail },
    ],
  },
  {
    label: 'People',
    items: [
      { name: 'Customers', path: '/admin/customers', icon: Users },
      { name: 'Riders', path: '/admin/riders', icon: Bike },
      { name: 'Rider KYC', path: '/admin/rider-applications', icon: ClipboardCheck },
    ],
  },
  {
    label: 'Shop',
    items: [
      { name: 'Prices', path: '/admin/products', icon: Layers },
      { name: 'Website', path: '/admin/cms', icon: Globe },
      { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    ],
  },
  {
    label: 'Setup',
    items: [
      { name: 'Settings', path: '/admin/settings', icon: Settings },
      { name: 'Alerts', path: '/admin/notifications', icon: Bell },
    ],
  },
];

const allNavItems = navGroups.flatMap((group) => group.items);

function pageTitleFor(pathname: string): string {
  const match = allNavItems
    .filter((item) =>
      item.exact
        ? pathname === item.path
        : pathname === item.path || pathname.startsWith(`${item.path}/`)
    )
    .sort((a, b) => b.path.length - a.path.length)[0];
  return match?.name || 'Home';
}

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const pageTitle = useMemo(() => pageTitleFor(pathname), [pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-white text-[#10284A] shadow-sm'
        : 'text-blue-100 hover:bg-blue-900/70 hover:text-white'
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F6FA] md:flex-row">
      <div className="sticky top-0 z-40 flex items-center justify-between bg-[#10284A] px-4 py-3 text-white shadow md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F47721]">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-bold">DS Shinde Gas</span>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg p-2 text-blue-100 hover:bg-blue-800 hover:text-white"
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 shrink-0 flex-col bg-[#10284A] text-white transition-transform duration-200 ease-in-out md:sticky ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <Link to="/admin" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F47721]">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="block text-sm font-bold">DS Shinde Gas</span>
              <span className="block text-xs text-blue-200">Admin</span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="text-blue-200 md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mx-3 mt-3 rounded-xl bg-white/5 px-3 py-2.5">
          <p className="truncate text-sm font-semibold text-white">{user?.name || 'Admin'}</p>
          <p className="text-xs text-blue-200">Signed in</p>
        </div>

        <nav className="mt-3 flex-1 space-y-4 overflow-y-auto px-3 pb-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-blue-300">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.exact}
                      onClick={() => setSidebarOpen(false)}
                      className={linkClass}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-1 border-t border-white/10 p-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-blue-100 hover:bg-blue-900/70 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" />
            Open website
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-200 hover:bg-red-500/10 hover:text-red-100"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hidden items-center justify-between border-b border-slate-200 bg-white px-6 py-3 md:flex">
          <h1 className="text-lg font-bold text-[#10284A]">{pageTitle}</h1>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/notifications"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-[#10284A]"
              title="Alerts"
            >
              <Bell className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#10284A] text-xs font-bold text-white">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <span className="text-sm font-semibold text-slate-800">{user?.name || 'Admin'}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

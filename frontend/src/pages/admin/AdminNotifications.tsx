import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Clock, AlertTriangle, Package, Info } from 'lucide-react';
import { notificationService } from '../../services/notification.service';
import { AppNotification } from '../../types';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    notificationService
      .getNotifications()
      .then((data) => setNotifications(data))
      .catch((requestError: any) => {
        setError(requestError.response?.data?.message || 'Could not load notifications.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (requestError: any) {
      toast.error(requestError.response?.data?.message || 'Could not mark notification as read.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (requestError: any) {
      toast.error(requestError.response?.data?.message || 'Could not update notifications.');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ORDER':
      case 'ORDER_UPDATE':
        return <Package className="w-5 h-5 text-primary" />;
      case 'ALERT':
      case 'DELIVERY':
        return <AlertTriangle className="w-5 h-5 text-accent" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">System Notifications & Alerts</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Operational alerts, cylinder low-stock warnings, and dispatch milestones
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleMarkAllRead}
          leftIcon={<CheckCheck className="w-4 h-4" />}
        >
          Mark All as Read
        </Button>
      </div>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      {loading ? (
        <div className="py-20">
          <Spinner label="Loading notifications..." />
        </div>
      ) : notifications.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => !item.isRead && handleMarkAsRead(item.id)}
              className={`p-5 transition-colors flex items-start gap-4 ${
                item.isRead ? 'bg-white hover:bg-gray-50/60' : 'bg-blue-50/40 hover:bg-blue-50/70'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  item.type === 'ALERT'
                    ? 'bg-red-100'
                    : item.type === 'ORDER'
                    ? 'bg-blue-100'
                    : 'bg-gray-100'
                }`}
              >
                {getIcon(item.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-gray-900">{item.title}</h4>
                  <span className="text-[11px] text-gray-400">
                    {new Date(item.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{item.message}</p>
                {item.linkUrl && (
                  <Link
                    to={item.linkUrl}
                    className="inline-block pt-1 text-xs font-semibold text-primary hover:underline"
                  >
                    View Associated File →
                  </Link>
                )}
              </div>

              {!item.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-accent shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800">No New Notifications</h3>
          <p className="text-xs text-gray-500 mt-1">
            You are fully caught up with all dispatch logs and warnings.
          </p>
        </div>
      )}
    </div>
  );
};

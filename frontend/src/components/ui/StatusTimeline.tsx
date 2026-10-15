import React from 'react';
import { OrderStatus, StatusHistoryItem } from '../../types';
import { CheckCircle2, Clock, Truck, Home, AlertCircle, PackageCheck, Flame } from 'lucide-react';

export interface StatusTimelineProps {
  currentStatus: OrderStatus;
  history?: StatusHistoryItem[];
  createdAt?: string;
  deliveredAt?: string;
}

const ORDER_STEPS: Array<{ status: OrderStatus; label: string; description: string }> = [
  { status: 'PLACED', label: 'Order Placed', description: 'Booking confirmed and logged in agency system' },
  { status: 'ACCEPTED', label: 'Order Accepted', description: 'Agency verified booking & queued for dispatch' },
  { status: 'ASSIGNED', label: 'Rider Assigned', description: 'Delivery executive assigned for cylinder pickup' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', description: 'Cylinder is in transit to your address' },
  { status: 'ARRIVED', label: 'Rider Arrived', description: 'Delivery partner has reached your doorstep' },
  { status: 'DELIVERED', label: 'Delivered', description: 'Cylinder delivered & verified via secure OTP' },
];

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  currentStatus,
  history = [],
  createdAt,
  deliveredAt,
}) => {
  const isCancelled = currentStatus === 'CANCELLED' || currentStatus === 'REJECTED';

  const getStepIndex = (status: OrderStatus) => {
    return ORDER_STEPS.findIndex((s) => s.status === status);
  };

  const currentIndex = getStepIndex(currentStatus);

  const getStatusIcon = (status: OrderStatus, isDone: boolean, isActive: boolean) => {
    if (status === 'DELIVERED' && isDone) {
      return <PackageCheck className="w-5 h-5 text-emerald-600" />;
    }
    if (status === 'OUT_FOR_DELIVERY') {
      return <Truck className={`w-5 h-5 ${isActive ? 'text-primary animate-pulse' : 'text-gray-400'}`} />;
    }
    if (status === 'ARRIVED') {
      return <Home className="w-5 h-5" />;
    }
    if (isDone) {
      return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    }
    return <Clock className="w-5 h-5 text-gray-400" />;
  };

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-accent shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-accent text-base">
            Order {currentStatus === 'CANCELLED' ? 'Cancelled' : 'Rejected'}
          </h4>
          <p className="text-sm text-red-700 mt-1">
            This booking has been {currentStatus.toLowerCase()}. If any amount was deducted, our refund will be initiated to your original payment source within 2-3 business days.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
        {ORDER_STEPS.map((step, idx) => {
          const isDone = currentIndex >= idx;
          const isCurrent = currentIndex === idx;

          // Find timestamp from history or fallback
          const historyEntry = history.find((h) => h.status === step.status);
          let timestamp = historyEntry?.timestamp;
          if (!timestamp && idx === 0 && createdAt) timestamp = createdAt;
          if (!timestamp && step.status === 'DELIVERED' && deliveredAt) timestamp = deliveredAt;

          return (
            <div key={step.status} className="relative flex items-start group">
              {/* Node Icon */}
              <div
                className={`absolute -left-6 sm:-left-8 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 transition-all ${
                  isCurrent
                    ? 'bg-primary border-primary text-white ring-4 ring-blue-100 shadow'
                    : isDone
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {getStatusIcon(step.status, isDone, isCurrent)}
              </div>

              {/* Step info */}
              <div className="ml-2 sm:ml-4 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4
                    className={`text-sm font-bold ${
                      isCurrent
                        ? 'text-primary'
                        : isDone
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </h4>
                  {timestamp && (
                    <span className="text-xs text-gray-500 font-normal">
                      {new Date(timestamp).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                {historyEntry?.comment && (
                  <p className="mt-1 text-xs bg-gray-50 text-gray-700 p-2 rounded border border-gray-100">
                    Note: {historyEntry.comment}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

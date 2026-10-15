import React, { useState, useEffect } from 'react';
import { Users, Search, Eye, Phone, Mail, Package, Calendar } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { User, Order } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';

export const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected customer details modal
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    setLoading(true);
    adminService
      .getCustomers()
      .then((res) => setCustomers(res.customers))
      .catch(() => {
        setCustomers([
          {
            id: 'cust-1',
            name: 'Anil Deshmukh',
            phone: '9822012345',
            email: 'anil.deshmukh@gmail.com',
            role: 'CUSTOMER',
            isActive: true,
            createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          },
          {
            id: 'cust-2',
            name: 'Green Spice Restaurant',
            phone: '9423098765',
            email: 'greenspice@hotel.com',
            role: 'CUSTOMER',
            isActive: true,
            createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
          },
          {
            id: 'cust-3',
            name: 'Kavita Joshi',
            phone: '9890123456',
            role: 'CUSTOMER',
            isActive: true,
            createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleViewCustomer = (cust: User) => {
    setSelectedCustomer(cust);
    setLoadingDetails(true);
    setDetailsModalOpen(true);
    adminService
      .getCustomerById(cust.id)
      .then((data) => {
        setCustomerOrders(data.orders || []);
      })
      .catch(() => {
        setCustomerOrders([]);
      })
      .finally(() => setLoadingDetails(false));
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Customer Directory & Accounts</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Directory of registered domestic and commercial LPG consumers
        </p>
      </div>

      {/* Search Header */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer by name, mobile, email..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
        <span className="text-xs text-gray-500 font-semibold">
          Registered Consumers: {customers.length}
        </span>
      </div>

      {/* Customer Table */}
      {loading ? (
        <div className="py-20">
          <Spinner label="Loading customer database..." />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="px-5 py-3.5">Customer Name</th>
                  <th className="px-5 py-3.5">Contact Phone</th>
                  <th className="px-5 py-3.5">Email Address</th>
                  <th className="px-5 py-3.5">Registered On</th>
                  <th className="px-5 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-primary flex items-center justify-center font-bold">
                            {cust.name.charAt(0)}
                          </div>
                          <span className="font-bold text-gray-900">{cust.name}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 font-semibold text-gray-800">
                        📞 {cust.phone}
                      </td>

                      <td className="px-5 py-3.5 text-gray-600">
                        {cust.email || <span className="text-gray-400 italic">Not provided</span>}
                      </td>

                      <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                        {cust.createdAt
                          ? new Date(cust.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Recent'}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active Consumer
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewCustomer(cust)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          History
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                      No matching consumers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer History Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={selectedCustomer?.name || 'Customer Details'}
        description={`Consumer ID: ${selectedCustomer?.id} • Phone: ${selectedCustomer?.phone}`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-xs grid grid-cols-2 gap-2">
            <div>
              <span className="text-gray-400 block font-medium">Registered Phone</span>
              <span className="font-bold text-gray-900">{selectedCustomer?.phone}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Email Account</span>
              <span className="font-bold text-gray-900">{selectedCustomer?.email || 'N/A'}</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm text-gray-900 mb-2">Order Booking History</h4>
            {loadingDetails ? (
              <div className="py-8">
                <Spinner label="Loading customer orders..." size="sm" />
              </div>
            ) : customerOrders.length > 0 ? (
              <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto border border-gray-200 rounded-xl">
                {customerOrders.map((ord) => (
                  <div key={ord.id} className="p-3 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900">#{ord.orderNumber}</span>
                      <p className="text-gray-500">
                        {ord.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">₹{ord.totalAmount}</span>
                      <Badge status={ord.orderStatus} size="sm" className="ml-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic py-4 text-center border border-dashed rounded-xl">
                No previous orders logged for this customer.
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="secondary" onClick={() => setDetailsModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

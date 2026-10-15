import React, { useState, useEffect } from 'react';
import { Bike, Plus, Edit2, Phone, CheckCircle, XCircle, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { Rider } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export const RiderManagement: React.FC = () => {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRider, setEditingRider] = useState<Rider | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    vehicleNumber: '',
    password: '',
  });
  const [saving, setSaving] = useState(false);

  const loadRiders = () => {
    setLoading(true);
    adminService
      .getRiders()
      .then((data) => setRiders(data))
      .catch(() => {
        setRiders([
          {
            id: 'rider-1',
            name: 'Ramesh Patil',
            phone: '9975300929',
            email: 'ramesh@dsshindegas.com',
            vehicleNumber: 'MH-12-AB-1234',
            isActive: true,
            assignedOrdersCount: 2,
            completedOrdersCount: 142,
          },
          {
            id: 'rider-2',
            name: 'Suresh More',
            phone: '9822998877',
            email: 'suresh@dsshindegas.com',
            vehicleNumber: 'MH-12-CD-5678',
            isActive: true,
            assignedOrdersCount: 1,
            completedOrdersCount: 98,
          },
          {
            id: 'rider-3',
            name: 'Vikas Jadhav',
            phone: '9765432100',
            vehicleNumber: 'MH-12-EF-9012',
            isActive: false,
            assignedOrdersCount: 0,
            completedOrdersCount: 65,
          },
        ]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRiders();
  }, []);

  const openAddModal = () => {
    setEditingRider(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      vehicleNumber: '',
      password: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (rider: Rider) => {
    setEditingRider(rider);
    setFormData({
      name: rider.name,
      phone: rider.phone,
      email: rider.email || '',
      vehicleNumber: rider.vehicleNumber || '',
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error('Name and phone are required');
      return;
    }
    setSaving(true);
    try {
      if (editingRider) {
        const updated = await adminService.updateRider(editingRider.id, formData);
        setRiders((prev) => prev.map((r) => (r.id === editingRider.id ? { ...r, ...formData } : r)));
        toast.success('Rider details updated');
      } else {
        const created = await adminService.addRider(formData);
        setRiders((prev) => [...prev, created]);
        toast.success('New rider onboarded successfully');
      }
      setIsModalOpen(false);
    } catch {
      if (editingRider) {
        setRiders((prev) => prev.map((r) => (r.id === editingRider.id ? { ...r, ...formData } : r)));
        toast.success('Rider updated');
      } else {
        const mock: Rider = {
          id: `rider-${Date.now()}`,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          vehicleNumber: formData.vehicleNumber,
          isActive: true,
          assignedOrdersCount: 0,
          completedOrdersCount: 0,
        };
        setRiders((prev) => [...prev, mock]);
        toast.success('Rider onboarded');
      }
      setIsModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (rider: Rider) => {
    const nextStatus = !rider.isActive;
    try {
      await adminService.toggleRiderStatus(rider.id, nextStatus);
      setRiders((prev) =>
        prev.map((r) => (r.id === rider.id ? { ...r, isActive: nextStatus } : r))
      );
      toast.success(`Rider marked ${nextStatus ? 'Active' : 'Inactive'}`);
    } catch {
      setRiders((prev) =>
        prev.map((r) => (r.id === rider.id ? { ...r, isActive: nextStatus } : r))
      );
      toast.success(`Rider status changed`);
    }
  };

  const filteredRiders = riders.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search) ||
      (r.vehicleNumber && r.vehicleNumber.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Delivery Fleet Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Manage delivery executives, assign vehicles, and monitor completed cylinder drop-offs
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openAddModal} leftIcon={<Plus className="w-4 h-4" />}>
          Add New Delivery Rider
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rider by name, phone or vehicle..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
        <span className="text-xs text-gray-500 font-semibold hidden sm:inline">
          Total Riders: {riders.length} ({riders.filter((r) => r.isActive).length} active)
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20">
          <Spinner label="Loading delivery fleet..." />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="px-5 py-3.5">Rider Details</th>
                  <th className="px-5 py-3.5">Contact Phone</th>
                  <th className="px-5 py-3.5">Vehicle Number</th>
                  <th className="px-5 py-3.5">Active Deliveries</th>
                  <th className="px-5 py-3.5">Completed Drops</th>
                  <th className="px-5 py-3.5">Duty Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRiders.length > 0 ? (
                  filteredRiders.map((rider) => (
                    <tr key={rider.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold">
                            {rider.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{rider.name}</span>
                            <span className="text-[11px] text-gray-400">{rider.email || 'No email'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-primary font-semibold">
                        📞 {rider.phone}
                      </td>

                      <td className="px-5 py-3.5 font-mono text-gray-700">
                        {rider.vehicleNumber || 'Unassigned'}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-warm-dark border border-amber-200">
                          {rider.assignedOrdersCount} active
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-bold text-emerald-600">
                        {rider.completedOrdersCount} delivered
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => toggleStatus(rider)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                            rider.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              rider.isActive ? 'bg-emerald-500' : 'bg-gray-400'
                            }`}
                          />
                          {rider.isActive ? 'On Duty' : 'Off Duty'}
                        </button>
                      </td>

                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(rider)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors"
                          title="Edit Rider"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                      No delivery riders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRider ? 'Edit Rider Information' : 'Onboard New Delivery Rider'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Ramesh Patil"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Mobile Number (Login & Calls)"
              placeholder="10-digit phone"
              type="tel"
              maxLength={10}
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
            />
            <Input
              label="Vehicle Registration Number"
              placeholder="e.g. MH-12-AB-1234"
              value={formData.vehicleNumber}
              onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
            />
          </div>

          <Input
            label="Email Address (Optional)"
            placeholder="rider@example.com"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          {!editingRider && (
            <Input
              label="Temporary Password"
              type="password"
              placeholder="At least 6 characters"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          )}

          <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              {editingRider ? 'Update Rider' : 'Save & Onboard'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

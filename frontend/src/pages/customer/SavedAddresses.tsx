import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit2, Star, CheckCircle2 } from 'lucide-react';
import { customerService } from '../../services/customer.service';
import { Address } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export const SavedAddresses: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Omit<Address, 'id'>>({
    fullName: '',
    phone: '',
    altPhone: '',
    addressLine1: '',
    addressLine2: '',
    area: 'Central City',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    landmark: '',
    mapLink: '',
    isDefault: false,
  });

  const loadAddresses = () => {
    setLoading(true);
    customerService
      .getAddresses()
      .then((data) => setAddresses(data))
      .catch((error: any) => {
        setAddresses([]);
        toast.error(error.response?.data?.message || 'Could not load saved addresses.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const openAddModal = () => {
    setEditingAddress(null);
    setForm({
      fullName: '',
      phone: '',
      altPhone: '',
      addressLine1: '',
      addressLine2: '',
      area: 'Central City',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      landmark: '',
      mapLink: '',
      isDefault: addresses.length === 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddress(addr);
    setForm({
      fullName: addr.fullName,
      phone: addr.phone,
      altPhone: addr.altPhone || '',
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      area: addr.area,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      landmark: addr.landmark || '',
      mapLink: addr.mapLink || '',
      isDefault: !!addr.isDefault,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.addressLine1 || !form.area || !form.pincode) {
      toast.error('Please complete all mandatory fields');
      return;
    }
    setSaving(true);
    try {
      if (editingAddress) {
        await customerService.updateAddress(editingAddress.id, form);
        setAddresses((prev) =>
          prev.map((a) => (a.id === editingAddress.id ? { ...a, ...form } : a))
        );
        toast.success('Address updated successfully');
      } else {
        const created = await customerService.addAddress(form);
        setAddresses((prev) => [...prev, created]);
        toast.success('Address added successfully');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not save this address.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await customerService.deleteAddress(deleteTargetId);
      setAddresses((prev) => prev.filter((a) => a.id !== deleteTargetId));
      toast.success('Address removed');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not remove this address.');
    } finally {
      setDeleteTargetId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await customerService.setDefaultAddress(id);
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === id,
        }))
      );
      toast.success('Default delivery address updated');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not update the default address.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Saved Delivery Addresses</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Store and manage residential and business locations for 1-click cylinder dispatch
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openAddModal} leftIcon={<Plus className="w-4 h-4" />}>
          Add New Address
        </Button>
      </div>

      {loading ? (
        <div className="py-16">
          <Spinner label="Loading saved addresses..." />
        </div>
      ) : addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white rounded-2xl p-6 border transition-all flex flex-col justify-between shadow-sm hover:shadow-md ${
                addr.isDefault ? 'border-primary ring-2 ring-blue-100' : 'border-gray-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-base">{addr.fullName}</h3>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold text-primary bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> Default
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {addr.addressLine1}
                  {addr.addressLine2 && `, ${addr.addressLine2}`}, {addr.area}
                </p>
                <p className="text-xs text-gray-600">
                  {addr.city}, {addr.state} - <span className="font-bold">{addr.pincode}</span>
                </p>
                {addr.landmark && (
                  <p className="text-xs text-gray-500">
                    <strong className="text-gray-700">Landmark:</strong> {addr.landmark}
                  </p>
                )}
                <p className="text-xs text-primary font-semibold pt-1">📞 {addr.phone}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  {!addr.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs text-gray-500 hover:text-primary font-medium"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(addr)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors"
                    title="Edit Address"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(addr.id)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-accent hover:bg-red-50 transition-colors"
                    title="Delete Address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">No Saved Addresses</h3>
          <p className="text-xs text-gray-500 mt-1 mb-6">
            You have not saved any delivery drop locations yet. Add an address to speed up bookings.
          </p>
          <Button variant="primary" size="sm" onClick={openAddModal}>
            Add Address Now
          </Button>
        </div>
      )}

      {/* Add / Edit Address Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAddress ? 'Edit Delivery Address' : 'Add New Delivery Address'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Address Title / Recipient Name"
            placeholder="e.g. Ramesh Patil (Home)"
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Phone Number"
              placeholder="10-digit mobile"
              type="tel"
              maxLength={10}
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
            />
            <Input
              label="Alternate Phone"
              placeholder="Optional alternate contact"
              type="tel"
              maxLength={10}
              value={form.altPhone || ''}
              onChange={(e) => setForm({ ...form, altPhone: e.target.value.replace(/\D/g, '') })}
            />
          </div>

          <Input
            label="Flat / House / Floor / Building Name"
            placeholder="e.g. Flat 302, Sai Heights"
            required
            value={form.addressLine1}
            onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Area / Neighborhood"
              placeholder="e.g. Central City"
              required
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
            />
            <Input
              label="Pincode"
              placeholder="6-digit postal code"
              required
              maxLength={6}
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '') })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="City"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <Input
              label="State"
              required
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
          </div>

          <Input
            label="Prominent Landmark"
            placeholder="e.g. Near Bus Depot, Behind Shiv Temple"
            value={form.landmark || ''}
            onChange={(e) => setForm({ ...form, landmark: e.target.value })}
          />

          <label className="flex items-center gap-2 pt-1 text-xs text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <span>Set this as my default delivery address</span>
          </label>

          <div className="pt-3 flex justify-end gap-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              {editingAddress ? 'Update Address' : 'Save Address'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Address"
        message="Are you sure you want to remove this delivery location from your saved list?"
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Flame } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { Product } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    size: '14.2 kg',
    description: '',
    price: 920,
    inStock: true,
    deliveryCharge: 50,
    type: 'DOMESTIC',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const loadProducts = () => {
    setLoading(true);
    adminService
      .getProducts()
      .then((data) => setProducts(data))
      .catch((error: any) => {
        setProducts([]);
        toast.error(error.response?.data?.message || 'Could not load cylinder products.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      size: '14.2 kg',
      description: '',
      price: 900,
      inStock: true,
      deliveryCharge: 50,
      type: 'DOMESTIC',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      size: prod.size,
      description: prod.description,
      price: prod.price,
      inStock: prod.inStock,
      deliveryCharge: prod.deliveryCharge || 0,
      type: prod.type,
      isActive: prod.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.size || !formData.price) {
      toast.error('Name, size, and price are required');
      return;
    }
    setSaving(true);
    try {
      const sizeKg = parseFloat(String(formData.size).replace(/[^\d.]/g, ''));
      if (!Number.isFinite(sizeKg) || sizeKg <= 0) {
        toast.error('Enter a valid cylinder size in kg.');
        setSaving(false);
        return;
      }
      const payload = {
        name: formData.name,
        sizeKg,
        description: formData.description,
        price: Number(formData.price),
        deliveryCharge: Number(formData.deliveryCharge || 0),
        isCommercial: formData.type === 'COMMERCIAL',
        isActive: formData.isActive,
      };
      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, payload as any);
        toast.success('Product updated');
      } else {
        await adminService.addProduct(payload as any);
        toast.success('New cylinder catalog item added');
      }
      loadProducts();
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not save this cylinder product.');
    } finally {
      setSaving(false);
    }
  };

  const toggleProductActive = async (prod: Product) => {
    const nextStatus = !prod.isActive;
    try {
      await adminService.updateProduct(prod.id, { isActive: nextStatus });
      setProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, isActive: nextStatus } : p))
      );
      toast.success(`Cylinder marked ${nextStatus ? 'Active' : 'Disabled'}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not update this cylinder status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Cylinder Products & Pricing</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Configure cylinder capacities, refill prices, and delivery charges used at booking
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openAddModal} leftIcon={<Plus className="w-4 h-4" />}>
          Add New Cylinder Size
        </Button>
      </div>

      {loading ? (
        <div className="py-20">
          <Spinner label="Loading products catalog..." />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="px-5 py-3.5">Cylinder Name</th>
                  <th className="px-5 py-3.5">Weight / Size</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Refill Rate (₹)</th>
                  <th className="px-5 py-3.5">Delivery Charge (₹)</th>
                  <th className="px-5 py-3.5">Availability</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-accent flex items-center justify-center shrink-0">
                          <Flame className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 block text-xs sm:text-sm">
                            {prod.name}
                          </span>
                          <span className="text-[11px] text-gray-400 line-clamp-1 max-w-xs">
                            {prod.description}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-bold text-gray-800">{prod.size}</td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          prod.type === 'COMMERCIAL'
                            ? 'bg-blue-100 text-primary'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {prod.type}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-black text-gray-900 text-sm">₹{prod.price}</td>

                    <td className="px-5 py-3.5 font-semibold text-gray-700">
                      ₹{Number(prod.deliveryCharge || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => toggleProductActive(prod)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                          prod.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-accent border-red-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            prod.isActive ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                        />
                        {prod.isActive ? 'Active for Order' : 'Disabled'}
                      </button>
                    </td>

                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(prod)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 transition-colors"
                        title="Edit Price & Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Cylinder Product' : 'Add New Cylinder Size'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Product Name"
            placeholder="e.g. 14.2 kg Domestic Subsidized Cylinder"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Cylinder Size (e.g. 14.2 kg, 19 kg)"
              required
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Category Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="DOMESTIC">Domestic Household</option>
                <option value="COMMERCIAL">Commercial / Hotel</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Refill Unit Price (₹)"
              type="number"
              required
              min={1}
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            />
            <Input
              label="Delivery Charge (₹)"
              type="number"
              min={0}
              value={formData.deliveryCharge || 0}
              onChange={(e) =>
                setFormData({ ...formData, deliveryCharge: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description & Specifications
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide cylinder usage details..."
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              {editingProduct ? 'Update Product' : 'Save Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

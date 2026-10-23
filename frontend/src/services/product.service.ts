import api from './api';
import { Product } from '../types';

export function normalizeProduct(raw: any): Product {
  const sizeKg = raw.sizeKg !== undefined && raw.sizeKg !== null ? String(raw.sizeKg) : '';
  const size = raw.size || (sizeKg ? `${sizeKg} kg` : '') || '';
  const isCommercial = raw.isCommercial ?? (raw.type === 'COMMERCIAL');
  const type: 'DOMESTIC' | 'COMMERCIAL' = isCommercial ? 'COMMERCIAL' : 'DOMESTIC';

  return {
    id: String(raw.id || ''),
    name: raw.name || `${size} LPG Cylinder`,
    size: size,
    description: raw.description || '',
    price: typeof raw.price === 'number' ? raw.price : parseFloat(raw.price || 0) || 0,
    deliveryCharge: typeof raw.deliveryCharge === 'number'
      ? raw.deliveryCharge
      : parseFloat(raw.deliveryCharge || 0) || 0,
    inStock: raw.inStock ?? raw.isActive ?? true,
    stockQuantity: raw.stockQuantity,
    imageUrl: raw.imageUrl,
    type: type,
    isActive: raw.isActive ?? true,
  };
}

export const productService = {
  async getProducts(onlyActive = true): Promise<Product[]> {
    const res = await api.get<{ success: boolean; data: any[] }>('/products', {
      params: { active: onlyActive },
    });
    if (!Array.isArray(res.data?.data)) {
      throw new Error('The cylinder catalog response was invalid.');
    }
    return res.data.data.map(normalizeProduct);
  },

  async getProductById(id: string): Promise<Product> {
    const res = await api.get<{ success: boolean; data: any }>(`/products/${id}`);
    if (!res.data?.data) throw new Error('Product not found.');
    return normalizeProduct(res.data.data);
  },
};

import api from './api';
import { Product } from '../types';

export const fallbackProducts: Product[] = [
  {
    id: 'prod-5kg',
    name: '5 kg Domestic Mini Cylinder',
    size: '5 kg',
    description: 'Compact & lightweight portable cylinder ideal for bachelors, small households, students, and outdoor camping.',
    price: 360,
    inStock: true,
    stockQuantity: 50,
    type: 'DOMESTIC',
    isActive: true,
  },
  {
    id: 'prod-13kg',
    name: '13 kg Domestic LPG Cylinder',
    size: '13 kg',
    description: 'Standard domestic cylinder perfect for regular household cooking with extended refill intervals.',
    price: 620,
    inStock: true,
    stockQuantity: 80,
    type: 'DOMESTIC',
    isActive: true,
  },
  {
    id: 'prod-14kg',
    name: '14.2 kg Domestic LPG Cylinder',
    size: '14.2 kg',
    description: 'Standard domestic subsidized/non-subsidized LPG cylinder for regular household cooking and families.',
    price: 920,
    inStock: true,
    stockQuantity: 150,
    type: 'DOMESTIC',
    isActive: true,
  },
  {
    id: 'prod-15kg',
    name: '15 kg Commercial LPG Cylinder',
    size: '15 kg',
    description: 'Mid-size commercial cylinder designed for restaurants, catering services, and small food businesses.',
    price: 1350,
    inStock: true,
    stockQuantity: 40,
    type: 'COMMERCIAL',
    isActive: true,
  },
  {
    id: 'prod-19kg',
    name: '19.2 kg Large Domestic LPG Cylinder',
    size: '19.2 kg',
    description: 'High-capacity domestic cylinder for large families and extended usage with fewer refills needed.',
    price: 1450,
    inStock: true,
    stockQuantity: 60,
    type: 'DOMESTIC',
    isActive: true,
  },
  {
    id: 'prod-33kg',
    name: '33 kg Commercial LPG Cylinder',
    size: '33 kg',
    description: 'Standard commercial blue cylinder specifically engineered for restaurants, hotels, and heavy kitchen use.',
    price: 2850,
    inStock: true,
    stockQuantity: 35,
    type: 'COMMERCIAL',
    isActive: true,
  },
  {
    id: 'prod-50kg',
    name: '50 kg Heavy Duty Industrial LPG Cylinder',
    size: '50 kg',
    description: 'Heavy-duty industrial manifold cylinder for large-scale food processing, hotels, and manufacturing.',
    price: 4200,
    inStock: true,
    stockQuantity: 20,
    type: 'COMMERCIAL',
    isActive: true,
  },
  {
    id: 'prod-47kg',
    name: '47.5 kg Industrial LPG Cylinder',
    size: '47.5 kg',
    description: 'Large commercial and industrial manifold cylinder for heavy industrial processing and large hotels.',
    price: 4600,
    inStock: true,
    stockQuantity: 25,
    type: 'COMMERCIAL',
    isActive: true,
  },
  {
    id: 'prod-425kg',
    name: '425 kg Industrial LPG Vessel',
    size: '425 kg',
    description: 'Bulk LPG storage vessel for industrial plants, large manufacturing, and centralized gas distribution.',
    price: 52000,
    inStock: true,
    stockQuantity: 2,
    type: 'COMMERCIAL',
    isActive: true,
  },
  {
    id: 'prod-5kg-ftr',
    name: '5 kg Free Trade LPG (FTL)',
    size: '5 kg FTL',
    description: 'Ready-to-use cylinder available without requiring domestic address proof. Easy immediate refill access.',
    price: 490,
    inStock: true,
    stockQuantity: 40,
    type: 'DOMESTIC',
    isActive: true,
  },
];

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
    inStock: raw.inStock ?? raw.isActive ?? true,
    stockQuantity: raw.stockQuantity ?? 50,
    imageUrl: raw.imageUrl,
    type: type,
    isActive: raw.isActive ?? true,
  };
}

export const productService = {
  async getProducts(onlyActive = true): Promise<Product[]> {
    try {
      const res = await api.get<{ success: boolean; data: any[] }>('/products', {
        params: { active: onlyActive },
      });
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data.data.map(normalizeProduct);
      }
      return fallbackProducts;
    } catch {
      // Return default catalog if backend isn't up yet
      return fallbackProducts;
    }
  },

  async getProductById(id: string): Promise<Product> {
    try {
      const res = await api.get<{ success: boolean; data: any }>(`/products/${id}`);
      if (res.data?.data) {
        return normalizeProduct(res.data.data);
      }
      const found = fallbackProducts.find((p) => p.id === id);
      if (found) return found;
      throw new Error('Product not found');
    } catch {
      const found = fallbackProducts.find((p) => p.id === id);
      if (found) return found;
      throw new Error('Product not found');
    }
  },
};


import api from './api';
import { Product } from '../types';

export const fallbackProducts: Product[] = [
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
    id: 'prod-19kg',
    name: '19 kg Commercial LPG Cylinder',
    size: '19 kg',
    description: 'High-capacity commercial blue cylinder specifically engineered for restaurants, catering, and heavy kitchen use.',
    price: 1850,
    inStock: true,
    stockQuantity: 80,
    type: 'COMMERCIAL',
    isActive: true,
  },
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
];

export const productService = {
  async getProducts(onlyActive = true): Promise<Product[]> {
    try {
      const res = await api.get<{ success: boolean; data: Product[] }>('/products', {
        params: { active: onlyActive },
      });
      if (res.data?.data && res.data.data.length > 0) {
        return res.data.data;
      }
      return fallbackProducts;
    } catch {
      // Return default catalog if backend isn't up yet
      return fallbackProducts;
    }
  },

  async getProductById(id: string): Promise<Product> {
    try {
      const res = await api.get<{ success: boolean; data: Product }>(`/products/${id}`);
      return res.data.data;
    } catch {
      const found = fallbackProducts.find((p) => p.id === id);
      if (found) return found;
      throw new Error('Product not found');
    }
  },
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, ShieldCheck, CheckCircle2, ShoppingCart, Filter, Search } from 'lucide-react';
import { productService } from '../../services/product.service';
import { Product } from '../../types';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../contexts/AuthContext';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'DOMESTIC' | 'COMMERCIAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    productService.getProducts(false).then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory === 'ALL' || prod.type === selectedCategory;
    const matchesSearch =
      (prod.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.size || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getProductImage = (prod: Product) => {
    const size = (prod.size || '').toLowerCase();
    const name = (prod.name || '').toLowerCase();
    if (size.includes('425') || name.includes('425')) return '/assets/cylinders/425kg.jpg';
    if (size.includes('33') || name.includes('33')) return '/assets/cylinders/33kg.jpg';
    if (size.includes('19') || name.includes('19')) return '/assets/cylinders/19kg.jpg';
    if (size.includes('50') || name.includes('50')) return '/assets/cylinders/50kg.svg';
    if (size.includes('15') || name.includes('15')) return '/assets/cylinders/15kg.svg';
    if (size.includes('13') || name.includes('13')) return '/assets/cylinders/13kg.svg';
    if (size.includes('5') || name.includes('5')) return '/assets/cylinders/5kg.svg';
    return '/assets/cylinders/hero-cylinder.jpg';
  };

  return (
    <div className="bg-[#F3F8FD] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/25 px-3.5 py-1 rounded-full">
            Official Catalog
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#17365D] mt-3 tracking-tight">
            LPG Cylinders & Refill Variants
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#64748B]">
            Select from standard domestic kitchen cylinders to heavy commercial manifold cylinders. All units are inspected and weigh-scale verified before dispatch.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-[#17365D] text-white shadow'
                  : 'bg-[#F3F8FD] text-[#64748B] hover:bg-gray-100'
              }`}
            >
              All Cylinders ({products.length})
            </button>
            <button
              onClick={() => setSelectedCategory('DOMESTIC')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedCategory === 'DOMESTIC'
                  ? 'bg-[#17365D] text-white shadow'
                  : 'bg-[#F3F8FD] text-[#64748B] hover:bg-gray-100'
              }`}
            >
              Domestic ({products.filter((p) => p.type === 'DOMESTIC').length})
            </button>
            <button
              onClick={() => setSelectedCategory('COMMERCIAL')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedCategory === 'COMMERCIAL'
                  ? 'bg-[#17365D] text-white shadow'
                  : 'bg-[#F3F8FD] text-[#64748B] hover:bg-gray-100'
              }`}
            >
              Commercial ({products.filter((p) => p.type === 'COMMERCIAL').length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cylinders by weight or name..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2878C8]"
            />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" label="Loading cylinder catalog..." />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((prod) => {
              const isUnavailable = !prod.inStock || !prod.isActive;

              return (
                <div
                  key={prod.id}
                  className={`bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl ${
                    isUnavailable
                      ? 'opacity-60 bg-gray-50 border-[#E2E8F0] pointer-events-none grayscale'
                      : 'border-[#E2E8F0] hover:border-[#2878C8]'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          prod.type === 'COMMERCIAL'
                            ? 'bg-[#2878C8]/10 text-[#2878C8]'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {prod.type}
                      </span>
                      <span className="text-xs font-black text-[#17365D] bg-[#F3F8FD] border border-[#E2E8F0] px-2.5 py-0.5 rounded-lg">
                        {prod.size}
                      </span>
                    </div>

                    <div className="w-full aspect-[4/3] my-3 rounded-2xl bg-[#F3F8FD] p-3 flex items-center justify-center border border-[#E2E8F0]">
                      <img
                        src={getProductImage(prod)}
                        alt={prod.name}
                        className="max-h-36 w-auto object-contain transition-transform duration-300 hover:scale-105 drop-shadow"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/cylinders/hero-cylinder.jpg';
                        }}
                      />
                    </div>

                    <h3 className="text-lg font-bold text-[#17365D] text-center mb-1">
                      {prod.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] text-center leading-relaxed mb-4">
                      {prod.description}
                    </p>

                    <div className="space-y-1.5 pt-3 border-t border-[#E2E8F0] text-xs text-[#1F2937]">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
                        <span>Weight check certified at delivery</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#2878C8]" />
                        <span>Tamper-proof safety shrink seal</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-[#F3F8FD] border-t border-[#E2E8F0] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#64748B] block font-medium">Refill Rate</span>
                      <span className="text-2xl font-black text-[#17365D]">₹{prod.price}</span>
                    </div>
                    {isUnavailable ? (
                      <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                        Out of Stock
                      </span>
                    ) : (
                      <Link to={isAuthenticated ? '/dashboard/orders/new' : '/login'}>
                        <Button
                          variant="accent"
                          size="sm"
                          leftIcon={<ShoppingCart className="w-4 h-4" />}
                          className="font-bold shadow"
                        >
                          Order Refill
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 p-8">
            <p className="text-base font-semibold text-gray-700">No cylinders found matching your search</p>
            <p className="text-xs text-gray-400 mt-1">Try clearing your filters or search keywords</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

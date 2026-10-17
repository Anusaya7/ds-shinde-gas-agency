import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, ShoppingCart, Search } from 'lucide-react';
import { productService } from '../../services/product.service';
import { Product } from '../../types';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const cylinderSizes = ['12', '15', '17', '19.2', '21', '33', '50', '425'];

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'DOMESTIC' | 'COMMERCIAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    productService.getProducts(false).then((data) => {
      setProducts(data);
    }).catch((error: any) => {
      const message = error.response?.data?.message || 'Could not load available cylinders.';
      setLoadError(message);
      toast.error(message);
    }).finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory === 'ALL' || prod.type === selectedCategory;
    const matchesSearch =
      (prod.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.size || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-[#F6F8FB] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F47721] bg-orange-50 border border-orange-200 px-3.5 py-1.5 rounded-full">
            DS Shinde Gas catalog
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#10284A] mt-3 tracking-tight">
            Find your LPG cylinder
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            See the Gaspoint cylinder range, then check the live catalog below for current
            availability and prices.
          </p>
        </div>

        <section
          className="mb-8 grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm lg:grid-cols-[1.25fr_0.75fr]"
          aria-labelledby="products-size-guide-title"
        >
          <div className="flex items-center justify-center bg-white p-3 sm:p-6">
            <img
              src="/assets/cylinders/cylinder-size-range.jpeg"
              alt="Gaspoint LPG cylinder comparison showing 12, 15, 17, 19.2, 21, 33, 50 and 425 kilogram capacities"
              className="h-auto w-full rounded-2xl object-contain"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col justify-center bg-[#10284A] p-6 text-white sm:p-8">
            <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-orange-200">
              Gaspoint size guide
            </span>
            <h2 id="products-size-guide-title" className="mt-3 text-2xl font-black sm:text-3xl">
              Eight capacities. One clear view.
            </h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {cylinderSizes.map((size) => (
                <span key={size} className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold">
                  {size} kg
                </span>
              ))}
            </div>
            <p className="mt-5 text-sm leading-6 text-blue-100">
              The image is a size reference only. Prices and stock in the live catalog are set
              separately; contact us to confirm your required size.
            </p>
            <Link
              to="/contact"
              className="mt-5 inline-flex min-h-11 items-center justify-center self-start rounded-xl bg-[#F47721] px-4 text-sm font-bold text-white transition hover:bg-[#DD6414]"
            >
              Ask about availability
            </Link>
          </div>
        </section>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-[#10284A] text-white shadow'
                  : 'bg-[#F6F8FB] text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Cylinders ({products.length})
            </button>
            <button
              onClick={() => setSelectedCategory('DOMESTIC')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedCategory === 'DOMESTIC'
                  ? 'bg-[#10284A] text-white shadow'
                  : 'bg-[#F6F8FB] text-slate-600 hover:bg-slate-100'
              }`}
            >
              Domestic ({products.filter((p) => p.type === 'DOMESTIC').length})
            </button>
            <button
              onClick={() => setSelectedCategory('COMMERCIAL')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedCategory === 'COMMERCIAL'
                  ? 'bg-[#10284A] text-white shadow'
                  : 'bg-[#F6F8FB] text-slate-600 hover:bg-slate-100'
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
              className="w-full pl-9 pr-4 py-2 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F47721]"
            />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" label="Loading cylinder catalog..." />
          </div>
        ) : loadError ? (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-800">
            {loadError}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                            ? 'bg-orange-50 text-[#B94A0B]'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {prod.type}
                      </span>
                      <span className="text-xs font-black text-[#10284A] bg-[#F6F8FB] border border-[#E2E8F0] px-2.5 py-0.5 rounded-lg">
                        {prod.size}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-[#10284A] text-center mb-1">
                      {prod.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#64748B] text-center leading-relaxed mb-4">
                      {prod.description}
                    </p>

                    <div className="space-y-1.5 pt-3 border-t border-[#E2E8F0] text-xs text-slate-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Price shown from the live agency catalog</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#10284A]" />
                        <span>Inspect the safety seal at handover</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-[#F6F8FB] border-t border-[#E2E8F0] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 block font-medium">Catalog price</span>
                      <span className="text-2xl font-black text-[#10284A]">₹{prod.price}</span>
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
                          {isAuthenticated ? 'Order Cylinder' : 'Customer Booking'}
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

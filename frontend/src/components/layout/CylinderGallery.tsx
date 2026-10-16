import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, ArrowRight, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { productService } from '../../services/product.service';
import { Product } from '../../types';

interface CylinderConfig {
  kg: string;
  title: string;
  description: string;
  useCase: string;
  image: string;
  fallbackColor: string;
  productType: 'DOMESTIC' | 'COMMERCIAL';
}

const CYLINDER_CATALOG: CylinderConfig[] = [
  {
    kg: '5 KG',
    title: '5 KG Domestic Mini',
    description: 'Compact & lightweight portable cylinder ideal for bachelors, small households, students, and outdoor camping.',
    useCase: 'Best for: Small homes, bachelors, camping',
    image: '/assets/cylinders/5kg.svg',
    fallbackColor: '#d4af37',
    productType: 'DOMESTIC',
  },
  {
    kg: '13 KG',
    title: '13 KG Domestic LPG',
    description: 'Standard domestic cylinder perfect for regular household cooking with extended refill intervals.',
    useCase: 'Best for: Medium families, daily cooking',
    image: '/assets/cylinders/13kg.svg',
    fallbackColor: '#bdbdbd',
    productType: 'DOMESTIC',
  },
  {
    kg: '15 KG',
    title: '15 KG Commercial',
    description: 'Mid-size commercial cylinder designed for restaurants, catering services, and small food businesses.',
    useCase: 'Best for: Small restaurants, catering',
    image: '/assets/cylinders/15kg.svg',
    fallbackColor: '#9e9e9e',
    productType: 'COMMERCIAL',
  },
  {
    kg: '19.2 KG',
    title: '19.2 KG Large Domestic',
    description: 'High-capacity domestic cylinder for large families and extended usage with fewer refills needed.',
    useCase: 'Best for: Large families, heavy usage',
    image: '/assets/cylinders/19kg.svg',
    fallbackColor: '#8bc34a',
    productType: 'DOMESTIC',
  },
  {
    kg: '33 KG',
    title: '33 KG Commercial LPG',
    description: 'Standard commercial blue cylinder specifically engineered for restaurants, hotels, and heavy kitchen use.',
    useCase: 'Best for: Restaurants, hotels, canteens',
    image: '/assets/cylinders/33kg.svg',
    fallbackColor: '#7cb342',
    productType: 'COMMERCIAL',
  },
  {
    kg: '50 KG',
    title: '50 KG Heavy Duty Industrial',
    description: 'Heavy-duty industrial manifold cylinder for large-scale food processing, hotels, and manufacturing.',
    useCase: 'Best for: Factories, large hotels, industrial',
    image: '/assets/cylinders/50kg.svg',
    fallbackColor: '#6d4c41',
    productType: 'COMMERCIAL',
  },
  {
    kg: '425 KG',
    title: '425 KG Industrial Vessel',
    description: 'Bulk LPG storage vessel for industrial plants, large manufacturing, and centralized gas distribution.',
    useCase: 'Best for: Industrial plants, bulk supply',
    image: '/assets/cylinders/425kg.svg',
    fallbackColor: '#17365D',
    productType: 'COMMERCIAL',
  },
];

interface CylinderCardProps {
  config: CylinderConfig;
  product?: Product;
  onSelect: (kg: string, productId?: string) => void;
  isLoading?: boolean;
}

const CylinderCard: React.FC<CylinderCardProps> = ({
  config,
  product,
  onSelect,
  isLoading = false,
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleOrder = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Find matching product
    const cleanKg = config.kg.replace(' KG', '').trim().toLowerCase();
    const matchingProduct = product || 
      (window as any).__CYLINDER_PRODUCTS__?.find((p: Product) => 
        (p?.size || '').toLowerCase().includes(cleanKg)
      );
    
    onSelect(config.kg, matchingProduct?.id);
  };

  const inStock = product?.inStock !== false;
  const price = product?.price;

  return (
    <div className="group bg-white rounded-2xl border border-border-DEFAULT shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden h-full flex flex-col">
      {/* Image container */}
      <div className="relative aspect-[4/5] bg-background-secondary flex items-center justify-center overflow-hidden p-4">
        <img
          src={config.image}
          alt={`${config.kg} LPG cylinder`}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
        {/* Fallback visual */}
        <div className="hidden absolute inset-0 flex flex-col items-center justify-center p-6">
          <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mb-3`} style={{ backgroundColor: config.fallbackColor }}>
            <Flame className="w-12 h-12 text-white" />
          </div>
          <span className="text-xs font-semibold text-primaryDark text-center">
            {config.kg} LPG Cylinder
          </span>
        </div>
        
        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
            config.productType === 'COMMERCIAL'
              ? 'bg-secondary/10 text-secondary border border-secondary/30'
              : 'bg-success/10 text-success border border-success/30'
          }`}>
            {config.productType}
          </span>
        </div>

        {/* Stock indicator */}
        <div className="absolute top-3 right-3">
          <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${
            inStock
              ? 'bg-success/10 text-success border border-success/30'
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            {inStock ? (
              <>
                <Check className="w-3 h-3" /> In Stock
              </>
            ) : (
              'Out of Stock'
            )}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Capacity label */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-extrabold text-primaryDark tracking-tight">{config.kg}</span>
          {price && (
            <span className="text-lg font-bold text-primaryDark">₹{price}</span>
          )}
        </div>

        <h3 className="font-semibold text-text-primary mb-1 text-base">{config.title}</h3>
        <p className="text-sm text-text-secondary mb-3 line-clamp-2 flex-1">{config.description}</p>

        {/* Use case */}
        <div className="mb-4 p-3 rounded-xl bg-background-secondary border border-border-light">
          <p className="text-xs text-text-secondary">{config.useCase}</p>
        </div>

        {/* Action button */}
        <Button
          variant="primary"
          size="md"
          className="w-full font-semibold"
          onClick={handleOrder}
          disabled={!inStock || isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          {inStock ? 'Select Cylinder' : 'Notify When Available'}
        </Button>
      </div>
    </div>
  );
};

export const CylinderGallery: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    productService.getProducts(true).then((prods) => {
      setProducts(prods);
      // Store globally for card access
      (window as any).__CYLINDER_PRODUCTS__ = prods;
      setLoading(false);
    });
  }, []);

  const handleSelect = (kg: string, productId?: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Navigate to order page with pre-selected cylinder
    navigate('/dashboard/orders/new', {
      state: { preSelectKg: kg, preSelectProductId: productId },
    });
  };

  return (
    <section className="py-16 bg-background-primary" id="cylinder-gallery">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5" />
            Cylinder Catalog
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary mt-4 tracking-tight">
            Explore Our LPG Cylinder Sizes
          </h2>
          <p className="text-base text-text-secondary mt-3 max-w-2xl mx-auto">
            Find the right capacity for your home, commercial kitchen, business or industrial use.
            All cylinders are weight-verified and safety-sealed before dispatch.
          </p>
        </div>

        {/* Cylinder Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-5">
          {CYLINDER_CATALOG.map((config) => {
            const cleanKg = config.kg.replace(' KG', '').trim().toLowerCase();
            const matchingProduct = products.find((p) => {
              const pSize = (p?.size || '').toLowerCase();
              const pName = (p?.name || '').toLowerCase();
              return pSize.includes(cleanKg) || pName.includes(cleanKg);
            });

            return (
              <CylinderCard
                key={config.kg}
                config={config}
                product={matchingProduct}
                onSelect={handleSelect}
                isLoading={loading}
              />
            );
          })}
        </div>

        {/* Responsive grid note: Tailwind handles 7 columns on xl, 4 on lg, 2 on md/sm, 1 on mobile */}

        {/* View All Link */}
        <div className="text-center mt-10">
          <Link to="/products">
            <Button variant="outline" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View All Cylinder Details & Pricing
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
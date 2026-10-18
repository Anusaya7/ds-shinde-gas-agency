import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  MapPin,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Package,
} from 'lucide-react';
import { Stepper, StepItem } from '../../components/ui/Stepper';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { customerService } from '../../services/customer.service';
import { productService } from '../../services/product.service';
import { orderService } from '../../services/order.service';
import { Address, Product, PaymentMethod, Order } from '../../types';
import {
  clearCustomerBookingCoordinates,
  getCustomerBookingMapLink,
} from '../../utils/customerBookingLocation';
import toast from 'react-hot-toast';

const STEPS: StepItem[] = [
  { title: 'Delivery Address', subtitle: 'Where to deliver' },
  { title: 'Select Cylinder', subtitle: 'Choose type & qty' },
  { title: 'Payment Preference', subtitle: 'Select preferred method' },
  { title: 'Review & Confirm', subtitle: 'Final verification' },
];

export const NewOrder: React.FC = () => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingError, setLoadingError] = useState('');
  const [durationDays, setDurationDays] = useState(1);
  const [reminderConsent, setReminderConsent] = useState(false);
  const [fsiNumber, setFsiNumber] = useState('');
  const [udyamDocument, setUdyamDocument] = useState<File | undefined>();
  const [udyamConsent, setUdyamConsent] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [signupLocationMapLink, setSignupLocationMapLink] = useState('');

  // Addresses
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [addressForm, setAddressForm] = useState<Omit<Address, 'id'>>({
    fullName: user?.name || '',
    phone: user?.phone || '',
    altPhone: '',
    addressLine1: '',
    addressLine2: '',
    area: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    landmark: '',
    mapLink: '',
    isDefault: true,
  });
  const [saveThisAddress, setSaveThisAddress] = useState(true);

  useEffect(() => {
    try {
      const mapLink = getCustomerBookingMapLink();
      setSignupLocationMapLink(mapLink);
      if (mapLink) {
        setAddressForm((current) => ({
          ...current,
          mapLink: current.mapLink || mapLink,
        }));
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not read the saved location. Enter your delivery address manually.'
      );
    }
  }, []);

  // Products & Cart
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [orderNotes, setOrderNotes] = useState('');

  // Completed Order State for Success Screen
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Fetch initial data
  useEffect(() => {
    setLoading(true);
    setLoadingError('');
    Promise.all([
      customerService.getAddresses().catch(() => []),
      productService.getProducts(true),
    ])
      .then(([addresses, prods]) => {
        if (addresses && addresses.length > 0) {
          setSavedAddresses(addresses);
          const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
          setSelectedAddressId(defaultAddr.id);
          setAddressForm({
            fullName: defaultAddr.fullName,
            phone: defaultAddr.phone,
            altPhone: defaultAddr.altPhone || '',
            addressLine1: defaultAddr.addressLine1,
            addressLine2: defaultAddr.addressLine2 || '',
            area: defaultAddr.area,
            city: defaultAddr.city,
            state: defaultAddr.state,
            pincode: defaultAddr.pincode,
            landmark: defaultAddr.landmark || '',
            mapLink: defaultAddr.mapLink || '',
            isDefault: !!defaultAddr.isDefault,
          });
        }
        setProducts(prods.filter((p) => p.inStock && p.isActive));

        // Default 1 qty of standard 12kg Gaspoint cylinder if available
        const defaultProd = prods.find((p) => (p?.size || '').includes('12')) || prods[0];
        if (defaultProd) {
          setCart({ [defaultProd.id]: 1 });
        }
      })
      .catch((error: any) => {
        setLoadingError(
          error.response?.data?.message ||
            'Cylinder prices are unavailable. Please try again when the booking service is online.'
        );
      })
      .finally(() => setLoading(false));
  }, [user]);

  const captureDeliveryLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Location is not available in this browser. You can enter or edit the map link below.');
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setAddressForm((current) => ({
          ...current,
          mapLink: `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`,
        }));
        setGettingLocation(false);
        toast.success('Location added. You can edit the map link before continuing.');
      },
      () => {
        setGettingLocation(false);
        toast.error('Location permission was not granted. You can enter the address and map link manually.');
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 }
    );
  };

  const handleUdyamDocument = (file?: File) => {
    if (!file) {
      setUdyamDocument(undefined);
      return;
    }
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Choose a PDF, JPEG, PNG, or WebP certificate.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('The optional Udyam certificate must be 5 MB or smaller.');
      return;
    }
    setUdyamDocument(file);
  };

  // Handle pre-selected cylinder from homepage or other entry points
  const location = useLocation();
  const preSelectKg = location.state?.preSelectKg;
  const preSelectProductId = location.state?.preSelectProductId;

  // Apply pre-selection after products are loaded
  useEffect(() => {
    if (preSelectKg && preSelectProductId && !loading) {
      const cleanKg = preSelectKg.replace(' KG', '').trim();
      const prod = products.find((p) => p.id === preSelectProductId || (p?.size || '').includes(cleanKg));
      if (prod) {
        setCart({ [prod.id]: 1 });
      }
    }
  }, [preSelectKg, preSelectProductId, products, loading]);

  const handleAddressSelect = (id: string) => {
    setSelectedAddressId(id);
    if (id !== 'new') {
      const found = savedAddresses.find((a) => a.id === id);
      if (found) {
        setAddressForm({
          fullName: found.fullName,
          phone: found.phone,
          altPhone: found.altPhone || '',
          addressLine1: found.addressLine1,
          addressLine2: found.addressLine2 || '',
          area: found.area,
          city: found.city,
          state: found.state,
          pincode: found.pincode,
          landmark: found.landmark || '',
          mapLink: found.mapLink || '',
          isDefault: !!found.isDefault,
        });
      }
    } else {
      setAddressForm({
        fullName: user?.name || '',
        phone: user?.phone || '',
        altPhone: '',
        addressLine1: '',
        addressLine2: '',
        area: '',
        city: '',
        state: 'Maharashtra',
        pincode: '',
        landmark: '',
        mapLink: signupLocationMapLink,
        isDefault: false,
      });
    }
  };

  // Cart operations
  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const next = current + delta;
      const updated = { ...prev };
      if (next <= 0) {
        delete updated[productId];
      } else {
        updated[productId] = next;
      }
      return updated;
    });
  };

  // Calculations
  const selectedItems = Object.entries(cart)
    .map(([prodId, qty]) => {
      const prod = products.find((p) => p.id === prodId);
      if (!prod) return null;
      return {
        productId: prod.id,
        productName: prod.name,
        size: prod.size,
        type: prod.type,
        deliveryCharge: prod.deliveryCharge || 0,
        unitPrice: prod.price,
        quantity: qty,
        subtotal: prod.price * qty,
      };
    })
    .filter(Boolean) as Array<{
    productId: string;
    productName: string;
    size: string;
    type: Product['type'];
    deliveryCharge: number;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }>;

  const subtotal = selectedItems.reduce((acc, item) => acc + item.subtotal, 0);
  const deliveryCharges =
    selectedItems.length > 0
      ? Math.max(
          ...selectedItems.map((item) =>
            item.deliveryCharge > 0 ? item.deliveryCharge : settings.deliveryCharges
          )
        )
      : 0;
  const hasCommercialItem = selectedItems.some((item) => item.type === 'COMMERCIAL');
  const taxes = hasCommercialItem ? Math.round((subtotal * settings.taxPercentage) / 100) : 0;
  const paymentFee = paymentMethod === 'CARD' ? Math.round((subtotal + deliveryCharges + taxes) * (settings.onlinePaymentFee || 3) / 100 * 100) / 100 : 0;
  const totalAmount = subtotal + deliveryCharges + taxes + paymentFee;

  // Step Validation
  const validateStep1 = () => {
    if (!addressForm.fullName.trim()) {
      toast.error('Recipient name is required');
      return false;
    }
    if (!addressForm.phone || addressForm.phone.length < 10) {
      toast.error('Valid 10-digit delivery phone is required');
      return false;
    }
    if (!addressForm.addressLine1.trim()) {
      toast.error('Delivery flat / building address is required');
      return false;
    }
    if (!addressForm.area.trim()) {
      toast.error('Delivery area / sector is required');
      return false;
    }
    if (!addressForm.pincode || addressForm.pincode.length < 6) {
      toast.error('Valid 6-digit Pincode is required');
      return false;
    }
    if (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > 31) {
      toast.error('Choose a booking duration from 1 to 31 days.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least 1 cylinder refill to proceed');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setCurrentStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Order
  const handleConfirmOrder = async () => {
    if (submitting) return;
    if (udyamDocument && !udyamConsent) {
      toast.error('Consent is required before uploading the optional Udyam certificate.');
      return;
    }
    setSubmitting(true);

    try {
      if (udyamDocument || fsiNumber.trim()) {
        await customerService.saveBusinessDetails({
          ...(fsiNumber.trim() && { fsiNumber: fsiNumber.trim() }),
          ...(udyamDocument && { udyamDocument }),
          ...(udyamDocument && { udyamConsent }),
        });
      }

      if (user?.name !== addressForm.fullName.trim()) {
        await customerService.updateProfile({ name: addressForm.fullName.trim() });
      }

      // Save address if marked and newly entered
      if (selectedAddressId === 'new' && saveThisAddress) {
        await customerService.addAddress(addressForm);
      }

      const activeDeliveryAddress: Address = {
        id: selectedAddressId === 'new' ? `addr-${Date.now()}` : selectedAddressId,
        ...addressForm,
      };

      const payload = {
        deliveryAddress: activeDeliveryAddress,
        items: selectedItems.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          size: item.size,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
        })),
        paymentMethod,
        bookingDurationDays: durationDays,
        remindersEnabled: reminderConsent,
        fsiNumber: fsiNumber.trim() || undefined,
        notes: orderNotes.trim() || undefined,
      };

      const createdOrder = await orderService.createOrder(payload);
      setCompletedOrder(createdOrder);
      try {
        clearCustomerBookingCoordinates();
      } catch {
        toast.error('Booking submitted, but the saved location remains in this browser tab.');
      }
      toast.success('Booking submitted for admin review. Payment will be available after approval.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" label="Preparing cylinder catalog and addresses..." />
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
        <AlertCircle className="mx-auto h-10 w-10 text-red-600" />
        <h1 className="mt-3 text-lg font-bold text-gray-900">Booking details are unavailable</h1>
        <p role="alert" className="mt-2 text-sm text-red-800">{loadingError}</p>
        <Button className="mt-4" variant="primary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-200 shadow-xl text-center space-y-6">
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl shadow-inner ${
            completedOrder.paymentStatus === 'PAID'
              ? 'bg-emerald-100 text-emerald-600'
              : completedOrder.paymentStatus === 'FAILED'
                ? 'bg-red-100 text-red-600'
                : 'bg-amber-100 text-amber-700'
          }`}>
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              {completedOrder.orderStatus === 'AWAITING_REVIEW' ? 'Pending admin approval' : 'Booking submitted'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">
              Order #{completedOrder.orderNumber}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Your booking is recorded. Payment will be available after agency approval.
            </p>
          </div>

          <div className={`rounded-2xl border p-4 text-left text-sm ${
            completedOrder.paymentStatus === 'PAID'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : completedOrder.paymentStatus === 'FAILED'
                ? 'border-red-200 bg-red-50 text-red-900'
                : 'border-amber-200 bg-amber-50 text-amber-900'
          }`}>
            Payment status: <strong>{completedOrder.paymentStatus}</strong>
            <span className="mt-1 block">Final payable: <strong>₹{completedOrder.totalAmount}</strong></span>
            <span className="mt-1 block">
              Booking duration: <strong>{completedOrder.bookingDurationDays || durationDays}{' '}
                {(completedOrder.bookingDurationDays || durationDays) === 1 ? 'day' : 'days'}</strong>
            </span>
            {completedOrder.paymentStatus !== 'PAID' && (
              <span className="mt-2 block text-xs">You can pay securely from My Orders after the agency approves this booking.</span>
            )}
          </div>

          {/* Order Details summary */}
          <div className="text-left bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between border-b border-gray-200/60 pb-2">
              <span className="text-gray-500">Recipient Name</span>
              <span className="font-bold text-gray-900">{completedOrder.customerName}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/60 pb-2">
              <span className="text-gray-500">Delivery Address</span>
              <span className="font-semibold text-gray-800 text-right max-w-xs">
                {completedOrder.deliveryAddress.addressLine1}, {completedOrder.deliveryAddress.area},{' '}
                {completedOrder.deliveryAddress.city} - {completedOrder.deliveryAddress.pincode}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-200/60 pb-2">
              <span className="text-gray-500">Selected Items</span>
              <span className="font-bold text-gray-900">
                {completedOrder.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-200/60 pb-2">
              <span className="text-gray-500">Payment Mode</span>
              <span className="font-bold text-gray-900">
                {completedOrder.paymentMethod} ({completedOrder.paymentStatus})
              </span>
            </div>
            {(completedOrder.welcomeOfferDiscount || 0) > 0 && (
              <div className="flex justify-between border-b border-gray-200/60 pb-2 text-emerald-700">
                <span>New customer welcome offer</span>
                <span className="font-bold">−₹{completedOrder.welcomeOfferDiscount}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 text-base font-extrabold text-gray-900">
              <span>Total Payable</span>
              <span className="text-primary">₹{completedOrder.totalAmount}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to={`/dashboard/orders/${completedOrder.id}`} className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full" leftIcon={<Package className="w-4 h-4" />}>
                View Booking Status
              </Button>
            </Link>
            <Link to="/dashboard/orders" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full">
                View My Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Book with DS Shinde Gas
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Complete the quick steps below to schedule genuine cylinder delivery at your doorstep
        </p>
      </div>

      {loadingError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadingError}
        </div>
      )}

      {/* Stepper Indicator */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm">
        <Stepper
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={(step) => {
            if (step < currentStep) setCurrentStep(step);
          }}
        />
      </div>

      {/* STEP 1: DELIVERY DETAILS */}
      {currentStep === 1 && (
        <Card title="Step 1: Delivery Location & Recipient">
          <div className="space-y-6">
            {/* Saved Address Selector */}
            {savedAddresses.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                  Select a Saved Address
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => handleAddressSelect(addr.id)}
                      className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-primary bg-blue-50/60 ring-2 ring-blue-100 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-900 text-sm">{addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold text-primary bg-blue-100 px-1.5 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 line-clamp-2">
                        {addr.addressLine1}, {addr.area}, {addr.city} - {addr.pincode}
                      </p>
                      <p className="text-gray-500 mt-1 font-medium">📞 {addr.phone}</p>
                    </div>
                  ))}

                  <div
                    onClick={() => handleAddressSelect('new')}
                    className={`p-4 rounded-xl border border-dashed text-xs cursor-pointer flex flex-col items-center justify-center text-center transition-all min-h-[90px] ${
                      selectedAddressId === 'new'
                        ? 'border-primary bg-blue-50 text-primary font-bold'
                        : 'border-gray-300 text-gray-500 hover:border-gray-400'
                    }`}
                  >
                    <Plus className="w-5 h-5 mb-1" />
                    <span>Deliver to a New Address</span>
                  </div>
                </div>
              </div>
            )}

            {/* Address Input Form */}
            <div className="pt-2 border-t border-gray-100 space-y-4">
              <h4 className="text-sm font-bold text-gray-800">
                {selectedAddressId === 'new' ? 'Enter Delivery Information' : 'Confirm Recipient Details'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name of Recipient"
                  placeholder="e.g. Rahul Sharma"
                  required
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                />
                <Input
                  label="Primary Phone Number"
                  placeholder="10-digit mobile number"
                  type="tel"
                  maxLength={10}
                  required
                  value={addressForm.phone}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, '') })
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Alternate Phone (Optional)"
                  placeholder="e.g. 9988776655"
                  type="tel"
                  maxLength={10}
                  value={addressForm.altPhone || ''}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, altPhone: e.target.value.replace(/\D/g, '') })
                  }
                />
                <Input
                  label="Area / Neighborhood / Locality"
                  placeholder="e.g. Central City or Market Yard"
                  required
                  value={addressForm.area}
                  onChange={(e) => setAddressForm({ ...addressForm, area: e.target.value })}
                />
              </div>

              <Input
                label="Flat, House No., Building, Apartment Name"
                placeholder="e.g. Flat 302, Sai Heights, Opposite Shiv Temple"
                required
                value={addressForm.addressLine1}
                onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="City"
                  required
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                />
                <Input
                  label="State"
                  required
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                />
                <Input
                  label="Pincode"
                  required
                  maxLength={6}
                  value={addressForm.pincode}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '') })
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Prominent Landmark (Optional)"
                  placeholder="e.g. Near City Post Office"
                  value={addressForm.landmark || ''}
                  onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                />
                <Input
                  label="Google Maps Link (Optional)"
                  placeholder="Paste or add your map location"
                  value={addressForm.mapLink || ''}
                  onChange={(e) => setAddressForm({ ...addressForm, mapLink: e.target.value })}
                />
                <button
                  type="button"
                  onClick={captureDeliveryLocation}
                  disabled={gettingLocation}
                  className="min-h-11 self-end rounded-xl border border-[#10284A] px-3 text-sm font-semibold text-[#10284A] hover:bg-blue-50 disabled:opacity-60"
                >
                  {gettingLocation ? 'Getting location…' : 'Use my current location'}
                </button>
              </div>

              <fieldset className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <legend className="px-2 text-sm font-extrabold text-[#10284A]">
                  Booking duration <span className="text-red-600">*</span>
                </legend>
                <label htmlFor="booking-duration" className="block text-sm font-semibold text-slate-800">
                  Choose a duration from 1 to 31 days. If you consent, reminders run during this period after delivery.
                </label>
                <select
                  id="booking-duration"
                  value={durationDays}
                  onChange={(event) => setDurationDays(Number(event.target.value))}
                  required
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-[#10284A] focus:border-[#10284A] focus:outline-none focus:ring-2 focus:ring-[#10284A]/15 sm:max-w-xs"
                >
                  {Array.from({ length: 31 }, (_, index) => index + 1).map((days) => (
                    <option key={days} value={days}>
                      {days} {days === 1 ? 'day' : 'days'}
                    </option>
                  ))}
                </select>
                <p role="status" className="text-sm text-slate-700">
                  Selected booking duration: <strong>{durationDays} {durationDays === 1 ? 'day' : 'days'}</strong>.
                  Duration is a reminder window and does not multiply the cylinder quantity or price.
                </p>
                <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-5 text-slate-700">
                  <input
                    type="checkbox"
                    checked={reminderConsent}
                    onChange={(event) => setReminderConsent(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-[#10284A] focus:ring-[#10284A]"
                  />
                  <span>
                    I agree to receive an in-app refill reminder every 2 days after delivery,
                    during this booking period. I can leave this unchecked.
                  </span>
                </label>
              </fieldset>

              <details className="rounded-xl border border-slate-200 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-slate-800">
                  Optional business information
                </summary>
                <div className="mt-4 space-y-4">
                  <Input
                    label="FSI number (optional, if applicable)"
                    maxLength={40}
                    value={fsiNumber}
                    onChange={(event) => setFsiNumber(event.target.value)}
                  />
                  <div>
                    <label htmlFor="udyam-document" className="mb-1.5 block text-sm font-semibold text-slate-800">
                      Udyam certificate (optional; upload only if required)
                    </label>
                    <input
                      id="udyam-document"
                      type="file"
                      accept=".pdf,image/jpeg,image/png,image/webp"
                      onChange={(event) => handleUdyamDocument(event.target.files?.[0])}
                      aria-describedby="udyam-file-hint"
                      className="block w-full rounded-xl border border-slate-300 p-2 text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-blue-50 file:px-2 file:py-2 file:font-bold file:text-[#10284A]"
                    />
                    <p id="udyam-file-hint" className="mt-1 text-xs leading-5 text-slate-500">
                      PDF, JPEG, PNG or WebP; maximum 5 MB. The file is encrypted and only administrators can view it.
                    </p>
                    {udyamDocument && (
                      <p className="mt-1 text-xs font-semibold text-emerald-700">{udyamDocument.name}</p>
                    )}
                    <label className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-700">
                      <input
                        type="checkbox"
                        checked={udyamConsent}
                        onChange={(event) => setUdyamConsent(event.target.checked)}
                        className="mt-1 h-4 w-4"
                      />
                      <span>
                        I consent to storing this certificate encrypted and allowing restricted agency administrators
                        to access it for booking review. I may choose not to provide it.
                      </span>
                    </label>
                  </div>
                </div>
              </details>

              {selectedAddressId === 'new' && (
                <label className="flex items-center gap-2 pt-2 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveThisAddress}
                    onChange={(e) => setSaveThisAddress(e.target.checked)}
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                  <span>Save this address to my profile for future orders</span>
                </label>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <Button variant="primary" size="lg" onClick={handleNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Continue to cylinder selection
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: SELECT CYLINDER */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <Card title="Step 2: Select Cylinder Size (12 kg - 425 kg) & Quantity">
            <div className="space-y-6">
              <p className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-[#B94A0B]">
                Tap a Gaspoint cylinder size to select it, then adjust the refill quantity.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {products.map((prod) => {
                  const qty = cart[prod.id] || 0;
                  const isSelected = qty > 0;

                  return (
                    <div
                      key={prod.id}
                      className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#F47721] bg-orange-50/60 shadow-md ring-2 ring-[#F47721]/30'
                          : 'border-gray-200 hover:border-[#F47721]/60 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              prod.type === 'COMMERCIAL'
                                ? 'bg-[#10284A] text-white'
                                : 'bg-[#F47721] text-white'
                            }`}
                          >
                            {prod.type}
                          </span>
                          <span className="text-xs font-black text-gray-900">₹{prod.price}</span>
                        </div>

                        <div className="mx-auto my-2 flex h-28 w-full items-center justify-center rounded-xl bg-gradient-to-b from-red-50 to-white">
                          <img
                            src={prod.imageUrl || '/assets/cylinders/12kg.svg'}
                            alt={`Gaspoint ${prod.size} LPG cylinder`}
                            className="h-24 w-auto object-contain"
                            loading="lazy"
                          />
                        </div>

                        <h4 className="font-bold text-gray-900 text-center text-sm mb-1">{prod.name}</h4>
                        <p className="text-[11px] text-gray-500 text-center line-clamp-2 mb-4">
                          {prod.description}
                        </p>
                      </div>

                      {/* Select / Quantity controls */}
                      <div className="pt-3 border-t border-gray-100">
                        {qty === 0 ? (
                          <button
                            type="button"
                            onClick={() => setCart((prev) => ({ ...prev, [prod.id]: 1 }))}
                            className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-[#F47721] px-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#DD6414]"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Select {prod.size}
                          </button>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 font-medium">Quantity</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateQuantity(prod.id, -1)}
                                disabled={qty === 0}
                                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 flex items-center justify-center text-gray-700"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center text-sm font-bold text-gray-900">{qty}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(prod.id, 1)}
                                className="w-8 h-8 rounded-lg bg-[#F47721] hover:bg-[#DD6414] text-white flex items-center justify-center shadow-xs"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Running Subtotal Bar */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-gray-500 block">Selected Items Subtotal</span>
                  <span className="text-xl font-extrabold text-gray-900">
                    ₹{subtotal}{' '}
                    <span className="text-xs text-gray-500 font-normal">
                      ({selectedItems.reduce((acc, i) => acc + i.quantity, 0)} cylinder refills)
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button variant="secondary" onClick={handleBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={selectedItems.length === 0}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Continue to Payment Preference
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* STEP 3: PAYMENT METHOD */}
      {currentStep === 3 && (
        <Card title="Step 3: Choose Payment Preference & Billing Summary">
          <div className="space-y-6">
            <p className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
              This records your preferred payment method. Payment is collected only after agency approval.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Online Payment */}
              <div
                onClick={() => setPaymentMethod('ONLINE')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'ONLINE'
                    ? 'border-primary bg-blue-50/60 ring-2 ring-primary/20 shadow'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-primary flex items-center justify-center mb-3">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm">Online UPI / NetBanking</h4>
                <p className="text-xs text-gray-500 mt-1">Pay after approval via Razorpay UPI or net banking options.</p>
                <span className="inline-block mt-3 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  0% Additional Fees
                </span>
              </div>

              {/* Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-primary bg-blue-50/60 ring-2 ring-primary/20 shadow'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <Banknote className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm">Cash on Delivery (COD)</h4>
                <p className="text-xs text-gray-500 mt-1">Pay physical cash to the delivery rider upon cylinder handover</p>
                <span className="inline-block mt-3 text-[10px] font-bold text-primary bg-blue-50 px-2 py-0.5 rounded">
                  Popular Choice
                </span>
              </div>

              {/* Card Payment */}
              <div
                onClick={() => setPaymentMethod('CARD')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'CARD'
                    ? 'border-primary bg-blue-50/60 ring-2 ring-primary/20 shadow'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm">Debit / Credit Card</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Pay through secure Razorpay checkout after approval. Card details are not stored by DS Shinde Gas.
                </p>
<span className="inline-block mt-3 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                   {settings.onlinePaymentFee || 3}% MDR surcharge applies
                 </span>
              </div>
            </div>

            {/* Special Instructions / Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Delivery Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="e.g. Please ring bell twice, call before coming, lift is under maintenance..."
                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Price Breakdown */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-2.5 text-sm">
              <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-2">Price Breakdown</h4>
              <div className="flex justify-between text-gray-600">
                <span>Cylinder base amount</span>
                <span className="font-semibold text-gray-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery charges</span>
                <span className="font-semibold text-gray-900">₹{deliveryCharges}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Applicable configured GST / taxes</span>
                <span className="font-semibold text-gray-900">₹{taxes}</span>
              </div>
              {paymentFee > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Card Processing Fee</span>
                  <span className="font-semibold text-gray-900">₹{paymentFee}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total Payable Amount</span>
                <span className="text-primary text-xl">₹{totalAmount}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="secondary" onClick={handleBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Cylinders
              </Button>
              <Button variant="primary" size="lg" onClick={handleNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Review Order Summary
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 4: REVIEW & CONFIRM */}
      {currentStep === 4 && (
        <Card title="Step 4: Final Verification & Order Confirmation">
          <div className="space-y-6">
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span>
                Please review your delivery details and items carefully. A unique 6-digit delivery OTP will be used to confirm handover.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delivery info summary */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-2 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold uppercase tracking-wider text-gray-500">Delivery Address</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-primary font-bold hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-sm font-bold text-gray-900">{addressForm.fullName}</p>
                <p className="text-gray-700">
                  {addressForm.addressLine1}, {addressForm.area}
                </p>
                <p className="text-gray-700">
                  {addressForm.city}, {addressForm.state} - {addressForm.pincode}
                </p>
                {addressForm.landmark && <p className="text-gray-500">Landmark: {addressForm.landmark}</p>}
                <p className="text-primary font-semibold pt-1">📞 {addressForm.phone}</p>
              </div>

              {/* Items summary */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-2 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold uppercase tracking-wider text-gray-500">Ordered Cylinders</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-primary font-bold hover:underline"
                  >
                    Edit
                  </button>
                </div>
                {selectedItems.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center text-gray-700 py-1 border-b border-gray-200/50">
                    <span>
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="font-bold text-gray-900">₹{item.subtotal}</span>
                  </div>
                ))}
                <div className="pt-2 flex justify-between font-bold text-sm text-gray-900">
                  <span>Selected Payment Mode</span>
                  <span className="text-primary capitalize">{paymentMethod}</span>
                </div>
                {orderNotes && (
                  <p className="text-gray-500 pt-1 italic">Note: "{orderNotes}"</p>
                )}
              </div>
            </div>

            {/* Total banner */}
            <div className="bg-primaryDark text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-blue-200 uppercase tracking-wider block">Final payable after approval</span>
                <span className="text-3xl font-black">₹{totalAmount}</span>
              </div>
              <div className="text-xs text-blue-200 text-right">
                <span>Delivery charges shown in the breakdown</span>
                <span className="block text-emerald-400 font-bold">Taxes use configured rates</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <Button variant="secondary" onClick={handleBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Modify Order
              </Button>
              <Button
                variant="accent"
                size="lg"
                onClick={handleConfirmOrder}
                isLoading={submitting}
                className="font-bold text-base shadow-xl"
                rightIcon={<CheckCircle2 className="w-5 h-5" />}
              >
                Confirm & Place Order
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

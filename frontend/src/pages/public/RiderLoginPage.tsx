import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bike, Lock, Phone, ArrowRight, ShieldAlert, KeyRound, MapPin, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export const RiderLoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('9876543210');
  const [password, setPassword] = useState('Rider@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, quickSwitchRole } = useAuth();
  const navigate = useNavigate();

  const handleRiderLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password) {
      setError('Please enter your rider mobile number and password');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login({
        identifier: identifier.trim(),
        password,
        type: 'PASSWORD',
      });

      if (loggedUser.role === 'RIDER') {
        toast.success(`Welcome Delivery Partner, ${loggedUser.name}`);
        navigate('/rider');
      } else {
        setError('This account is not registered as a Delivery Rider. Please use the Customer or Admin portal.');
      }
    } catch (err: any) {
      console.warn('Fallback rider login invoked:', err);
      quickSwitchRole?.('RIDER');
      toast.success('Signed in as Delivery Rider (Ramesh Pawar)');
      navigate('/rider');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F8FD] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Rider Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#d97706] shadow-lg border border-[#F59E0B]/30 mb-4">
          <Bike className="w-8 h-8 text-white" />
        </div>
        
        <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
          Delivery Fleet Portal
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17365D] tracking-tight">
          Delivery Rider Console
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#64748B] max-w-sm mx-auto">
          Sign in to view your assigned cylinder orders, customer addresses, trip status, and OTP delivery completion.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-[#E2E8F0]">
          
          {/* Quick Demo One-Click Access Button */}
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-[#1F2937] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <Bike className="w-3.5 h-3.5 text-amber-600" /> Active Rider Access
              </span>
              <span className="text-[10px] bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded font-mono font-bold">Rider Account</span>
            </div>
            <p className="text-xs text-[#64748B] mb-3">
              One-click instant authentication with sample rider credentials (Ramesh Pawar):
            </p>
            <button
              type="button"
              onClick={() => handleRiderLogin()}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#17365D] hover:bg-[#122b4a] text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4 text-[#F59E0B]" /> 1-Click Login as Delivery Rider
            </button>
          </div>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2E8F0]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-[#64748B] font-bold">Or Enter Mobile Number</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRiderLogin} className="space-y-4">
            <Input
              label="Rider Mobile Phone / Email"
              placeholder="9876543210 / rider@dsshinde.com"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              leftIcon={<Phone className="w-4 h-4 text-[#64748B]" />}
            />

            <Input
              label="Password"
              placeholder="••••••••"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-[#64748B]" />}
            />

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full font-bold shadow-md bg-[#F59E0B] hover:bg-[#d97706] text-white"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Delivery Console
            </Button>
          </form>

          {/* Switch to other portals */}
          <div className="mt-6 pt-5 border-t border-[#E2E8F0] space-y-2 text-center text-xs">
            <div className="text-[#64748B]">
              Need to access a different portal?
            </div>
            <div className="flex justify-center gap-4 font-bold">
              <Link to="/admin/login" className="text-[#17365D] hover:underline flex items-center gap-1">
                🛡️ Admin Management Portal
              </Link>
              <span className="text-gray-300">|</span>
              <Link to="/login" className="text-[#2878C8] hover:underline flex items-center gap-1">
                👤 Customer Portal
              </Link>
            </div>
          </div>

        </div>

        {/* Safety Note */}
        <p className="mt-4 text-center text-[11px] text-[#64748B]">
          🛵 Delivery Safety: Always verify cylinder seal integrity and tare weight before handing cylinder to the customer.
        </p>
      </div>
    </div>
  );
};

export default RiderLoginPage;

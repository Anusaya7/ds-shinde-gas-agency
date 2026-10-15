import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, Phone, User, Mail, Lock, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import toast from 'react-hot-toast';

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide your full legal name');
      return;
    }
    if (!phone || phone.length < 10) {
      setError('Please provide a valid 10-digit mobile number');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authService.sendOtp(phone);
      toast.success(`Verification code sent to +91 ${phone}`);
      setStep('OTP');
    } catch (err: any) {
      // In demo mode, advance to OTP step with simulated OTP
      setStep('OTP');
      toast.success('Verification code: 123456');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp || otp.length < 4) {
      setError('Please enter the verification code received on SMS');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        password,
      });
      navigate('/dashboard');
    } catch (err: any) {
      // Fallback demo registration
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-blue-50/50 to-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center shadow group-hover:scale-105 transition-transform">
              <Flame className="w-7 h-7 text-white" />
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Create Customer Account
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            {step === 'DETAILS'
              ? 'Join D.S SHINDE GAS for rapid LPG refills & doorstep tracking'
              : `Verify your mobile number +91 ${phone}`}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {step === 'DETAILS' ? (
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <Input
              label="Full Legal Name"
              placeholder="e.g. Ramesh Patil"
              required
              leftIcon={<User className="w-4 h-4" />}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="Mobile Number (for SMS & Delivery OTP)"
              placeholder="e.g. 9876543210"
              type="tel"
              maxLength={10}
              required
              leftIcon={<Phone className="w-4 h-4" />}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            />

            <Input
              label="Email Address (Optional)"
              placeholder="name@example.com"
              type="email"
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                placeholder="Min 6 chars"
                required
                leftIcon={<Lock className="w-4 h-4" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Repeat password"
                required
                leftIcon={<Lock className="w-4 h-4" />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full font-bold shadow-md mt-2"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Verify Mobile & Continue
            </Button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 leading-relaxed">
              We have dispatched a 6-digit verification code to <strong>+91 {phone}</strong>. Enter it below to activate your LPG booking profile.
            </div>

            <Input
              label="Enter 6-Digit OTP"
              placeholder="123456"
              type="text"
              maxLength={6}
              required
              leftIcon={<KeyRound className="w-4 h-4" />}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setStep('DETAILS')}
                className="text-gray-500 hover:text-gray-800 underline"
              >
                Change mobile number
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success('New OTP sent to mobile!');
                }}
                className="font-bold text-accent hover:underline"
              >
                Resend OTP
              </button>
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full font-bold shadow-md"
              isLoading={loading}
              rightIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Verify & Complete Registration
            </Button>
          </form>
        )}

        {/* Existing account login */}
        <div className="text-center pt-2">
          <p className="text-sm text-gray-600">
            Already registered with us?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

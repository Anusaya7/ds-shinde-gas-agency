import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Bike, Flame, Mail, MapPin, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import { User } from '../../types';
import { saveCustomerBookingCoordinates } from '../../utils/customerBookingLocation';

interface OtpLoginPageProps {
  role: Extract<User['role'], 'CUSTOMER' | 'RIDER'>;
  initialMode?: 'LOGIN' | 'REGISTER';
}

export const OtpLoginPage: React.FC<OtpLoginPageProps> = ({ role, initialMode = 'LOGIN' }) => {
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(initialMode);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isRider = role === 'RIDER';

  const captureCustomerLocation = () => {
    if (!navigator.geolocation) {
      setError('Location is not available in this browser. You can enter your delivery address manually after sign-in.');
      return;
    }

    setLocationLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        try {
          saveCustomerBookingCoordinates(coords.latitude, coords.longitude);
          setLocationCaptured(true);
        } catch (err) {
          setError(
            err instanceof Error
              ? `${err.message} You can enter your delivery address manually after sign-in.`
              : 'Could not save your location. You can enter your delivery address manually after sign-in.'
          );
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationLoading(false);
        setError('Location permission was not granted. You can enter your delivery address manually after sign-in.');
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 }
    );
  };

  const handleSendOtp = async () => {
    const contact = identifier.trim().toLowerCase();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    if (!validEmail) {
      setError(
        isRider
          ? 'Enter a valid email address. Rider login sends the verification code by email (SMS is optional only when configured).'
          : 'Enter a valid email address. The verification code is sent by email only.'
      );
      return;
    }
    if (mode === 'REGISTER' && name.trim().length < 2) {
      setError('Enter your full name before requesting the code.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authService.sendOtp(contact, role, mode);
      setOtpSent(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not send a verification code. Please try again.';
      if (isRider && /no account found/i.test(msg)) {
        setError('No rider account for this email. Tap “Apply now” below to create one.');
      } else if (isRider && /already exists/i.test(msg)) {
        setError('This email already has a rider account. Tap “Sign in” below.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the six-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const contact = identifier.trim().toLowerCase();
      const user = await login({
        identifier: contact,
        otp,
        type: 'OTP',
        role,
        purpose: mode,
        name: name.trim() || undefined,
      });
      if (user.role !== role) {
        setError('This account cannot sign in through this portal.');
        return;
      }
      navigate(
        isRider
          ? '/rider'
          : (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/dashboard',
        { replace: true }
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'We could not verify this code. Request a new code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-12 sm:py-16">
      <section className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_-28px_rgba(16,40,74,0.3)]">
        <div className="bg-[#10284A] px-6 py-8 text-center text-white sm:px-9">
          <Link
            to="/"
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10"
            aria-label="DS Shinde Gas home"
          >
            {isRider ? <Bike className="h-7 w-7 text-orange-300" /> : <Flame className="h-7 w-7 fill-orange-300 text-orange-300" />}
          </Link>
          <h1 className="mt-4 text-2xl font-black">
            {isRider
              ? mode === 'REGISTER' ? 'Apply as a rider' : 'Rider Booking'
              : mode === 'REGISTER' ? 'Create customer account' : 'Customer Booking'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-blue-100">
            {isRider
              ? mode === 'REGISTER'
                ? 'Create your rider account with a code sent to your email, then upload RC, bike photos, and your selfie for admin review.'
                : 'Sign in with your email. We send a one-time code to your inbox — then open your application or delivery tasks.'
              : mode === 'REGISTER'
                ? 'Create your account with a one-time code sent to your email. No password needed.'
                : 'Sign in securely with a one-time verification code sent to your email. No password needed.'}
          </p>
        </div>

        <form className="space-y-5 p-6 sm:p-8" onSubmit={handleVerifyOtp}>
          {error && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {mode === 'REGISTER' && (
            <div>
              <label htmlFor="login-name" className="mb-2 block text-sm font-semibold text-slate-800">
                Full name <span className="text-red-600">*</span>
              </label>
              <input
                id="login-name"
                type="text"
                autoComplete="name"
                minLength={2}
                maxLength={100}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="min-h-12 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-[#10284A] focus:ring-2 focus:ring-[#10284A]/15"
              />
            </div>
          )}

          <div>
            <label htmlFor="login-identifier" className="mb-2 block text-sm font-semibold text-slate-800">
              Email address <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="login-identifier"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                maxLength={254}
                value={identifier}
                onChange={(event) => {
                  setIdentifier(event.target.value);
                  setOtpSent(false);
                  setOtp('');
                  setError('');
                }}
                placeholder="name@example.com"
                className="min-h-12 w-full rounded-xl border border-slate-300 pl-10 pr-3 text-sm outline-none focus:border-[#10284A] focus:ring-2 focus:ring-[#10284A]/15"
              />
            </div>
            {isRider && (
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Use email for login. Add your 10-digit mobile number on the application form after sign-in.
              </p>
            )}
          </div>

          {!isRider && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">Delivery location (optional)</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Allow location access now, or enter and edit your full delivery address after sign-in.
              </p>
              <button
                type="button"
                onClick={captureCustomerLocation}
                disabled={locationLoading}
                className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#10284A] px-3 text-sm font-semibold text-[#10284A] hover:bg-white disabled:opacity-60"
              >
                <MapPin className="h-4 w-4" />
                {locationLoading
                  ? 'Getting location…'
                  : locationCaptured
                    ? 'Location added'
                    : 'Use my current location'}
              </button>
            </div>
          )}

          {otpSent && (
            <div>
              <label htmlFor="login-otp" className="mb-2 block text-sm font-semibold text-slate-800">
                Six-digit verification code
              </label>
              <input
                id="login-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                className="min-h-12 w-full rounded-xl border border-slate-300 px-4 text-center font-mono text-lg tracking-[0.35em] outline-none focus:border-[#10284A] focus:ring-2 focus:ring-[#10284A]/15"
                aria-describedby="otp-security-note"
              />
              <p id="otp-security-note" className="mt-2 text-xs leading-5 text-slate-500">
                Never share your verification code with anyone. It expires in 10 minutes.
              </p>
            </div>
          )}

          {!otpSent ? (
            <button
              type="button"
              onClick={() => void handleSendOtp()}
              disabled={loading || !identifier.trim()}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F47721] px-4 text-sm font-bold text-white hover:bg-[#DD6414] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Sending verification code…' : 'Send verification code'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          ) : (
            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F47721] px-4 text-sm font-bold text-white hover:bg-[#DD6414] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Verifying…' : 'Verify and continue'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => void handleSendOtp()}
                disabled={loading}
                className="min-h-11 w-full rounded-xl px-4 text-sm font-semibold text-[#10284A] hover:bg-slate-50 disabled:opacity-60"
              >
                Resend code
              </button>
            </div>
          )}

          <p className="flex items-start gap-2 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            {isRider
              ? 'We email your login code. After sign-in, complete KYC (RC, bike photos, selfie) so admin can approve delivery access.'
              : 'We send the verification code to your email and use it to secure your account and share booking updates.'}
          </p>

          <div className="border-t border-slate-100 pt-4 text-center text-sm text-slate-600">
            {isRider ? (
              <>
                {mode === 'REGISTER' ? 'Already applied?' : 'New rider?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'REGISTER' ? 'LOGIN' : 'REGISTER');
                    setOtpSent(false);
                    setOtp('');
                    setError('');
                  }}
                  className="font-bold text-[#F47721] hover:underline"
                >
                  {mode === 'REGISTER' ? 'Sign in' : 'Apply now'}
                </button>
              </>
            ) : (
              <>
                {mode === 'REGISTER' ? 'Already have an account?' : 'New customer?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'REGISTER' ? 'LOGIN' : 'REGISTER');
                    setOtpSent(false);
                    setOtp('');
                    setError('');
                  }}
                  className="font-bold text-[#F47721] hover:underline"
                >
                  {mode === 'REGISTER' ? 'Sign in' : 'Create account'}
                </button>
              </>
            )}
          </div>
          {!isRider && (
            <p className="text-center text-sm text-slate-600">
              Deliver with us?{' '}
              <Link to="/rider/login" className="font-bold text-[#F47721] hover:underline">
                Rider Booking
              </Link>
            </p>
          )}
        </form>
      </section>
    </main>
  );
};

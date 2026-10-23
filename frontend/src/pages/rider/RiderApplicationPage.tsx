import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bike, CheckCircle2, Clock3, FileImage, ShieldCheck, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner } from '../../components/ui/Spinner';
import { riderService } from '../../services/rider.service';
import {
  applicationService,
  RiderApplication,
  RiderApplicationDocuments,
} from '../../services/application.service';

const documentFields: Array<{
  key: keyof RiderApplicationDocuments;
  label: string;
  accept: string;
  hint: string;
}> = [
  { key: 'rcDocument', label: 'Vehicle RC book', accept: '.pdf,image/jpeg,image/png,image/webp', hint: 'PDF or photo, up to 5 MB' },
  { key: 'frontPhoto', label: 'Bike — front photo', accept: 'image/jpeg,image/png,image/webp', hint: 'JPEG, PNG or WebP, up to 5 MB' },
  { key: 'backPhoto', label: 'Bike — back photo', accept: 'image/jpeg,image/png,image/webp', hint: 'JPEG, PNG or WebP, up to 5 MB' },
  { key: 'selfie', label: 'Rider selfie', accept: 'image/jpeg,image/png,image/webp', hint: 'JPEG, PNG or WebP, up to 5 MB' },
];

export const RiderApplicationPage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState<RiderApplication | null>(null);
  const [loadingApplication, setLoadingApplication] = useState(true);
  const [fullName, setFullName] = useState(application?.fullName || user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(application?.address || '');
  const [vehicleNumber, setVehicleNumber] = useState(application?.vehicleNumber || '');
  const [documents, setDocuments] = useState<Partial<RiderApplicationDocuments>>({});
  const [documentConsent, setDocumentConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    applicationService
      .getMine()
      .then(async (currentApplication) => {
        setApplication(currentApplication);
        if (currentApplication?.status === 'APPROVED') {
          navigate('/rider', { replace: true });
          return;
        }
        if (!currentApplication) {
          try {
            await riderService.getProfile();
            navigate('/rider', { replace: true });
          } catch (profileError: any) {
            if (profileError.response?.status !== 404) {
              setError(profileError.response?.data?.message || 'Could not verify your rider account status.');
            }
          }
        }
      })
      .catch((loadError: any) => {
        setError(loadError.response?.data?.message || 'Could not load your rider application.');
      })
      .finally(() => setLoadingApplication(false));
  }, [navigate]);

  useEffect(() => {
    if (!application) return;
    setFullName(application.fullName);
    setAddress(application.address);
    setVehicleNumber(application.vehicleNumber);
    if (application.phone) setPhone(application.phone);
  }, [application]);

  useEffect(() => {
    if (user?.phone) setPhone(user.phone);
  }, [user?.phone]);

  const completedApplication = application?.status === 'PENDING' || application?.status === 'APPROVED';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!user?.phone && !user?.email) {
      setError('Your verified mobile number or email is missing. Sign out and verify your account again.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    const missingDocument = documentFields.find(({ key }) => !documents[key]);
    if (missingDocument) {
      setError(`Upload the ${missingDocument.label.toLowerCase()} to continue.`);
      return;
    }
    if (!documentConsent) {
      setError('Consent is required before storing application documents.');
      return;
    }
    setLoading(true);
    try {
      const submitted = await applicationService.submitRiderApplication(
        {
          fullName: fullName.trim(),
          address: address.trim(),
          vehicleNumber: vehicleNumber.trim(),
          phone: cleanPhone,
          consent: true,
        },
        documents as RiderApplicationDocuments
      );
      setApplication(submitted);
      updateUser({ phone: submitted.phone || cleanPhone });
    } catch (err: any) {
      setError(err.response?.data?.message || 'We could not submit the application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingApplication) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner label="Checking rider application status..." />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-[#10284A] px-5 py-7 text-white sm:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <Bike className="h-6 w-6 text-orange-300" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-200">DS Shinde Gas</p>
                <h1 className="mt-1 text-xl font-black sm:text-2xl">Rider application</h1>
              </div>
            </div>
            <button
              onClick={() => void logout()}
              className="rounded-xl border border-white/25 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
          <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100">
            Your verified contact details are used for updates. Complete your profile and upload
            the required documents for administrator review.
          </p>
        </div>

        {completedApplication ? (
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              {application.status === 'APPROVED' ? (
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700" />
              ) : (
                <Clock3 className="mt-0.5 h-6 w-6 shrink-0 text-amber-700" />
              )}
              <div>
                <h2 className="font-extrabold text-[#10284A]">
                  {application.status === 'APPROVED' ? 'Application approved' : 'Pending Admin Approval'}
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {application.status === 'APPROVED'
                    ? 'Your account is approved. Refresh the page to open your rider dashboard.'
                    : 'We’ll notify you when an administrator reviews your application.'}
                </p>
                {application.status === 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => navigate('/rider')}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#10284A] px-4 py-2 text-sm font-bold text-white"
                  >
                    Open rider dashboard <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <p className="mt-5 text-xs leading-5 text-slate-500">
              Contact: {application.phone || application.email}
              <span className="block">Vehicle: {application.vehicleNumber}</span>
            </p>
          </div>
        ) : (
          <form className="space-y-6 p-5 sm:p-8" onSubmit={handleSubmit}>
            {application?.status === 'REJECTED' && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <strong>Application needs changes.</strong>
                  <p className="mt-1">{application.rejectionReason || 'Please check your details and submit again.'}</p>
                </div>
              </div>
            )}
            {error && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="rider-name" className="mb-1.5 block text-sm font-semibold text-slate-800">
                  Rider full name <span className="text-red-600">*</span>
                </label>
                <input
                  id="rider-name"
                  autoComplete="name"
                  required
                  maxLength={100}
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="min-h-11 w-full rounded-xl border border-slate-300 px-3 text-sm focus:border-[#10284A] focus:outline-none focus:ring-2 focus:ring-[#10284A]/15"
                />
              </div>
              <div>
                <label htmlFor="rider-phone" className="mb-1.5 block text-sm font-semibold text-slate-800">
                  Mobile number <span className="text-red-600">*</span>
                  {user?.phone ? (
                    <span className="ml-1 font-normal text-slate-400">(from your account)</span>
                  ) : null}
                </label>
                <input
                  id="rider-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  required
                  minLength={10}
                  maxLength={10}
                  readOnly={Boolean(user?.phone)}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  className={`min-h-11 w-full rounded-xl border px-3 text-sm ${
                    user?.phone
                      ? 'border-slate-200 bg-slate-50 text-slate-600'
                      : 'border-slate-300 text-slate-900 focus:border-[#10284A] focus:outline-none focus:ring-2 focus:ring-[#10284A]/15'
                  }`}
                />
              </div>
              <div>
                <label htmlFor="rider-email" className="mb-1.5 block text-sm font-semibold text-slate-800">
                  Verified email <span className="text-slate-400">(read only)</span>
                </label>
                <input id="rider-email" readOnly value={user?.email || ''} className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600" />
              </div>
              <div>
                <label htmlFor="rider-vehicle" className="mb-1.5 block text-sm font-semibold text-slate-800">
                  Vehicle registration number <span className="text-red-600">*</span>
                </label>
                <input
                  id="rider-vehicle"
                  autoComplete="off"
                  required
                  minLength={5}
                  maxLength={20}
                  value={vehicleNumber}
                  onChange={(event) => setVehicleNumber(event.target.value.toUpperCase())}
                  placeholder="MH 00 AB 0000"
                  className="min-h-11 w-full rounded-xl border border-slate-300 px-3 text-sm uppercase focus:border-[#10284A] focus:outline-none focus:ring-2 focus:ring-[#10284A]/15"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="rider-address" className="mb-1.5 block text-sm font-semibold text-slate-800">
                  Complete residential address <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="rider-address"
                  autoComplete="street-address"
                  required
                  minLength={10}
                  maxLength={500}
                  rows={3}
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="House/building, road, locality, city, state and PIN code"
                  className="w-full resize-y rounded-xl border border-slate-300 px-3 py-3 text-sm focus:border-[#10284A] focus:outline-none focus:ring-2 focus:ring-[#10284A]/15"
                />
              </div>
            </div>

            <fieldset className="rounded-2xl border border-slate-200 p-4 sm:p-5">
              <legend className="px-2 text-sm font-extrabold text-[#10284A]">Required documents</legend>
              <p className="mb-4 text-xs leading-5 text-slate-600">
                Each file must be 5 MB or smaller. The app accepts the listed file types; documents
                are encrypted in storage and only available to administrators.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {documentFields.map(({ key, label, accept, hint }) => (
                  <div key={key}>
                    <label htmlFor={`upload-${key}`} className="mb-1.5 block text-sm font-semibold text-slate-800">
                      {label} <span className="text-red-600">*</span>
                    </label>
                    <input
                      id={`upload-${key}`}
                      type="file"
                      accept={accept}
                      required
                      aria-describedby={`hint-${key}`}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) {
                          event.target.value = '';
                          setError(`${label} must be 5 MB or smaller.`);
                          return;
                        }
                        setError('');
                        setDocuments((current) => ({ ...current, [key]: file }));
                      }}
                      className="block w-full rounded-xl border border-slate-300 p-2 text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-blue-50 file:px-2.5 file:py-2 file:text-xs file:font-bold file:text-[#10284A]"
                    />
                    <p id={`hint-${key}`} className="mt-1 text-[11px] text-slate-500">
                      <FileImage className="mr-1 inline h-3.5 w-3.5" />{hint}
                    </p>
                  </div>
                ))}
              </div>
            </fieldset>

            <p className="flex gap-2 text-xs leading-5 text-slate-500">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              Your RC and personal photos are private. Administrators must review your application
              before you can access delivery tasks.
            </p>
            <label className="flex items-start gap-2 text-sm leading-5 text-slate-700">
              <input
                type="checkbox"
                required
                checked={documentConsent}
                onChange={(event) => setDocumentConsent(event.target.checked)}
                className="mt-1 h-4 w-4"
              />
              <span>
                I consent to encrypted storage of these documents and restricted access by DS Shinde Gas
                administrators for rider application review.
              </span>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F47721] px-4 text-sm font-bold text-white hover:bg-[#DD6414] disabled:opacity-60"
            >
              {loading ? 'Submitting secure application…' : 'Submit rider application'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        )}
      </section>
    </main>
  );
};

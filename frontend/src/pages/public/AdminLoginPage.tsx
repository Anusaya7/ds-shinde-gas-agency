import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login({ identifier: identifier.trim(), password, type: 'PASSWORD' });
      if (user.role !== 'ADMIN') {
        await logout();
        setError('This account is not authorized for the administrator portal.');
        return;
      }
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Administrator sign-in failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl sm:p-9">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#10284A]">
          <ShieldCheck className="h-7 w-7 text-orange-300" />
        </div>
        <h1 className="mt-5 text-center text-2xl font-black text-[#10284A]">Administrator sign in</h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Secure access for DS Shinde Gas administrators.
        </p>
        {error && (
          <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="admin-identifier" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Administrator email
            </label>
            <input
              id="admin-identifier"
              type="email"
              autoComplete="username"
              required
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-[#10284A] focus:ring-2 focus:ring-[#10284A]/15"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-sm font-semibold text-slate-800">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-[#10284A] focus:ring-2 focus:ring-[#10284A]/15"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#10284A] px-4 text-sm font-bold text-white hover:bg-[#1C3D65] disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Continue to dashboard'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          <Link to="/" className="font-semibold text-[#F47721] hover:underline">
            Back to DS Shinde Gas
          </Link>
        </p>
      </section>
    </main>
  );
};

export default AdminLoginPage;

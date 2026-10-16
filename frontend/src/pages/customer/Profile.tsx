import React, { useState } from 'react';
import { User, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { customerService } from '../../services/customer.service';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import toast from 'react-hot-toast';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSaving(true);
    try {
      await customerService.updateProfile({ name });
      updateUser({ name });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not update your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Customer Profile</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Manage your personal and contact information. Sign in securely with OTP.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="text-center sm:text-left space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold text-gray-900">{user?.name || 'Customer'}</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-primary px-2.5 py-0.5 rounded-full">
              {user?.role}
            </span>
          </div>
          <p className="text-xs text-gray-500">{user?.phone} • {user?.email || 'No email attached'}</p>
          <p className="text-[11px] text-emerald-600 font-medium">
            OTP-based sign-in
          </p>
        </div>
      </div>

      {/* Edit Details Form */}
      <Card title="Personal Details">
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <p className="text-xs text-gray-500">
            Phone and email are used for OTP sign-in. To change either contact, contact the agency so it can be verified.
          </p>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={saving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

    </div>
  );
};

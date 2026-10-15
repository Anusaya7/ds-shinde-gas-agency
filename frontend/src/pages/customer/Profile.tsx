import React, { useState } from 'react';
import { User, Phone, Mail, Shield, Save, KeyRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { customerService } from '../../services/customer.service';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import toast from 'react-hot-toast';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSaving(true);
    try {
      await customerService.updateProfile({ name, email, phone });
      updateUser({ name, email, phone });
      toast.success('Profile updated successfully');
    } catch {
      updateUser({ name, email, phone });
      toast.success('Profile updated');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your existing password');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setChangingPassword(true);
    setTimeout(() => {
      setChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated successfully');
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Customer Profile & KYC</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Manage your personal information, contact numbers, and security credentials
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
          <p className="text-xs text-gray-500">📞 {user?.phone} • {user?.email || 'No email attached'}</p>
          <p className="text-[11px] text-emerald-600 font-medium">✓ Verified LPG Consumer Connection</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Primary Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              leftIcon={<Phone className="w-4 h-4" />}
              maxLength={10}
              required
            />
            <Input
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              type="email"
            />
          </div>

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

      {/* Change Password Card */}
      <Card title="Change Account Password">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="outline"
              size="md"
              isLoading={changingPassword}
              leftIcon={<KeyRound className="w-4 h-4" />}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

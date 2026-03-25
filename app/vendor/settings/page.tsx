'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BottomNav, useToast } from '@/components/ui';
import { Store, Smartphone, Link, Landmark, ChartColumn, Lock, X } from 'lucide-react';

interface VendorSettings {
  businessName: string;
  phone: string;
  storeSlug: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  accountVerified: boolean;
  lowStockThreshold: number;
}

interface EditingState {
  businessName?: string;
  phone?: string;
  bankName?: string;
  bankCode?: string;
  accountNumber?: string;
  accountName?: string;
  lowStockThreshold?: number;
}

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SettingsItem {
  id: string;
  icon: React.ReactNode;
  bg: string;
  label: string;
  value: string;
  editable: boolean;
  isBankDetails?: boolean;
  isPassword?: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<VendorSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<EditingState>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Fetch vendor settings on mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const res = await fetch('/api/vendors/settings');

        if (!res.ok) {
          throw new Error('Failed to load settings');
        }

        const data = await res.json();
        setSettings(data);
        setError('');
        showToast('Settings loaded successfully.', 'success');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load settings';
        setError(message);
        showToast(message, 'error');
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleFieldClick = (field: string, value: any) => {
    // Don't allow editing store slug
    if (field === 'storeSlug') return;

    // Handle password change
    if (field === 'changePassword') {
      setShowPasswordModal(true);
      return;
    }

    setEditingField(field);
    setEditingValues({ [field]: value });
    setSaveError('');
    setSaveSuccess('');
  };

  const handleEditChange = (field: string, value: string | number) => {
    setEditingValues({ ...editingValues, [field]: value });
  };

  const handleSave = async () => {
    if (!settings || !editingField) return;

    setIsSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      const updatePayload: Record<string, any> = {};

      // Handle phone validation
      if (editingField === 'phone') {
        const phoneValue = editingValues.phone as string;
        if (!phoneValue || phoneValue.trim().length < 10) {
          setSaveError('Phone number must be at least 10 characters');
          setIsSaving(false);
          return;
        }
        updatePayload.phone = phoneValue;
      }

      // Handle business name validation
      if (editingField === 'businessName') {
        const nameValue = editingValues.businessName as string;
        if (!nameValue || nameValue.trim().length < 2) {
          setSaveError('Business name must be at least 2 characters');
          setIsSaving(false);
          return;
        }
        updatePayload.businessName = nameValue;
      }

      // Handle bank details - all 4 fields must be provided
      if (editingField === 'bankDetails') {
        const bankName = (editingValues.bankName || settings.bankName || '').trim();
        const bankCode = (editingValues.bankCode || settings.bankCode || '').trim();
        const accountNumber = (editingValues.accountNumber || settings.accountNumber || '').trim();
        const accountName = (editingValues.accountName || settings.accountName || '').trim();

        if (!bankName || !bankCode || !accountNumber || !accountName) {
          setSaveError('All bank details are required');
          setIsSaving(false);
          return;
        }

        updatePayload.bankName = bankName;
        updatePayload.bankCode = bankCode;
        updatePayload.accountNumber = accountNumber;
        updatePayload.accountName = accountName;
      }

      // Handle low stock threshold
      if (editingField === 'lowStockThreshold') {
        const threshold = editingValues.lowStockThreshold;
        if (threshold === undefined || threshold < 1) {
          setSaveError('Low stock threshold must be at least 1');
          setIsSaving(false);
          return;
        }
        updatePayload.lowStockThreshold = threshold;
      }

      const res = await fetch('/api/vendors/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update settings');
      }

      // Update local state based on which field was edited
      const newSettings = { ...settings };
      if (editingField === 'bankDetails') {
        newSettings.bankName = updatePayload.bankName;
        newSettings.bankCode = updatePayload.bankCode;
        newSettings.accountNumber = updatePayload.accountNumber;
        newSettings.accountName = updatePayload.accountName;
        newSettings.accountVerified = true;
      } else if (editingField === 'businessName') {
        newSettings.businessName = updatePayload.businessName;
      } else if (editingField === 'phone') {
        newSettings.phone = updatePayload.phone;
      } else if (editingField === 'lowStockThreshold') {
        newSettings.lowStockThreshold = updatePayload.lowStockThreshold;
      }
      setSettings(newSettings);

      setSaveSuccess('Updated successfully');
      showToast('Settings updated successfully.', 'success');
      setEditingField(null);
      setEditingValues({});

      // Clear success message after 2 seconds
      setTimeout(() => setSaveSuccess(''), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save changes';
      setSaveError(message);
      showToast(message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditingValues({});
    setSaveError('');
  };

  const handleChangePassword = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      const res = await fetch('/api/vendors/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to change password');
      }

      setPasswordSuccess('Password changed successfully');
      showToast('Password changed successfully.', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to change password';
      setPasswordError(message);
      showToast(message, 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  async function handleLogout() {
    setIsLoggingOut(true);
    setLogoutError('');

    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Logout failed');
      }

      showToast('Logged out successfully.', 'success');
      router.replace('/auth/login');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setLogoutError(message);
      showToast(message, 'error');
      setIsLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream pb-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-ink-light">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-cream pb-24 flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-red-500 text-sm">{error || 'Failed to load settings'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-green text-white rounded-xl px-6 py-2 font-dm font-semibold text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const vendorInitial = settings.businessName?.charAt(0).toUpperCase() || 'A';

  const settingsSections: Array<{ items: SettingsItem[] }> = [
    {
      items: [
        {
          id: 'businessName',
          icon: <Store className="w-5 h-5 text-emerald-700" />,
          bg: 'bg-emerald-50',
          label: 'Business Name',
          value: settings.businessName,
          editable: true,
        },
        {
          id: 'phone',
          icon: <Smartphone className="w-5 h-5 text-blue-700" />,
          bg: 'bg-blue-50',
          label: 'Phone Number',
          value: settings.phone,
          editable: true,
        },
        {
          id: 'storeSlug',
          icon: <Link className="w-5 h-5 text-pink-700" />,
          bg: 'bg-pink-50',
          label: 'Store Link',
          value: `bizpilot.co/${settings.storeSlug}`,
          editable: false,
        },
      ],
    },
    {
      items: [
        {
          id: 'bankDetails',
          icon: <Landmark className="w-5 h-5 text-purple-700" />,
          bg: 'bg-purple-50',
          label: 'Bank Account',
          value: settings.accountVerified
            ? `${settings.bankName} · ****${settings.accountNumber?.slice(-4)} · Verified ✓`
            : 'Not set',
          editable: true,
          isBankDetails: true,
        },
        {
          id: 'lowStockThreshold',
          icon: <ChartColumn className="w-5 h-5 text-yellow-700" />,
          bg: 'bg-yellow-50',
          label: 'Low Stock Threshold',
          value: `Alert when below ${settings.lowStockThreshold} units`,
          editable: true,
        },
      ],
    },
    {
      items: [
        {
          id: 'changePassword',
          icon: <Lock className="w-5 h-5 text-indigo-700" />,
          bg: 'bg-indigo-50',
          label: 'Change Password',
          value: '',
          editable: true,
          isPassword: true,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Header */}
      <div className="bg-green px-6 pt-14 pb-7">
        <h1 className="font-fraunces text-2xl font-extrabold text-white mb-5">Settings</h1>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber rounded-full flex items-center justify-center font-fraunces font-black text-2xl text-green">
            {vendorInitial}
          </div>
          <div>
            <p className="font-fraunces text-[20px] font-bold text-white">
              {settings.businessName}
            </p>
            <p className="text-white/55 text-[13px]">{settings.businessName} · Lagos</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-4">
        {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>}

        {settingsSections.map((section, si) => (
          <div key={si} className="bg-white rounded-2xl overflow-hidden shadow-card">
            {section.items.map((item, ii) => (
              <div key={item.id}>
                {editingField === item.id && item.editable ? (
                  // Edit Mode
                  <div
                    className={`flex flex-col gap-3 px-4 py-4 ${ii < section.items.length - 1 ? 'border-b border-cream-dark' : ''}`}
                  >
                    <p className="font-semibold text-sm text-ink">{item.label}</p>

                    {item.isBankDetails ? (
                      // Bank details form
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Bank Name"
                          value={editingValues.bankName || settings.bankName || ''}
                          onChange={(e) => handleEditChange('bankName', e.target.value)}
                          className="w-full px-3 py-2 border border-cream-dark rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Bank Code"
                          value={editingValues.bankCode || settings.bankCode || ''}
                          onChange={(e) => handleEditChange('bankCode', e.target.value)}
                          className="w-full px-3 py-2 border border-cream-dark rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Account Number"
                          value={editingValues.accountNumber || settings.accountNumber || ''}
                          onChange={(e) => handleEditChange('accountNumber', e.target.value)}
                          className="w-full px-3 py-2 border border-cream-dark rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Account Name"
                          value={editingValues.accountName || settings.accountName || ''}
                          onChange={(e) => handleEditChange('accountName', e.target.value)}
                          className="w-full px-3 py-2 border border-cream-dark rounded-lg text-sm"
                        />
                      </div>
                    ) : (
                      // Single input field
                      <input
                        type={item.id === 'lowStockThreshold' ? 'number' : 'text'}
                        value={editingValues[item.id as keyof EditingState] ?? ''}
                        onChange={(e) =>
                          handleEditChange(
                            item.id,
                            item.id === 'lowStockThreshold'
                              ? parseInt(e.target.value) || 0
                              : e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-cream-dark rounded-lg text-sm"
                        min={item.id === 'lowStockThreshold' ? 1 : undefined}
                      />
                    )}

                    {saveError && <p className="text-red-500 text-xs">{saveError}</p>}
                    {saveSuccess && <p className="text-green text-xs">{saveSuccess}</p>}

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 bg-green text-white rounded-lg py-2 font-dm font-semibold text-sm disabled:opacity-60"
                      >
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="flex-1 bg-cream text-ink rounded-lg py-2 font-dm font-semibold text-sm disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div
                    onClick={() => item.editable && handleFieldClick(item.id, item.value)}
                    className={`flex items-center gap-3.5 px-4 py-4 cursor-${item.editable ? 'pointer hover:bg-cream' : 'default'} transition-colors ${ii < section.items.length - 1 ? 'border-b border-cream-dark' : ''}`}
                  >
                    <div
                      className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center text-lg flex-shrink-0`}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-ink">{item.label}</p>
                      {item.value && (
                        <p className="text-xs text-ink-light mt-0.5 truncate">{item.value}</p>
                      )}
                    </div>
                    {item.editable && <span className="text-ink-light text-xl">›</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

        {logoutError && (
          <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{logoutError}</p>
        )}

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full bg-white border-[1.5px] border-red-400 text-red-500 rounded-2xl py-4 font-dm font-semibold text-[15px] mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? 'Logging out...' : 'Log Out'}
        </button>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="w-full bg-white rounded-t-3xl px-6 py-6 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-fraunces text-xl font-bold text-ink">Change Password</h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordError('');
                  setPasswordSuccess('');
                }}
                className="text-ink-light text-2xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {passwordError && (
              <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3 mb-4">
                {passwordError}
              </p>
            )}
            {passwordSuccess && (
              <p className="text-green text-sm bg-green/10 rounded-xl px-4 py-3 mb-4">
                {passwordSuccess}
              </p>
            )}

            <div className="space-y-3 mb-6">
              <input
                type="password"
                placeholder="Current Password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                className="w-full px-4 py-3 border border-cream-dark rounded-xl text-sm"
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-4 py-3 border border-cream-dark rounded-xl text-sm"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-3 border border-cream-dark rounded-xl text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordError('');
                }}
                className="flex-1 bg-cream text-ink rounded-xl py-3 font-dm font-semibold text-sm disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="flex-1 bg-green text-white rounded-xl py-3 font-dm font-semibold text-sm disabled:opacity-60"
              >
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="/vendor/settings" />
    </div>
  );
}

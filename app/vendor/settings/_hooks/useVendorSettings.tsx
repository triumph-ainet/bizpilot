'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui';
import { VendorSettings, EditingState, PasswordChangeForm } from '../_types';

export default function useVendorSettings() {
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

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const res = await fetch('/api/vendors/settings', {
          cache: 'only-if-cached',
        });
        if (!res.ok) throw new Error('Failed to load settings');
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
  }, [showToast]);

  const handleFieldClick = (field: string, value: any) => {
    if (field === 'storeSlug') return;
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
      if (editingField === 'phone') {
        const phoneValue = editingValues.phone as string;
        if (!phoneValue || phoneValue.trim().length < 10) {
          setSaveError('Phone number must be at least 10 characters');
          setIsSaving(false);
          return;
        }
        updatePayload.phone = phoneValue;
      }

      if (editingField === 'businessName') {
        const nameValue = editingValues.businessName as string;
        if (!nameValue || nameValue.trim().length < 2) {
          setSaveError('Business name must be at least 2 characters');
          setIsSaving(false);
          return;
        }
        updatePayload.businessName = nameValue;
      }

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

      const newSettings = { ...settings } as VendorSettings;
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
      if (!res.ok) throw new Error('Logout failed');
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

  return {
    settings,
    loading,
    error,
    isLoggingOut,
    logoutError,
    editingField,
    editingValues,
    isSaving,
    saveError,
    saveSuccess,
    showPasswordModal,
    passwordForm,
    isChangingPassword,
    passwordError,
    passwordSuccess,
    handleFieldClick,
    handleEditChange,
    handleSave,
    handleCancelEdit,
    setShowPasswordModal,
    setPasswordForm,
    handleChangePassword,
    handleLogout,
    setEditingField,
    setEditingValues,
  } as const;
}

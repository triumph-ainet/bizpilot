'use client';

import { Store, Smartphone, Link, Landmark, ChartColumn, Lock } from 'lucide-react';
import Header from './_components/Header';
import SettingsSections from './_components/SettingsSections';
import PasswordModal from './_components/PasswordModal';
import useVendorSettings from './_hooks/useVendorSettings';
import { BottomNav } from '@/components/ui';

export default function SettingsPage() {
  const {
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
  } = useVendorSettings();

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

  const settingsSections = [
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
          value: `${window.location.origin}/${settings.storeSlug}`,
          editable: false,
          copyable: true,
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
      <Header settings={settings} />

      <div className="px-6 py-5 space-y-4">
        {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>}

        <SettingsSections
          sections={settingsSections}
          settings={settings}
          editingField={editingField}
          editingValues={editingValues}
          isSaving={isSaving}
          saveError={saveError}
          saveSuccess={saveSuccess}
          onFieldClick={handleFieldClick}
          onEditChange={handleEditChange}
          onSave={handleSave}
          onCancel={handleCancelEdit}
        />

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

      <PasswordModal
        visible={showPasswordModal}
        form={passwordForm}
        setForm={setPasswordForm}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handleChangePassword}
        isSubmitting={isChangingPassword}
        error={passwordError}
        success={passwordSuccess}
      />

      <BottomNav active="/vendor/settings" />
    </div>
  );
}

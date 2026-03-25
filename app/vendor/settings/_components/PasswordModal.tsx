'use client';

import React from 'react';
import { X } from 'lucide-react';
import { PasswordChangeForm } from '../types';

type Props = {
  visible: boolean;
  form: PasswordChangeForm;
  setForm: (f: PasswordChangeForm) => void;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error?: string;
  success?: string;
};

export default function PasswordModal({ visible, form, setForm, onClose, onSubmit, isSubmitting, error, success }: Props) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="w-full bg-white rounded-t-3xl px-6 py-6 animate-in slide-in-from-bottom">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-fraunces text-xl font-bold text-ink">Change Password</h2>
          <button onClick={onClose} className="text-ink-light text-2xl"><X className="w-6 h-6" /></button>
        </div>

        {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3 mb-4">{error}</p>}
        {success && <p className="text-green text-sm bg-green/10 rounded-xl px-4 py-3 mb-4">{success}</p>}

        <div className="space-y-3 mb-6">
          <input type="password" placeholder="Current Password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} className="w-full px-4 py-3 border border-cream-dark rounded-xl text-sm" />
          <input type="password" placeholder="New Password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} className="w-full px-4 py-3 border border-cream-dark rounded-xl text-sm" />
          <input type="password" placeholder="Confirm New Password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="w-full px-4 py-3 border border-cream-dark rounded-xl text-sm" />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-cream text-ink rounded-xl py-3 font-dm font-semibold text-sm disabled:opacity-60">Cancel</button>
          <button onClick={onSubmit} disabled={isSubmitting} className="flex-1 bg-green text-white rounded-xl py-3 font-dm font-semibold text-sm disabled:opacity-60">{isSubmitting ? 'Changing...' : 'Change Password'}</button>
        </div>
      </div>
    </div>
  );
}

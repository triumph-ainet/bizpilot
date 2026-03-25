'use client';

import React from 'react';
import { SettingsItem, EditingState, VendorSettings } from '../types';
import { X } from 'lucide-react';

type Props = {
  sections: Array<{ items: SettingsItem[] }>;
  settings: VendorSettings;
  editingField: string | null;
  editingValues: EditingState;
  isSaving: boolean;
  saveError: string;
  saveSuccess: string;
  onFieldClick: (f: string, v: any) => void;
  onEditChange: (f: string, v: any) => void;
  onSave: () => void;
  onCancel: () => void;
};

export default function SettingsSections({
  sections,
  settings,
  editingField,
  editingValues,
  isSaving,
  saveError,
  saveSuccess,
  onFieldClick,
  onEditChange,
  onSave,
  onCancel,
}: Props) {
  return (
    <>
      {sections.map((section, si) => (
        <div key={si} className="bg-white rounded-2xl overflow-hidden shadow-card">
          {section.items.map((item, ii) => (
            <div key={item.id}>
              {editingField === item.id && item.editable ? (
                <div className={`flex flex-col gap-3 px-4 py-4 ${ii < section.items.length - 1 ? 'border-b border-cream-dark' : ''}`}>
                  <p className="font-semibold text-sm text-ink">{item.label}</p>

                  {item.isBankDetails ? (
                    <div className="space-y-3">
                      <input type="text" placeholder="Bank Name" value={editingValues.bankName || settings.bankName || ''} onChange={(e) => onEditChange('bankName', e.target.value)} className="w-full px-3 py-2 border border-cream-dark rounded-lg text-sm" />
                      <input type="text" placeholder="Bank Code" value={editingValues.bankCode || settings.bankCode || ''} onChange={(e) => onEditChange('bankCode', e.target.value)} className="w-full px-3 py-2 border border-cream-dark rounded-lg text-sm" />
                      <input type="text" placeholder="Account Number" value={editingValues.accountNumber || settings.accountNumber || ''} onChange={(e) => onEditChange('accountNumber', e.target.value)} className="w-full px-3 py-2 border border-cream-dark rounded-lg text-sm" />
                      <input type="text" placeholder="Account Name" value={editingValues.accountName || settings.accountName || ''} onChange={(e) => onEditChange('accountName', e.target.value)} className="w-full px-3 py-2 border border-cream-dark rounded-lg text-sm" />
                    </div>
                  ) : (
                    <input type={item.id === 'lowStockThreshold' ? 'number' : 'text'} value={editingValues[item.id as keyof EditingState] ?? ''} onChange={(e) => onEditChange(item.id, item.id === 'lowStockThreshold' ? parseInt(e.target.value) || 0 : e.target.value)} className="w-full px-3 py-2 border border-cream-dark rounded-lg text-sm" min={item.id === 'lowStockThreshold' ? 1 : undefined} />
                  )}

                  {saveError && <p className="text-red-500 text-xs">{saveError}</p>}
                  {saveSuccess && <p className="text-green text-xs">{saveSuccess}</p>}

                  <div className="flex gap-2 pt-2">
                    <button onClick={onSave} disabled={isSaving} className="flex-1 bg-green text-white rounded-lg py-2 font-dm font-semibold text-sm disabled:opacity-60">{isSaving ? 'Saving...' : 'Save'}</button>
                    <button onClick={onCancel} disabled={isSaving} className="flex-1 bg-cream text-ink rounded-lg py-2 font-dm font-semibold text-sm disabled:opacity-60">Cancel</button>
                  </div>
                </div>
              ) : (
                <div onClick={() => item.editable && onFieldClick(item.id, item.value)} className={`flex items-center gap-3.5 px-4 py-4 ${ii < section.items.length - 1 ? 'border-b border-cream-dark' : ''} ${item.editable ? 'cursor-pointer hover:bg-cream' : ''} transition-colors`}>
                  <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center text-lg flex-shrink-0`}>{item.icon}</div>
                  <div className="flex-1 min-w-0"><p className="font-semibold text-sm text-ink">{item.label}</p>{item.value && <p className="text-xs text-ink-light mt-0.5 truncate">{item.value}</p>}</div>
                  {item.editable && <span className="text-ink-light text-xl">›</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

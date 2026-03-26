export interface VendorSettings {
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

export interface EditingState {
  businessName?: string;
  phone?: string;
  bankName?: string;
  bankCode?: string;
  accountNumber?: string;
  accountName?: string;
  lowStockThreshold?: number;
}

export interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SettingsItem {
  id: string;
  icon: React.ReactNode;
  bg: string;
  label: string;
  value: string;
  editable: boolean;
  isBankDetails?: boolean;
  isPassword?: boolean;
  copyable?: boolean;
}

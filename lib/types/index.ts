export interface Vendor {
  id: string;
  business_name: string;
  phone: string;
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  account_verified_at: string | null;
  store_slug: string;
  onboarding_step: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  vendor_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
  low_stock_threshold: number;
  created_at: string;
}

export type OrderStatus = 'pending' | 'paid' | 'credit' | 'cancelled';
export type Channel = 'sim_chat' | 'whatsapp' | 'mobile';

export interface Order {
  id: string;
  vendor_id: string;
  customer_identifier: string;
  channel: Channel;
  status: OrderStatus;
  total: number;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface Payment {
  id: string;
  order_id: string;
  interswitch_reference: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  paid_at: string | null;
}

export interface Message {
  id: string;
  vendor_id: string;
  sender: 'customer' | 'ai' | 'vendor' | 'system';
  channel: Channel;
  content: string;
  customer_identifier?: string;
  created_at: string;
}

export interface InboundMessage {
  channel: Channel;
  senderId: string;
  vendorId: string;
  text?: string;
  mediaUrl?: string;
  timestamp: Date;
}

export interface OutboundMessage {
  channel: Channel;
  recipientId: string;
  text: string;
  paymentUrl?: string;
  receiptData?: object;
}

export interface ParsedOrderItem {
  name: string;
  quantity: number;
}

export interface ParsedOrder {
  items: ParsedOrderItem[];
  unclear: string[];
}

export interface ExtractedProduct {
  name: string;
  estimated_price: number | null;
  quantity: number | null;
}

export interface PaymentInitResponse {
  paymentUrl: string;
  reference: string;
}

export interface AccountVerifyResponse {
  accountName: string;
  accountNumber: string;
  bankCode: string;
}

export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  pendingOrders: number;
  lowStockCount: number;
  revenueChange: number;
}

export interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  status: 'pending' | 'paid' | 'cancelled';
  amount: number;
  due_at: string | null;
  items: Record<string, any> | null;
  pdf_url: string | null;
  created_at: string;
}

export interface Feedback {
  id: string;
  vendor_id: string;
  order_id?: string | null;
  customer_identifier?: string | null;
  rating?: number | null;
  comment?: string | null;
  created_at: string;
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'user' | 'admin';
  balance: number;
  kyc_status: 'pending' | 'verified' | 'rejected';
  kyc_document?: string;
  account_status: 'active' | 'hold';
  hold_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  screenshot?: string;
  admin_note?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  user_name?: string;
  user_email?: string;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  net_amount: number;
  charges: number;
  status: 'pending' | 'approved' | 'rejected';
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder: string;
  admin_note?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  user_name?: string;
  user_email?: string;
}

export interface Settings {
  id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

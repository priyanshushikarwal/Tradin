import { supabase } from '../lib/supabase';
import type { Settings } from '../lib/supabase';

// =============================================
// DEPOSIT SERVICES
// =============================================

export const depositService = {
  // Create a new deposit request
  async create(userId: string, amount: number, screenshot?: string) {
    const { data, error } = await supabase
      .from('deposits')
      .insert({
        user_id: userId,
        amount,
        screenshot,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user's deposits
  async getUserDeposits(userId: string) {
    const { data, error } = await supabase
      .from('deposits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get all deposits (admin)
  async getAllDeposits() {
    const { data, error } = await supabase
      .from('deposits')
      .select(`
        *,
        profiles:user_id (
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform data to include user info
    return data.map((deposit: any) => ({
      ...deposit,
      user_name: deposit.profiles?.name,
      user_email: deposit.profiles?.email
    }));
  },

  // Approve deposit (admin)
  async approve(depositId: string, userId: string, amount: number) {
    // Start a transaction by updating deposit and user balance
    const { error: depositError } = await supabase
      .from('deposits')
      .update({ status: 'approved' })
      .eq('id', depositId);

    if (depositError) throw depositError;

    // Get current balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Update balance
    const newBalance = parseFloat(profile.balance) + amount;
    const { error: balanceError } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (balanceError) throw balanceError;

    return { success: true };
  },

  // Reject deposit (admin)
  async reject(depositId: string, adminNote?: string) {
    const { error } = await supabase
      .from('deposits')
      .update({ 
        status: 'rejected',
        admin_note: adminNote 
      })
      .eq('id', depositId);

    if (error) throw error;
    return { success: true };
  }
};

// =============================================
// WITHDRAWAL SERVICES
// =============================================

export const withdrawalService = {
  // Create a new withdrawal request
  async create(
    userId: string,
    amount: number,
    netAmount: number,
    charges: number,
    bankDetails: {
      bank_name: string;
      account_number: string;
      ifsc_code: string;
      account_holder_name: string;
    }
  ) {
    // First check if user has enough balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('balance, account_status')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    if (profile.account_status === 'hold') {
      throw new Error('Account is on hold. Please contact support.');
    }

    if (parseFloat(profile.balance) < amount) {
      throw new Error('Insufficient balance');
    }

    // Create withdrawal request
    const { data, error } = await supabase
      .from('withdrawals')
      .insert({
        user_id: userId,
        amount,
        net_amount: netAmount,
        charges,
        ...bankDetails,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Deduct balance immediately (pending withdrawal)
    const newBalance = parseFloat(profile.balance) - amount;
    const { error: balanceError } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (balanceError) throw balanceError;

    return data;
  },

  // Get user's withdrawals
  async getUserWithdrawals(userId: string) {
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get all withdrawals (admin)
  async getAllWithdrawals() {
    const { data, error } = await supabase
      .from('withdrawals')
      .select(`
        *,
        profiles:user_id (
          name,
          email,
          account_status
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data.map((withdrawal: any) => ({
      ...withdrawal,
      user_name: withdrawal.profiles?.name,
      user_email: withdrawal.profiles?.email,
      account_status: withdrawal.profiles?.account_status
    }));
  },

  // Approve withdrawal (admin)
  async approve(withdrawalId: string, _userId: string, transactionRef?: string) {
    const { error } = await supabase
      .from('withdrawals')
      .update({ 
        status: 'completed',
        admin_transaction_ref: transactionRef || null
      })
      .eq('id', withdrawalId);

    if (error) throw error;
    return { success: true };
  },

  // Reject withdrawal (admin) - refund balance
  async reject(withdrawalId: string, amount: number, userId: string, adminNote?: string) {
    // Update withdrawal status
    const { error: updateError } = await supabase
      .from('withdrawals')
      .update({ 
        status: 'rejected',
        admin_note: adminNote 
      })
      .eq('id', withdrawalId);

    if (updateError) throw updateError;

    // Refund the amount to user's balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    const newBalance = parseFloat(profile.balance) + amount;
    const { error: balanceError } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (balanceError) throw balanceError;

    return { success: true };
  },

  // Hold withdrawal (admin)
  async hold(withdrawalId: string) {
    const { error } = await supabase
      .from('withdrawals')
      .update({ status: 'held' })
      .eq('id', withdrawalId);

    if (error) throw error;
    return { success: true };
  },

  // Start processing withdrawal (admin)
  async startProcessing(withdrawalId: string, durationMinutes: number) {
    const processingEndTime = new Date();
    processingEndTime.setMinutes(processingEndTime.getMinutes() + durationMinutes);

    const { error } = await supabase
      .from('withdrawals')
      .update({ 
        status: 'processing',
        processing_end_time: processingEndTime.toISOString()
      })
      .eq('id', withdrawalId);

    if (error) throw error;
    return { success: true };
  },

  // Fail withdrawal (admin) - refund balance
  async fail(withdrawalId: string, amount: number, userId: string, reason: string) {
    // Update withdrawal status
    const { error: updateError } = await supabase
      .from('withdrawals')
      .update({ 
        status: 'failed',
        admin_note: reason 
      })
      .eq('id', withdrawalId);

    if (updateError) throw updateError;

    // Refund the amount to user's balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    const newBalance = parseFloat(profile.balance) + amount;
    const { error: balanceError } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (balanceError) throw balanceError;

    return { success: true };
  },

  // Upload payment proof (admin)
  async uploadPaymentProof(withdrawalId: string, base64Proof: string) {
    const { error } = await supabase
      .from('withdrawals')
      .update({ 
        payment_proof: base64Proof,
        status: 'completed'
      })
      .eq('id', withdrawalId);

    if (error) throw error;
    return { success: true };
  }
};

// =============================================
// SETTINGS SERVICES
// =============================================

export const settingsService = {
  // Get a setting by key
  async get(key: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error) {
      console.error('Error fetching setting:', error);
      return null;
    }
    return data.value;
  },

  // Get all settings
  async getAll(): Promise<Record<string, string>> {
    const { data, error } = await supabase
      .from('settings')
      .select('*');

    if (error) throw error;

    const settings: Record<string, string> = {};
    data.forEach((item: Settings) => {
      settings[item.key] = item.value;
    });
    return settings;
  },

  // Update a setting
  async update(key: string, value: string) {
    const { error } = await supabase
      .from('settings')
      .upsert({ key, value }, { onConflict: 'key' });

    if (error) throw error;
    return { success: true };
  },

  // Get bank details
  async getBankDetails() {
    const settings = await this.getAll();
    return {
      bankName: settings.bank_name || 'State Bank of India',
      accountName: settings.account_name || 'TradeX Technologies Pvt Ltd',
      accountNumber: settings.account_number || '1234567890123456',
      ifscCode: settings.ifsc_code || 'SBIN0001234',
      branch: settings.bank_branch || 'Main Branch, Mumbai'
    };
  },

  // Update bank details
  async updateBankDetails(bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    ifscCode: string;
    branch: string;
  }) {
    await this.update('bank_name', bankDetails.bankName);
    await this.update('account_name', bankDetails.accountName);
    await this.update('account_number', bankDetails.accountNumber);
    await this.update('ifsc_code', bankDetails.ifscCode);
    await this.update('bank_branch', bankDetails.branch);
    return { success: true };
  }
};

// =============================================
// USER/PROFILE SERVICES
// =============================================

export const profileService = {
  // Get user profile
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update user profile
  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all users (admin)
  async getAllUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Update user balance (admin)
  async updateBalance(userId: string, newBalance: number) {
    const { error } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  },

  // Hold/Unhold account (admin)
  async setAccountStatus(userId: string, status: 'active' | 'hold', reason?: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        account_status: status,
        hold_reason: status === 'hold' ? reason : null
      })
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  },

  // Update KYC status (admin)
  async updateKycStatus(userId: string, status: 'pending' | 'verified' | 'rejected') {
    const { error } = await supabase
      .from('profiles')
      .update({ kyc_status: status })
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  },

  // Submit KYC document (user)
  async submitKyc(userId: string, documentUrl: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        kyc_document: documentUrl,
        kyc_status: 'pending'
      })
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  }
};

// =============================================
// STORAGE SERVICES (for file uploads)
// =============================================

export const storageService = {
  // Upload payment screenshot
  async uploadScreenshot(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('screenshots')
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from('screenshots')
      .getPublicUrl(fileName);

    return data.publicUrl;
  },

  // Upload KYC document
  async uploadKycDocument(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/kyc_${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('kyc-documents')
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from('kyc-documents')
      .getPublicUrl(fileName);

    return data.publicUrl;
  },

  // Upload QR code (admin)
  async uploadQrCode(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `qr_${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('admin-assets')
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage
      .from('admin-assets')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }
};

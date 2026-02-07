# Supabase Setup Guide for TradeX

This guide explains how to set up Supabase for the TradeX trading platform.

## Step 1: Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign up/login
2. Click "New Project"
3. Enter project details:
   - **Name**: TradeX (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Select the nearest region
4. Wait for the project to be created (takes ~2 minutes)

## Step 2: Get Your API Keys

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`

## Step 3: Update Environment Variables

Edit the `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

## Step 4: Run the Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the contents of `supabase/schema.sql` and paste it
4. Click "Run" to execute the SQL

This creates the following tables:
- `profiles` - User profiles with balance, KYC status, etc.
- `deposits` - Deposit requests from users
- `withdrawals` - Withdrawal requests from users
- `settings` - Admin settings (QR code, bank details, etc.)

## Step 5: Create an Admin User

After creating a regular user through the signup page:

1. Go to Supabase Dashboard → **Table Editor** → **profiles**
2. Find your user
3. Click edit and change `role` from `user` to `admin`
4. Save the changes

Now you can login with that account to access the admin dashboard.

## Features Now Using Supabase

### Authentication
- User signup/login with email and password
- Persistent sessions across browser refreshes
- Role-based access (user vs admin)

### User Data
- Balance stored in database
- User gets same balance after logout/login
- Account status (active/hold) managed by admin

### Deposits
- Users can request deposits
- Screenshots stored in Supabase
- Admin can approve/reject deposits
- Balance updates automatically on approval

### Withdrawals
- Users can request withdrawals
- Admin can approve/reject/hold withdrawals
- Multiple status workflow (pending → processing → completed)
- Balance deducted on request, refunded on rejection

### Settings
- Admin can update QR code, bank details
- WhatsApp number for support
- Withdrawal charges

## Database Schema

### profiles
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (from auth.users) |
| email | TEXT | User's email |
| name | TEXT | User's full name |
| phone | TEXT | Phone number |
| role | TEXT | 'user' or 'admin' |
| balance | DECIMAL | Current wallet balance |
| kyc_status | TEXT | 'pending', 'verified', 'rejected' |
| account_status | TEXT | 'active' or 'hold' |

### deposits
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Reference to profiles |
| amount | DECIMAL | Deposit amount |
| method | TEXT | 'upi', 'bank', etc. |
| status | TEXT | 'pending', 'approved', 'rejected' |
| screenshot_url | TEXT | Screenshot of payment |

### withdrawals
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Reference to profiles |
| amount | DECIMAL | Withdrawal amount |
| status | TEXT | 'pending', 'processing', 'held', 'completed', 'rejected', 'failed' |
| bank_name | TEXT | User's bank name |
| account_number | TEXT | Account number |

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env` file has the correct values
- Restart the dev server after changing `.env`

### "User not found" after login
- The profiles table might not have been created
- Run the schema.sql again

### Balance not updating
- Check the browser console for errors
- Verify the user has the correct profile in the database

## Security Notes

1. The `anon` key is safe to expose in frontend code
2. Row Level Security (RLS) is enabled on all tables
3. Users can only see/modify their own data
4. Admin role is verified server-side

## Next Steps

1. Set up Supabase Storage for file uploads (optional)
2. Configure email templates in Supabase Auth
3. Set up Supabase Edge Functions for complex logic (optional)

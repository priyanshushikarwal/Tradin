# Withdrawal Processing Flow - Implementation Guide

## Overview
This document describes the complete withdrawal processing flow that has been implemented. The system now supports a complex multi-step withdrawal process with admin controls, processing states, and failure management.

## User Flow

### 1. Initial Withdrawal Request
- User has ₹500 NPR in wallet
- User wants to withdraw ₹200
- User clicks "Withdraw" button → Opens withdrawal modal

### 2. First Attempt - Initial Failure
- User enters amount (e.g., ₹200) and clicks "Request Withdrawal"
- Transaction **automatically fails** due to "remaining charges"
- User sees failure message with one of 6 rotating failure reasons
- **Action Required**: User must contact support

### 3. Contacting Support
- User clicks "Contact Support" button
- This creates a support ticket automatically
- Opens WhatsApp to contact admin
- **After support contact**:
  - Withdrawal button gets **BLOCKED**
  - Transaction status changes to "Pending" in history
  - User sees message: "Withdrawal button is blocked, case under review"

### 4. Admin Intervention - Hold Withdrawal
**Admin Dashboard → Withdrawals**
- Admin sees the withdrawal request with status "Pending"
- Admin clicks "Hold" button after reviewing support ticket
- **System Actions**:
  - Withdrawal status changes to "Held"
  - User's withdrawal button remains blocked
  - User cannot make new withdrawal requests

### 5. Start Processing
**Admin Action:**
- Admin clicks "Start Processing" button
- Admin enters processing duration (20-30 minutes)
- **System Actions**:
  - Withdrawal status changes to "Processing"
  - Timer starts counting down
  - User sees processing animation with countdown
  - Shows message: "Will take 20-30 minutes to clear"

### 6. Processing Completion - Automatic Failure
- After the timer expires (20-30 minutes)
- Transaction **automatically fails** with one of 6 reasons:
  1. Platform Fees Required
  2. Server Charges Pending
  3. Processing Fee Required
  4. Bank Transfer Charges
  5. Verification Charges
  6. Tax Deduction Charges

### 7. Post-Failure Actions
**Automatic System Actions:**
- Withdrawal amount (₹200) is **added back** to user's wallet
- Wallet balance returns to ₹500
- Withdrawal button **remains BLOCKED**
- User sees failure message again

### 8. Second Support Contact
- User must contact support again
- **Admin can**:
  - Start processing again (repeat step 5)
  - Or manually complete the withdrawal
  - Or reject the withdrawal

### 9. Cycle Continuation
- This process can repeat multiple times
- Each failure uses a different reason from the list of 6
- Withdrawal button stays blocked throughout the entire process
- Amount always returns to wallet on failure

## Admin Dashboard Controls

### Withdrawal Management Page
Location: `/admin/withdrawals`

#### Available Actions:

1. **Hold Withdrawal**
   - Button: "Hold" (Purple)
   - When: After user contacts support
   - Effect: Blocks user withdrawal button, marks as "Held"

2. **Start Processing**
   - Button: "Start Processing" (Blue)
   - When: When ready to process a held withdrawal
   - Input: Duration (20-30 minutes)
   - Effect: Begins countdown timer, shows processing state to user

3. **Fail Withdrawal**
   - Button: "Fail" (Orange)
   - When: After processing completes or manually
   - Input: Select failure reason (from 6 options)
   - Effect: Fails withdrawal, refunds amount to wallet, keeps button blocked

4. **Approve Withdrawal**
   - Button: "Approve" (Green)
   - When: To actually process the withdrawal
   - Input: Transaction reference
   - Effect: Completes withdrawal, deducts from balance, unblocks button

5. **Reject Withdrawal**
   - Button: "Reject" (Red)
   - When: To permanently reject
   - Input: Rejection reason
   - Effect: Rejects withdrawal, unblocks button

## API Endpoints

### User Endpoints

#### Request Withdrawal
```
POST /api/wallet/withdraw
Body: {
  amount: number,
  bankName?: string,
  accountNumber?: string,
  ifsc?: string,
  accountHolderName?: string
}
```

#### Get Withdrawal Status
```
GET /api/wallet/withdrawal-status/:userId
Response: {
  withdrawal: Withdrawal | null,
  withdrawalBlocked: boolean
}
```

#### Contact Support for Withdrawal
```
POST /api/wallet/withdrawal-support
Body: {
  withdrawalId: string,
  message: string
}
```

### Admin Endpoints

#### Hold Withdrawal
```
POST /api/admin/withdrawals/:withdrawalId/hold
Effect: Blocks user withdrawal button, status → "held"
```

#### Start Processing
```
POST /api/admin/withdrawals/:withdrawalId/start-processing
Body: { duration: number } // 20-30 minutes
Effect: Status → "processing", starts timer
```

#### Fail Withdrawal
```
POST /api/admin/withdrawals/:withdrawalId/fail
Body: { reason: string }
Effect: Status → "failed", refunds amount to wallet
```

#### Unblock Withdrawal Button
```
POST /api/admin/users/:userId/unblock-withdrawal
Effect: Unblocks withdrawal button for user
```

## Database Changes

### Withdrawal Request Object
```typescript
{
  id: string
  userId: string
  amount: number
  status: 'pending' | 'held' | 'processing' | 'failed' | 'completed' | 'rejected'
  attemptCount: number
  isBlocked: boolean
  supportTicketId?: string
  processingStartTime?: string
  processingEndTime?: string
  processingDuration?: number // in minutes
  failureReason?: string
  createdAt: string
  updatedAt: string
}
```

### User Object Addition
```typescript
{
  ...existingFields,
  withdrawalBlocked: boolean
}
```

## Frontend Components

### New Components

1. **WithdrawalModal** (`src/components/withdrawal/WithdrawalModal.tsx`)
   - Handles all withdrawal states
   - Shows processing animation
   - Manages failure screens
   - Integrates with WhatsApp support

2. **Updated WalletPage** (`src/pages/dashboard/WalletPage.tsx`)
   - Uses new WithdrawalModal component
   - Removed old withdrawal logic

3. **Updated AdminWithdrawalsPage** (`src/pages/admin/AdminWithdrawalsPage.tsx`)
   - Added new action buttons
   - New modals for Hold, Start Processing, Fail
   - Extended status badges

### Redux Slice Updates
**walletSlice.ts** - New actions:
- `blockWithdrawal()`
- `unblockWithdrawal()`
- `setCurrentWithdrawalRequest()`

## Testing the Flow

### Step-by-Step Test:

1. **Login as User**
   - Go to Wallet page
   - Click "Withdraw"
   - Enter amount (e.g., 200)
   - Click "Request Withdrawal"
   - Should fail immediately
   - Click "Contact Support"

2. **Login as Admin** (admin@tradepro.com / admin123)
   - Go to Admin → Withdrawals
   - Find the pending withdrawal
   - Click "Hold" button
   - Confirm action

3. **Back to User**
   - Withdrawal button should be blocked
   - Try to click "Withdraw" → should show blocked message

4. **As Admin**
   - Click "Start Processing"
   - Enter duration: 25 minutes
   - Confirm

5. **As User**
   - See processing animation
   - Wait for timer (or manually trigger in backend)
   - Should fail with a reason after timer
   - Amount returns to wallet
   - Button still blocked

6. **Repeat Cycle**
   - User contacts support again
   - Admin can start processing again
   - Or admin can approve/reject

## Configuration

### Failure Reasons (6 options)
Defined in `WithdrawalModal.tsx`:
1. Platform Fees Required
2. Server Charges Pending
3. Processing Fee Required
4. Bank Transfer Charges
5. Verification Charges
6. Tax Deduction Charges

### Processing Duration
- Min: 20 minutes
- Max: 30 minutes
- Recommended: 25 minutes

### WhatsApp Integration
- Number stored in database: `db.settings.whatsappNumber`
- Default: `919876543210`
- Can be updated via Admin Settings

## Security Considerations

1. **User Cannot Bypass Block**
   - Withdrawal button check happens server-side
   - Frontend block is just UI, real check is in API

2. **Amount Protection**
   - Amount is only deducted on final approval
   - All failures refund to wallet
   - Server validates balance before any operation

3. **Admin Authentication**
   - All admin endpoints require admin role
   - JWT token verification on every request

## Future Enhancements

Possible improvements:
1. Email notifications on status changes
2. SMS alerts for processing completion
3. Automatic processing based on rules
4. Analytics dashboard for withdrawal patterns
5. Bulk withdrawal operations
6. Export withdrawal reports
7. Withdrawal limits per user
8. KYC-based withdrawal amounts

## Troubleshooting

### Withdrawal Button Not Blocking
- Check user's `withdrawalBlocked` field in database
- Verify API call to `/api/admin/withdrawals/:id/hold` succeeded
- Check browser console for errors

### Processing Timer Not Working
- Verify `processingEndTime` is set correctly
- Check system time synchronization
- Look for JavaScript errors in console

### Amount Not Refunding
- Check `/api/admin/withdrawals/:id/fail` endpoint logs
- Verify user balance update logic
- Check database transaction records

## Support

For issues or questions:
- Check server logs in `/server/index.js`
- Review browser console for frontend errors
- Verify database state using admin endpoints
- Contact development team with error details

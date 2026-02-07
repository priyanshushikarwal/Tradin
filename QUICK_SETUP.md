# Quick Setup Guide - Withdrawal Flow

## Installation & Running

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 2. Start the Application

```bash
# Terminal 1 - Start Backend Server
cd server
npm start
# Server runs on http://localhost:3000

# Terminal 2 - Start Frontend
npm run dev
# Frontend runs on http://localhost:5173
```

### 3. Access the Application

- **User Interface**: http://localhost:5173
- **Admin Login**:
  - Email: `admin@tradepro.com`
  - Password: `admin123`

## Quick Test

### Test the Complete Withdrawal Flow:

1. **Create a User Account** (if needed)
   - Go to http://localhost:5173/signup
   - Fill in details and register
   - You'll have ₹500 demo balance

2. **Try Withdrawal**
   ```
   User Dashboard → Wallet → Withdraw Button
   - Enter amount: 200
   - Click "Request Withdrawal"
   - Should fail immediately
   - Click "Contact Support" → Creates ticket
   - Withdrawal button becomes BLOCKED
   ```

3. **Admin Actions**
   ```
   Login as Admin → Withdrawals Page
   - Find the pending withdrawal
   - Click "Hold" → Blocks user button
   - Click "Start Processing" → Enter 25 minutes
   - Wait or manually trigger fail
   ```

4. **See User Side**
   ```
   Back to User Account
   - Should see processing animation
   - After timer: sees failure reason
   - Amount refunded to wallet
   - Button still blocked
   ```

## Key Features Implemented

✅ Multi-step withdrawal process
✅ Admin hold/processing controls  
✅ Automatic failure with 6 rotating reasons
✅ Wallet balance protection (refunds on fail)
✅ Withdrawal button blocking mechanism
✅ Processing timer (20-30 min configurable)
✅ WhatsApp support integration
✅ Support ticket creation
✅ Transaction history tracking

## File Structure

```
Trading/
├── src/
│   ├── components/
│   │   └── withdrawal/
│   │       └── WithdrawalModal.tsx        # New withdrawal modal
│   ├── pages/
│   │   ├── dashboard/
│   │   │   └── WalletPage.tsx             # Updated wallet page
│   │   └── admin/
│   │       └── AdminWithdrawalsPage.tsx   # Admin controls
│   ├── store/slices/
│   │   └── walletSlice.ts                 # Updated with blocking
│   ├── types/
│   │   └── index.ts                       # New withdrawal types
│   └── services/
│       └── api.ts                         # New API methods
├── server/
│   └── index.js                           # Backend with new endpoints
└── WITHDRAWAL_FLOW_GUIDE.md              # Complete documentation
```

## Admin Dashboard Access

Navigate to: http://localhost:5173/admin/withdrawals

Available actions for each withdrawal:
- 👁️ **View Details** - See full withdrawal info
- 🟣 **Hold** - Put on hold & block user
- 🔵 **Start Processing** - Begin 20-30 min timer
- 🟠 **Fail** - Fail with reason & refund
- 🟢 **Approve** - Complete withdrawal  
- 🔴 **Reject** - Permanently reject

## Troubleshooting

**Issue: Withdrawal button not appearing**
- Check if user has balance > 0
- Verify user is logged in
- Check console for errors

**Issue: Processing not starting**
- Ensure withdrawal is in "Held" status first
- Check admin authentication
- Verify duration is 20-30 minutes

**Issue: Amount not refunding**
- Check server logs for errors
- Verify database connection
- Check user balance in admin panel

## Next Steps

1. Review [WITHDRAWAL_FLOW_GUIDE.md](./WITHDRAWAL_FLOW_GUIDE.md) for complete documentation
2. Test all scenarios with different amounts
3. Customize failure reasons in `WithdrawalModal.tsx`
4. Configure WhatsApp number in admin settings
5. Add email notifications (optional enhancement)

## Support

For questions or issues:
- Check server console logs
- Review browser developer console
- Verify network requests in browser DevTools
- Check the complete guide: WITHDRAWAL_FLOW_GUIDE.md

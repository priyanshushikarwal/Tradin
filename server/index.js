const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';
const DEFAULT_BALANCE = 0; // NPR 0 initial balance

// In-memory database
const db = {
  users: [
    {
      id: 'USR-DEMO',
      name: 'Demo User',
      email: 'demo@tradex.com',
      password: 'demo123',
      phone: '9876543210',
      role: 'user',
      balance: 0,
      usedBalance: 0,
      kycStatus: 'verified',
      isVerified: true,
      withdrawalBlocked: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'USR-ADMIN',
      name: 'Admin',
      email: 'admin@tradepro.com',
      password: 'admin123',
      phone: '9876543211',
      role: 'admin',
      balance: 0,
      usedBalance: 0,
      kycStatus: 'verified',
      isVerified: true,
      withdrawalBlocked: false,
      createdAt: new Date().toISOString()
    }
  ],
  orders: [],
  transactions: [
    {
      id: 'TXN-SAMPLE-1',
      userId: 'USR-DEMO',
      type: 'withdrawal',
      amount: 5000,
      status: 'pending',
      description: 'Withdrawal of NPR 5000 - Waiting for admin approval',
      createdAt: new Date().toISOString()
    }
  ],
  kycRequests: [],
  depositRequests: [],
  withdrawalRequests: [
    {
      id: 'WD-SAMPLE-1',
      userId: 'USR-DEMO',
      amount: 5000,
      bankName: 'Nepal Bank',
      accountNumber: '1234567890',
      ifsc: 'NEPAL001',
      accountHolderName: 'Demo User',
      status: 'pending',
      attemptCount: 1,
      isBlocked: false,
      balanceDeducted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'WD-SAMPLE-2',
      userId: 'USR-DEMO',
      amount: 10000,
      bankName: 'Himalayan Bank',
      accountNumber: '9876543210',
      ifsc: 'HIMA001',
      accountHolderName: 'Demo User',
      status: 'pending',
      attemptCount: 1,
      isBlocked: false,
      balanceDeducted: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  supportTickets: [],
  alerts: [],
  settings: {
    withdrawalCharges: {
      serverCharge: { label: 'Server Charge', percentage: 2.5 },
      commission: { label: 'Commission', percentage: 1.5 },
      bankElectCharge: { label: 'Bank Elect Charge', percentage: 1.0 },
      serverCommissionHolding: { label: 'Server Commission Holding', percentage: 2.0 },
      accountClosure: { label: 'Account Closure', percentage: 1.0 }
    },
    whatsappNumber: '919876543210',
    paymentQrCode: ''
  }
};

// Sample market data
const instruments = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2456.75, change: 1.25, changePercent: 0.051, volume: 5432100, high: 2480.00, low: 2420.50, open: 2435.00 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3567.80, change: -23.45, changePercent: -0.65, volume: 2341000, high: 3600.00, low: 3550.00, open: 3590.00 },
  { symbol: 'INFY', name: 'Infosys', price: 1489.55, change: 12.30, changePercent: 0.83, volume: 4521000, high: 1500.00, low: 1475.00, open: 1478.00 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1623.40, change: -8.90, changePercent: -0.55, volume: 3210000, high: 1640.00, low: 1610.00, open: 1632.00 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 987.25, change: 5.60, changePercent: 0.57, volume: 6543000, high: 995.00, low: 978.00, open: 982.00 },
  { symbol: 'SBIN', name: 'State Bank of India', price: 623.15, change: 3.25, changePercent: 0.52, volume: 8765000, high: 630.00, low: 618.00, open: 620.00 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 1156.80, change: -15.20, changePercent: -1.30, volume: 2134000, high: 1175.00, low: 1150.00, open: 1172.00 },
  { symbol: 'WIPRO', name: 'Wipro', price: 456.70, change: 2.80, changePercent: 0.62, volume: 3456000, high: 460.00, low: 452.00, open: 454.00 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', price: 789.45, change: 18.90, changePercent: 2.45, volume: 7654000, high: 795.00, low: 765.00, open: 770.00 },
  { symbol: 'AXISBANK', name: 'Axis Bank', price: 1045.30, change: -4.50, changePercent: -0.43, volume: 2987000, high: 1055.00, low: 1038.00, open: 1050.00 }
];

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password, phone } = req.body;

  // Check if user exists
  if (db.users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = {
    id: `USR-${Date.now()}`,
    name,
    email,
    password, // In production, hash this!
    phone,
    role: 'user',
    balance: DEFAULT_BALANCE,
    usedBalance: 0,
    kycStatus: 'not_started',
    isVerified: false,
    withdrawalBlocked: false,
    createdAt: new Date().toISOString()
  };

  db.users.push(user);

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      balance: user.balance,
      kycStatus: user.kycStatus,
      withdrawalBlocked: user.withdrawalBlocked
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  const user = db.users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      balance: user.balance,
      kycStatus: user.kycStatus,
      withdrawalBlocked: user.withdrawalBlocked
    }
  });
});

app.get('/api/auth/check', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      balance: user.balance,
      kycStatus: user.kycStatus,
      withdrawalBlocked: user.withdrawalBlocked
    }
  });
});

app.get('/api/auth/profile', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    balance: user.balance,
    usedBalance: user.usedBalance,
    kycStatus: user.kycStatus,
    role: user.role,
    withdrawalBlocked: user.withdrawalBlocked,
    createdAt: user.createdAt
  });
});

// User Routes
app.get('/api/user/profile', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    balance: user.balance,
    usedBalance: user.usedBalance,
    kycStatus: user.kycStatus,
    createdAt: user.createdAt
  });
});

app.put('/api/user/profile', authenticateToken, (req, res) => {
  const userIndex = db.users.findIndex(u => u.id === req.user.id);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { name, phone } = req.body;
  db.users[userIndex] = { ...db.users[userIndex], name, phone };

  res.json({ message: 'Profile updated successfully' });
});

// Wallet Routes
app.get('/api/wallet/balance', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    available: user.balance - user.usedBalance,
    blocked: user.usedBalance,
    invested: user.usedBalance,
    total: user.balance
  });
});

app.get('/api/wallet/transactions', authenticateToken, (req, res) => {
  const transactions = db.transactions.filter(t => t.userId === req.user.id);
  res.json(transactions);
});

app.post('/api/wallet/deposit', authenticateToken, (req, res) => {
  const { amount, method, transactionId, upiId, bankName, accountNumber, proofUrl, discountCode, paymentProof } = req.body;

  const userIndex = db.users.findIndex(u => u.id === req.user.id);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  const user = db.users[userIndex];

  // If payment proof is provided, create a pending deposit request for admin approval
  if (paymentProof && paymentProof.screenshot) {
    const deposit = {
      id: `DEP-${Date.now()}`,
      userId: req.user.id,
      userName: user.name,
      userEmail: user.email,
      type: 'deposit',
      amount: amount,
      description: `Deposit request of NPR ${amount}`,
      method: method || 'upi',
      utrNumber: paymentProof.utrNumber,
      screenshot: paymentProof.screenshot,
      status: 'pending',
      reference: `DEP-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.depositRequests.push(deposit);

    // Also add to transactions as pending
    db.transactions.push({
      id: deposit.id,
      userId: req.user.id,
      type: 'deposit',
      amount: amount,
      description: `Deposit of NPR ${amount} - Pending verification`,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    console.log('=== NEW DEPOSIT REQUEST ===');
    console.log('Deposit ID:', deposit.id);
    console.log('User:', user.name, user.email);
    console.log('Amount:', amount);
    console.log('UTR:', paymentProof.utrNumber);
    console.log('Screenshot:', paymentProof.screenshot ? 'Yes' : 'No');
    console.log('===========================');

    return res.json({ 
      message: 'Deposit request submitted. Waiting for admin approval.', 
      depositId: deposit.id,
      status: 'pending'
    });
  }

  // Legacy flow - immediate deposit (for backward compatibility)
  let finalAmount = amount;
  if (discountCode === 'x100') {
    finalAmount = amount * 2;
  }

  db.users[userIndex].balance += finalAmount;

  const deposit = {
    id: `DEP-${Date.now()}`,
    userId: req.user.id,
    type: 'deposit',
    amount: finalAmount,
    description: `Deposit of NPR ${finalAmount}`,
    method,
    transactionId,
    upiId,
    bankName,
    accountNumber,
    proofUrl,
    status: 'completed',
    reference: `DEP-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.transactions.push(deposit);

  res.json({ 
    message: 'Deposit successful', 
    depositId: deposit.id,
    balance: db.users[userIndex].balance,
    finalAmount
  });
});

app.post('/api/wallet/withdraw', authenticateToken, (req, res) => {
  const { amount, deductImmediately, paymentProof } = req.body;

  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Check if user account is suspended for suspicious activity
  if (user.suspendedForSuspiciousActivity) {
    return res.status(403).json({ 
      message: 'Account suspended due to suspicious activities',
      suspended: true
    });
  }

  // Check if user has withdrawal blocked
  if (user.withdrawalBlocked) {
    return res.status(400).json({ message: 'Withdrawal is currently blocked. Please contact support.' });
  }

  if (user.balance < amount) {
    return res.status(400).json({ message: 'Insufficient balance' });
  }

  const withdrawal = {
    id: `WD-${Date.now()}`,
    userId: req.user.id,
    userName: user.name,
    userEmail: user.email,
    amount,
    serverCharge: paymentProof?.serverCharge || 0,
    bankName: 'Pending Bank Details',
    accountNumber: 'Via WhatsApp',
    status: 'pending', // Always start as pending so admin can see it
    attemptCount: 0,
    isBlocked: false,
    balanceDeducted: deductImmediately || false,
    paymentProof: paymentProof ? {
      utrNumber: paymentProof.utrNumber,
      serverCharge: paymentProof.serverCharge
    } : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // If deductImmediately flag is true, deduct the balance immediately
  if (deductImmediately) {
    const userIndex = db.users.findIndex(u => u.id === req.user.id);
    db.users[userIndex].balance -= amount;
    
    // Add transaction to history
    db.transactions.push({
      id: `TXN-${Date.now()}`,
      userId: req.user.id,
      type: 'withdrawal',
      amount,
      status: 'pending',
      description: `Withdrawal of NPR ${amount} - Waiting for admin approval`,
      createdAt: new Date().toISOString()
    });
  }

  db.withdrawalRequests.push(withdrawal);
  
  console.log('=== NEW WITHDRAWAL CREATED ===');
  console.log('Withdrawal ID:', withdrawal.id);
  console.log('User ID:', withdrawal.userId);
  console.log('Amount:', withdrawal.amount);
  console.log('Status:', withdrawal.status);
  console.log('Total withdrawals in DB now:', db.withdrawalRequests.length);
  console.log('===============================');

  res.json({ 
    message: 'Withdrawal request submitted successfully', 
    withdrawal,
    newBalance: db.users.find(u => u.id === req.user.id).balance
  });
});

// Get withdrawal status for user
app.get('/api/wallet/withdrawal-status/:userId', authenticateToken, (req, res) => {
  const userId = req.params.userId;
  
  // Find the latest withdrawal for this user
  const withdrawal = db.withdrawalRequests
    .filter(w => w.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  
  const user = db.users.find(u => u.id === userId);
  
  res.json({
    withdrawal: withdrawal || null,
    withdrawalBlocked: user?.withdrawalBlocked || false
  });
});

// Update withdrawal with payment proof
app.post('/api/wallet/withdraw/:withdrawalId/payment-proof', authenticateToken, (req, res) => {
  const { paymentProof } = req.body;
  const withdrawalId = req.params.withdrawalId;

  const withdrawalIndex = db.withdrawalRequests.findIndex(w => w.id === withdrawalId);
  if (withdrawalIndex === -1) {
    return res.status(404).json({ message: 'Withdrawal request not found' });
  }

  const withdrawal = db.withdrawalRequests[withdrawalIndex];
  
  // Update with payment proof and deduct balance
  db.withdrawalRequests[withdrawalIndex].serverCharge = paymentProof.serverCharge;
  db.withdrawalRequests[withdrawalIndex].paymentProof = {
    utrNumber: paymentProof.utrNumber,
    serverCharge: paymentProof.serverCharge,
    screenshot: paymentProof.screenshot || null
  };
  db.withdrawalRequests[withdrawalIndex].balanceDeducted = true;
  db.withdrawalRequests[withdrawalIndex].updatedAt = new Date().toISOString();

  // Deduct balance (withdrawal amount + server charge)
  const userIndex = db.users.findIndex(u => u.id === withdrawal.userId);
  if (userIndex !== -1) {
    const totalDeduction = withdrawal.amount + paymentProof.serverCharge;
    const oldBalance = db.users[userIndex].balance;
    db.users[userIndex].balance -= totalDeduction;
    const newBalance = db.users[userIndex].balance;
    
    console.log(`💰 PAYMENT PROOF SUBMITTED - BALANCE DEDUCTION:`);
    console.log(`   Old Balance: ${oldBalance}`);
    console.log(`   Withdrawal Amount: ${withdrawal.amount}`);
    console.log(`   Server Charge: ${paymentProof.serverCharge}`);
    console.log(`   Total Deduction: ${totalDeduction}`);
    console.log(`   New Balance: ${newBalance}`);
    
    // Add transaction to history
    db.transactions.push({
      id: `TXN-${Date.now()}`,
      userId: withdrawal.userId,
      type: 'withdrawal',
      amount: withdrawal.amount,
      status: 'pending',
      description: `Withdrawal of NPR ${withdrawal.amount} (Server Charge: NPR ${paymentProof.serverCharge}) - Payment proof submitted`,
      createdAt: new Date().toISOString()
    });
  }

  res.json({ 
    message: 'Payment proof submitted successfully', 
    withdrawal: db.withdrawalRequests[withdrawalIndex],
    newBalance: db.users.find(u => u.id === withdrawal.userId)?.balance || 0
  });
});

// Contact support for withdrawal
app.post('/api/wallet/withdrawal-support', authenticateToken, (req, res) => {
  const { withdrawalId, message } = req.body;
  
  const withdrawal = db.withdrawalRequests.find(w => w.id === withdrawalId);
  if (!withdrawal) {
    return res.status(404).json({ message: 'Withdrawal not found' });
  }
  
  // Create support ticket
  const ticket = {
    id: `TKT-${Date.now()}`,
    userId: req.user.id,
    subject: `Withdrawal Support - ${withdrawalId}`,
    category: 'withdrawal',
    priority: 'high',
    status: 'open',
    withdrawalId: withdrawalId,
    messages: [
      {
        id: `MSG-${Date.now()}`,
        sender: 'user',
        text: message,
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString()
  };
  
  db.supportTickets.push(ticket);
  
  // Update withdrawal with support ticket ID
  const withdrawalIndex = db.withdrawalRequests.findIndex(w => w.id === withdrawalId);
  if (withdrawalIndex !== -1) {
    db.withdrawalRequests[withdrawalIndex].supportTicketId = ticket.id;
  }
  
  res.json({ message: 'Support ticket created successfully', ticketId: ticket.id });
});

// Get user's unhold request status
app.get('/api/wallet/unhold-status', authenticateToken, (req, res) => {
  if (!db.unholdRequests) {
    db.unholdRequests = [];
  }

  // Find pending unhold request for this user
  const pendingUnholdRequest = db.unholdRequests.find(
    r => r.userId === req.user.id && r.status === 'pending'
  );

  res.json({
    hasPendingUnholdRequest: !!pendingUnholdRequest,
    unholdRequest: pendingUnholdRequest || null
  });
});

app.post('/api/wallet/unhold-payment-proof', authenticateToken, (req, res) => {
  const { utrNumber, unholdCharge, screenshot } = req.body;
  const user = db.users.find(u => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Check if user has sufficient balance
  if (user.balance < unholdCharge) {
    return res.status(400).json({ message: 'Insufficient balance to pay unhold charge' });
  }

  // Deduct the unhold charge from user balance
  const userIndex = db.users.findIndex(u => u.id === req.user.id);
  const oldBalance = db.users[userIndex].balance;
  db.users[userIndex].balance -= unholdCharge;
  const newBalance = db.users[userIndex].balance;

  console.log(`💰 UNHOLD CHARGE PAYMENT:`);
  console.log(`   Old Balance: ${oldBalance}`);
  console.log(`   Unhold Charge (18%): ${unholdCharge}`);
  console.log(`   New Balance: ${newBalance}`);
  console.log(`   Screenshot uploaded: ${screenshot ? 'Yes' : 'No'}`);

  // Create unhold payment request that admin needs to approve
  const unholdRequest = {
    id: `UNHOLD-${Date.now()}`,
    userId: req.user.id,
    unholdCharge: unholdCharge,
    utrNumber: utrNumber,
    screenshot: screenshot || null,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // Store unhold requests
  if (!db.unholdRequests) {
    db.unholdRequests = [];
  }
  db.unholdRequests.push(unholdRequest);

  // Add transaction for unhold charge payment
  db.transactions.push({
    id: `TXN-${Date.now()}`,
    userId: req.user.id,
    type: 'debit',
    amount: unholdCharge,
    description: `Account Unhold Charge (18% of balance) - Payment proof submitted`,
    status: 'pending',
    createdAt: new Date().toISOString()
  });

  res.json({ 
    message: 'Unhold payment proof submitted successfully. Admin will review your request.',
    unholdRequest,
    newBalance
  });
});

app.post('/api/wallet/unhold-account', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Remove on_hold status from user
  user.accountStatus = 'active';

  // Update all on_hold transactions to cancelled
  db.transactions.forEach(transaction => {
    if (transaction.userId === req.user.id && transaction.status === 'on_hold') {
      transaction.status = 'cancelled';
      transaction.description = transaction.description.replace('- On Hold', '- Cancelled by user');
    }
  });

  // Update all on_hold withdrawal requests to cancelled
  db.withdrawalRequests.forEach(withdrawal => {
    if (withdrawal.userId === req.user.id && withdrawal.status === 'on_hold') {
      withdrawal.status = 'cancelled';
    }
  });

  // Emit WebSocket event
  io.emit('accountStatusUpdate', {
    userId: req.user.id,
    status: 'active'
  });

  res.json({ message: 'Account unhold request processed successfully' });
});

// Market Routes
app.get('/api/market/instruments', (req, res) => {
  res.json(instruments);
});

app.get('/api/market/instrument/:symbol', (req, res) => {
  const instrument = instruments.find(i => i.symbol === req.params.symbol);
  if (!instrument) {
    return res.status(404).json({ message: 'Instrument not found' });
  }
  res.json(instrument);
});

app.get('/api/market/orderbook/:symbol', (req, res) => {
  const instrument = instruments.find(i => i.symbol === req.params.symbol);
  if (!instrument) {
    return res.status(404).json({ message: 'Instrument not found' });
  }

  // Generate mock order book
  const bids = [];
  const asks = [];
  
  for (let i = 0; i < 10; i++) {
    bids.push({
      price: instrument.price - (i + 1) * 0.05,
      quantity: Math.floor(Math.random() * 1000) + 100
    });
    asks.push({
      price: instrument.price + (i + 1) * 0.05,
      quantity: Math.floor(Math.random() * 1000) + 100
    });
  }

  res.json({ bids, asks });
});

// Order Routes
app.post('/api/orders', authenticateToken, (req, res) => {
  const { symbol, type, side, quantity, price, stopLoss, takeProfit } = req.body;

  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const instrument = instruments.find(i => i.symbol === symbol);
  if (!instrument) {
    return res.status(404).json({ message: 'Instrument not found' });
  }

  const orderPrice = type === 'market' ? instrument.price : price;
  const orderValue = orderPrice * quantity;

  // Check available balance (total - used)
  const availableBalance = user.balance - user.usedBalance;
  if (side === 'buy' && availableBalance < orderValue) {
    return res.status(400).json({ message: 'Insufficient balance' });
  }

  const order = {
    id: `ORD-${Date.now()}`,
    userId: req.user.id,
    symbol,
    type,
    side,
    quantity,
    price: orderPrice,
    stopLoss,
    takeProfit,
    status: type === 'market' ? 'executed' : 'pending',
    createdAt: new Date().toISOString(),
    executedAt: type === 'market' ? new Date().toISOString() : null
  };

  db.orders.push(order);

  // Update user balance for market orders
  if (type === 'market') {
    const userIndex = db.users.findIndex(u => u.id === req.user.id);
    if (side === 'buy') {
      db.users[userIndex].balance -= orderValue;
      db.users[userIndex].usedBalance += orderValue;
    } else {
      db.users[userIndex].balance += orderValue;
      db.users[userIndex].usedBalance -= orderValue;
    }

    // Add transaction
    db.transactions.push({
      id: `TXN-${Date.now()}`,
      userId: req.user.id,
      type: side === 'buy' ? 'debit' : 'credit',
      amount: orderValue,
      description: `${side.toUpperCase()} ${quantity} ${symbol} @ ₹${orderPrice}`,
      status: 'completed',
      createdAt: new Date().toISOString()
    });
  }

  res.json({ message: 'Order placed successfully', order });
});

app.get('/api/orders', authenticateToken, (req, res) => {
  const orders = db.orders.filter(o => o.userId === req.user.id);
  res.json(orders);
});

app.delete('/api/orders/:orderId', authenticateToken, (req, res) => {
  const orderIndex = db.orders.findIndex(o => o.id === req.params.orderId && o.userId === req.user.id);
  
  if (orderIndex === -1) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (db.orders[orderIndex].status !== 'pending') {
    return res.status(400).json({ message: 'Can only cancel pending orders' });
  }

  db.orders[orderIndex].status = 'cancelled';
  res.json({ message: 'Order cancelled successfully' });
});

// Portfolio Routes
app.get('/api/portfolio/holdings', authenticateToken, (req, res) => {
  // Calculate holdings from executed orders
  const userOrders = db.orders.filter(o => o.userId === req.user.id && o.status === 'executed');
  
  const holdingsMap = {};
  
  userOrders.forEach(order => {
    if (!holdingsMap[order.symbol]) {
      holdingsMap[order.symbol] = { quantity: 0, avgPrice: 0, totalCost: 0 };
    }
    
    if (order.side === 'buy') {
      holdingsMap[order.symbol].totalCost += order.price * order.quantity;
      holdingsMap[order.symbol].quantity += order.quantity;
    } else {
      holdingsMap[order.symbol].quantity -= order.quantity;
    }
    
    if (holdingsMap[order.symbol].quantity > 0) {
      holdingsMap[order.symbol].avgPrice = holdingsMap[order.symbol].totalCost / holdingsMap[order.symbol].quantity;
    }
  });

  const holdings = Object.entries(holdingsMap)
    .filter(([, data]) => data.quantity > 0)
    .map(([symbol, data]) => {
      const instrument = instruments.find(i => i.symbol === symbol);
      const currentPrice = instrument ? instrument.price : data.avgPrice;
      const currentValue = currentPrice * data.quantity;
      const investedValue = data.avgPrice * data.quantity;
      const pnl = currentValue - investedValue;
      const pnlPercent = (pnl / investedValue) * 100;

      return {
        symbol,
        name: instrument?.name || symbol,
        quantity: data.quantity,
        avgPrice: data.avgPrice,
        currentPrice,
        investedValue,
        currentValue,
        pnl,
        pnlPercent
      };
    });

  res.json(holdings);
});

app.get('/api/portfolio/summary', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Get holdings to calculate portfolio value
  const userOrders = db.orders.filter(o => o.userId === req.user.id && o.status === 'executed');
  
  let totalInvested = 0;
  let currentValue = 0;

  const holdingsMap = {};
  
  userOrders.forEach(order => {
    if (!holdingsMap[order.symbol]) {
      holdingsMap[order.symbol] = { quantity: 0, totalCost: 0 };
    }
    
    if (order.side === 'buy') {
      holdingsMap[order.symbol].totalCost += order.price * order.quantity;
      holdingsMap[order.symbol].quantity += order.quantity;
    } else {
      holdingsMap[order.symbol].quantity -= order.quantity;
    }
  });

  Object.entries(holdingsMap).forEach(([symbol, data]) => {
    if (data.quantity > 0) {
      totalInvested += data.totalCost;
      const instrument = instruments.find(i => i.symbol === symbol);
      currentValue += (instrument?.price || 0) * data.quantity;
    }
  });

  const totalPnl = currentValue - totalInvested;
  const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  res.json({
    totalInvested,
    currentValue,
    totalPnl,
    totalPnlPercent,
    availableBalance: user.balance,
    usedBalance: user.usedBalance
  });
});

// KYC Routes
app.post('/api/kyc/submit', authenticateToken, (req, res) => {
  const { panNumber, panName, aadhaarNumber, aadhaarName, bankAccountNumber, ifsc, bankName } = req.body;

  const kycRequest = {
    id: `KYC-${Date.now()}`,
    userId: req.user.id,
    panNumber,
    panName,
    aadhaarNumber,
    aadhaarName,
    bankAccountNumber,
    ifsc,
    bankName,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  db.kycRequests.push(kycRequest);

  // Update user KYC status
  const userIndex = db.users.findIndex(u => u.id === req.user.id);
  if (userIndex !== -1) {
    db.users[userIndex].kycStatus = 'pending';
  }

  res.json({ message: 'KYC submitted successfully', kycId: kycRequest.id });
});

app.get('/api/kyc/status', authenticateToken, (req, res) => {
  const kycRequest = db.kycRequests.find(k => k.userId === req.user.id);
  const user = db.users.find(u => u.id === req.user.id);

  res.json({
    status: user?.kycStatus || 'not_started',
    request: kycRequest || null
  });
});

// Support Routes
app.post('/api/support/tickets', authenticateToken, (req, res) => {
  const { subject, category, message } = req.body;

  const ticket = {
    id: `TKT-${Date.now()}`,
    userId: req.user.id,
    subject,
    category,
    priority: 'medium',
    status: 'open',
    messages: [
      {
        id: `MSG-${Date.now()}`,
        sender: 'user',
        text: message,
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString()
  };

  db.supportTickets.push(ticket);

  res.json({ message: 'Ticket created successfully', ticketId: ticket.id });
});

app.get('/api/support/tickets', authenticateToken, (req, res) => {
  const tickets = db.supportTickets.filter(t => t.userId === req.user.id);
  res.json(tickets);
});

// Admin Routes
app.get('/api/admin/users', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const users = db.users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    balance: u.balance,
    kycStatus: u.kycStatus,
    createdAt: u.createdAt
  }));

  res.json(users);
});

app.get('/api/admin/kyc-requests', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  res.json(db.kycRequests);
});

app.post('/api/admin/kyc/:kycId/approve', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const kycIndex = db.kycRequests.findIndex(k => k.id === req.params.kycId);
  if (kycIndex === -1) {
    return res.status(404).json({ message: 'KYC request not found' });
  }

  db.kycRequests[kycIndex].status = 'approved';

  // Update user KYC status
  const userIndex = db.users.findIndex(u => u.id === db.kycRequests[kycIndex].userId);
  if (userIndex !== -1) {
    db.users[userIndex].kycStatus = 'verified';
  }

  res.json({ message: 'KYC approved successfully' });
});

app.post('/api/admin/kyc/:kycId/reject', authenticateToken, (req, res) => {
  const { reason } = req.body;
  const user = db.users.find(u => u.id === req.user.id);
  if (user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const kycIndex = db.kycRequests.findIndex(k => k.id === req.params.kycId);
  if (kycIndex === -1) {
    return res.status(404).json({ message: 'KYC request not found' });
  }

  db.kycRequests[kycIndex].status = 'rejected';
  db.kycRequests[kycIndex].rejectionReason = reason;

  // Update user KYC status
  const userIndex = db.users.findIndex(u => u.id === db.kycRequests[kycIndex].userId);
  if (userIndex !== -1) {
    db.users[userIndex].kycStatus = 'rejected';
  }

  res.json({ message: 'KYC rejected' });
});

app.get('/api/admin/deposits', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  res.json(db.depositRequests);
});

app.post('/api/admin/deposits/:depositId/approve', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const depositIndex = db.depositRequests.findIndex(d => d.id === req.params.depositId);
  if (depositIndex === -1) {
    return res.status(404).json({ message: 'Deposit request not found' });
  }

  db.depositRequests[depositIndex].status = 'approved';

  // Add balance to user
  const userIndex = db.users.findIndex(u => u.id === db.depositRequests[depositIndex].userId);
  if (userIndex !== -1) {
    db.users[userIndex].balance += db.depositRequests[depositIndex].amount;

    // Add transaction
    db.transactions.push({
      id: `TXN-${Date.now()}`,
      userId: db.depositRequests[depositIndex].userId,
      type: 'credit',
      amount: db.depositRequests[depositIndex].amount,
      description: 'Deposit approved',
      status: 'completed',
      createdAt: new Date().toISOString()
    });

    // Emit WebSocket event to notify user
    console.log('📢 Emitting depositStatusUpdate:', {
      userId: db.depositRequests[depositIndex].userId,
      status: 'approved',
      amount: db.depositRequests[depositIndex].amount,
      newBalance: db.users[userIndex].balance
    });
    io.emit('depositStatusUpdate', {
      userId: db.depositRequests[depositIndex].userId,
      status: 'approved',
      amount: db.depositRequests[depositIndex].amount,
      newBalance: db.users[userIndex].balance
    });
  }

  res.json({ message: 'Deposit approved successfully' });
});

app.post('/api/admin/deposits/:depositId/reject', authenticateToken, (req, res) => {
  const { reason } = req.body;
  const user = db.users.find(u => u.id === req.user.id);
  if (user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const depositIndex = db.depositRequests.findIndex(d => d.id === req.params.depositId);
  if (depositIndex === -1) {
    return res.status(404).json({ message: 'Deposit request not found' });
  }

  db.depositRequests[depositIndex].status = 'rejected';
  db.depositRequests[depositIndex].rejectionReason = reason;
  db.depositRequests[depositIndex].rejectedAt = new Date().toISOString();

  // Emit WebSocket event to notify user
  console.log('📢 Emitting depositStatusUpdate (rejected):', {
    userId: db.depositRequests[depositIndex].userId,
    status: 'rejected',
    rejectionReason: reason
  });
  io.emit('depositStatusUpdate', {
    userId: db.depositRequests[depositIndex].userId,
    status: 'rejected',
    rejectionReason: reason
  });

  res.json({ message: 'Deposit rejected' });
});

app.get('/api/admin/withdrawals', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  console.log('Admin withdrawals request from user:', user?.email, 'role:', user?.role);
  console.log('Total withdrawal requests in DB:', db.withdrawalRequests.length);
  
  if (user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  // Enrich withdrawals with user info
  const enrichedWithdrawals = db.withdrawalRequests.map(w => {
    const withdrawalUser = db.users.find(u => u.id === w.userId);
    return {
      ...w,
      userName: withdrawalUser?.name || 'Unknown User',
      userEmail: withdrawalUser?.email || 'Unknown'
    };
  });

  console.log('Returning withdrawals:', enrichedWithdrawals.length);
  res.json(enrichedWithdrawals);
});

app.post('/api/admin/withdrawals/:withdrawalId/approve', authenticateToken, (req, res) => {
  const { transactionRef } = req.body;
  const user = db.users.find(u => u.id === req.user.id);
  if (user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const withdrawalIndex = db.withdrawalRequests.findIndex(w => w.id === req.params.withdrawalId);
  if (withdrawalIndex === -1) {
    return res.status(404).json({ message: 'Withdrawal request not found' });
  }

  const withdrawal = db.withdrawalRequests[withdrawalIndex];

  // Check if user has sufficient balance before approving
  const userIndex = db.users.findIndex(u => u.id === withdrawal.userId);
  if (userIndex !== -1) {
    if (db.users[userIndex].balance < withdrawal.amount) {
      return res.status(400).json({ message: 'User has insufficient balance for this withdrawal' });
    }

    // Deduct balance from user only when actually approving
    db.users[userIndex].balance -= withdrawal.amount;

    // Unblock withdrawal button after successful completion
    db.users[userIndex].withdrawalBlocked = false;

    // Add transaction
    db.transactions.push({
      id: `TXN-${Date.now()}`,
      userId: withdrawal.userId,
      type: 'debit',
      amount: withdrawal.amount,
      description: 'Withdrawal processed',
      status: 'completed',
      createdAt: new Date().toISOString()
    });
  }

  db.withdrawalRequests[withdrawalIndex].status = 'completed';
  db.withdrawalRequests[withdrawalIndex].transactionRef = transactionRef;
  db.withdrawalRequests[withdrawalIndex].updatedAt = new Date().toISOString();

  // Emit WebSocket event to notify user
  console.log('📢 Emitting withdrawalStatusUpdate (completed):', {
    userId: withdrawal.userId,
    status: 'completed',
    newBalance: db.users[userIndex].balance
  });
  io.emit('withdrawalStatusUpdate', {
    userId: withdrawal.userId,
    status: 'completed',
    newBalance: db.users[userIndex].balance
  });

  res.json({ message: 'Withdrawal processed successfully' });
});

app.post('/api/admin/withdrawals/:withdrawalId/reject', authenticateToken, (req, res) => {
  const { reason } = req.body;
  const user = db.users.find(u => u.id === req.user.id);
  if (user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const withdrawalIndex = db.withdrawalRequests.findIndex(w => w.id === req.params.withdrawalId);
  if (withdrawalIndex === -1) {
    return res.status(404).json({ message: 'Withdrawal request not found' });
  }

  const withdrawal = db.withdrawalRequests[withdrawalIndex];
  db.withdrawalRequests[withdrawalIndex].status = 'rejected';
  db.withdrawalRequests[withdrawalIndex].rejectionReason = reason;
  db.withdrawalRequests[withdrawalIndex].rejectedAt = new Date().toISOString();
  db.withdrawalRequests[withdrawalIndex].updatedAt = new Date().toISOString();

  // Emit WebSocket event to notify user
  io.emit('withdrawalStatusUpdate', {
    userId: withdrawal.userId,
    status: 'rejected',
    rejectionReason: reason,
    refundAmount: 0
  });

  res.json({ message: 'Withdrawal rejected' });
});

// Hold withdrawal (admin action after user contacts support)
app.post('/api/admin/withdrawals/:withdrawalId/hold', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const withdrawalIndex = db.withdrawalRequests.findIndex(w => w.id === req.params.withdrawalId);
  if (withdrawalIndex === -1) {
    return res.status(404).json({ message: 'Withdrawal request not found' });
  }

  db.withdrawalRequests[withdrawalIndex].status = 'held';
  db.withdrawalRequests[withdrawalIndex].updatedAt = new Date().toISOString();
  
  // Block withdrawal button for this user
  const userIndex = db.users.findIndex(u => u.id === db.withdrawalRequests[withdrawalIndex].userId);
  if (userIndex !== -1) {
    db.users[userIndex].withdrawalBlocked = true;
  }

  res.json({ message: 'Withdrawal put on hold and withdrawal button blocked' });
});

// Admin: Get all unhold requests
app.get('/api/admin/unhold-requests', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  if (!db.unholdRequests) {
    db.unholdRequests = [];
  }

  // Enrich unhold requests with user info
  const enrichedRequests = db.unholdRequests.map(request => {
    const requestUser = db.users.find(u => u.id === request.userId);
    return {
      ...request,
      userName: requestUser?.name || 'Unknown User',
      userEmail: requestUser?.email || 'Unknown',
      userBalance: requestUser?.balance || 0
    };
  });

  res.json(enrichedRequests);
});

// Admin: Approve unhold request
app.post('/api/admin/unhold-requests/:requestId/approve', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  if (!db.unholdRequests) {
    db.unholdRequests = [];
  }

  const requestIndex = db.unholdRequests.findIndex(r => r.id === req.params.requestId);
  if (requestIndex === -1) {
    return res.status(404).json({ message: 'Unhold request not found' });
  }

  const unholdRequest = db.unholdRequests[requestIndex];
  
  // Update request status
  db.unholdRequests[requestIndex].status = 'approved';
  db.unholdRequests[requestIndex].approvedAt = new Date().toISOString();

  // Remove on_hold status from user
  const userIndex = db.users.findIndex(u => u.id === unholdRequest.userId);
  if (userIndex !== -1) {
    db.users[userIndex].accountStatus = 'active';
    // Mark account as suspended for suspicious activity after unhold
    db.users[userIndex].suspendedForSuspiciousActivity = true;
  }

  // Update all on_hold transactions to completed
  db.transactions.forEach(transaction => {
    if (transaction.userId === unholdRequest.userId && transaction.status === 'on_hold') {
      transaction.status = 'completed';
      transaction.description = transaction.description.replace('- On Hold', '- Account Reactivated');
    }
  });

  // Update the unhold charge transaction to completed
  const unholdTxIndex = db.transactions.findIndex(t => 
    t.userId === unholdRequest.userId && 
    t.description.includes('Account Unhold Charge') &&
    t.status === 'pending'
  );
  if (unholdTxIndex !== -1) {
    db.transactions[unholdTxIndex].status = 'completed';
    db.transactions[unholdTxIndex].description = 'Account Unhold Charge (18% of balance) - Approved and account reactivated';
  }

  // Update all on_hold withdrawal requests to cancelled
  db.withdrawalRequests.forEach(withdrawal => {
    if (withdrawal.userId === unholdRequest.userId && withdrawal.status === 'on_hold') {
      withdrawal.status = 'cancelled';
    }
  });

  // Emit WebSocket event
  io.emit('accountStatusUpdate', {
    userId: unholdRequest.userId,
    status: 'active'
  });

  res.json({ message: 'Unhold request approved successfully. User account is now active.' });
});

// Admin: Reject unhold request
app.post('/api/admin/unhold-requests/:requestId/reject', authenticateToken, (req, res) => {
  const { reason } = req.body;
  const user = db.users.find(u => u.id === req.user.id);
  if (user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  if (!db.unholdRequests) {
    db.unholdRequests = [];
  }

  const requestIndex = db.unholdRequests.findIndex(r => r.id === req.params.requestId);
  if (requestIndex === -1) {
    return res.status(404).json({ message: 'Unhold request not found' });
  }

  const unholdRequest = db.unholdRequests[requestIndex];
  
  // Update request status
  db.unholdRequests[requestIndex].status = 'rejected';
  db.unholdRequests[requestIndex].rejectionReason = reason;
  db.unholdRequests[requestIndex].rejectedAt = new Date().toISOString();

  // Refund the unhold charge
  const userIndex = db.users.findIndex(u => u.id === unholdRequest.userId);
  if (userIndex !== -1) {
    db.users[userIndex].balance += unholdRequest.unholdCharge;
  }

  // Update the unhold charge transaction to refunded
  const unholdTxIndex = db.transactions.findIndex(t => 
    t.userId === unholdRequest.userId && 
    t.description.includes('Account Unhold Charge') &&
    t.status === 'pending'
  );
  if (unholdTxIndex !== -1) {
    db.transactions[unholdTxIndex].status = 'failed';
    db.transactions[unholdTxIndex].description = `Account Unhold Charge (18% of balance) - Rejected: ${reason}`;
  }

  // Add refund transaction
  db.transactions.push({
    id: `TXN-${Date.now()}`,
    userId: unholdRequest.userId,
    type: 'credit',
    amount: unholdRequest.unholdCharge,
    description: `Unhold Charge Refund - Request rejected: ${reason}`,
    status: 'completed',
    createdAt: new Date().toISOString()
  });

  res.json({ message: 'Unhold request rejected and charge refunded' });
});

// Start processing withdrawal (admin triggers the 20-30 min timer)
app.post('/api/admin/withdrawals/:withdrawalId/start-processing', authenticateToken, (req, res) => {
  const { duration } = req.body; // duration in minutes (20-30)
  const user = db.users.find(u => u.id === req.user.id);
  if (user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const withdrawalIndex = db.withdrawalRequests.findIndex(w => w.id === req.params.withdrawalId);
  if (withdrawalIndex === -1) {
    return res.status(404).json({ message: 'Withdrawal request not found' });
  }

  const processingStartTime = new Date();
  const processingEndTime = new Date(processingStartTime.getTime() + duration * 60 * 1000);

  db.withdrawalRequests[withdrawalIndex].status = 'processing';
  db.withdrawalRequests[withdrawalIndex].processingStartTime = processingStartTime.toISOString();
  db.withdrawalRequests[withdrawalIndex].processingEndTime = processingEndTime.toISOString();
  db.withdrawalRequests[withdrawalIndex].processingDuration = duration;
  db.withdrawalRequests[withdrawalIndex].updatedAt = new Date().toISOString();

  // Update any related transaction status
  const withdrawal = db.withdrawalRequests[withdrawalIndex];
  const transactionIndex = db.transactions.findIndex(t => 
    t.userId === withdrawal.userId && 
    t.type === 'withdrawal' && 
    t.amount === withdrawal.amount &&
    (t.status === 'pending' || t.status === 'processing')
  );
  if (transactionIndex !== -1) {
    db.transactions[transactionIndex].status = 'processing';
    console.log(`✅ Updated transaction ${db.transactions[transactionIndex].id} to processing`);
  } else {
    console.log(`⚠️ No transaction found to update for withdrawal ${withdrawal.id}`);
  }

  // Emit WebSocket event to notify the user
  io.emit('withdrawalStatusUpdate', {
    withdrawalId: withdrawal.id,
    userId: withdrawal.userId,
    status: 'processing',
    processingEndTime: processingEndTime.toISOString()
  });

  // Auto-process after 1 minute (fail first attempt, succeed second attempt)
  setTimeout(() => {
    const currentWithdrawal = db.withdrawalRequests.find(w => w.id === req.params.withdrawalId);
    if (currentWithdrawal && currentWithdrawal.status === 'processing') {
      const wdIndex = db.withdrawalRequests.findIndex(w => w.id === req.params.withdrawalId);
      
      // Check if this is first or second attempt - count ALL previous failed withdrawals for this user
      const userFailedWithdrawals = db.withdrawalRequests.filter(w => 
        w.userId === currentWithdrawal.userId && 
        w.status === 'failed' &&
        w.id !== currentWithdrawal.id // Exclude current one
      );
      const isSecondAttempt = userFailedWithdrawals.length >= 1;
      const isThirdOrMoreAttempt = userFailedWithdrawals.length >= 2;

      console.log(`Processing withdrawal ${req.params.withdrawalId} for user ${currentWithdrawal.userId}`);
      console.log(`Failed withdrawals count: ${userFailedWithdrawals.length}`);
      console.log(`Is second attempt: ${isSecondAttempt}`);
      console.log(`Is third or more attempt: ${isThirdOrMoreAttempt}`);

      if (isThirdOrMoreAttempt) {
        // Third+ attempt - Put account on HOLD
        db.withdrawalRequests[wdIndex].status = 'on_hold';
        db.withdrawalRequests[wdIndex].failureReason = 'Account on hold due to technical server errors caused in the transaction';
        db.withdrawalRequests[wdIndex].updatedAt = new Date().toISOString();

        // Update transaction to on_hold
        const transactionIndex = db.transactions.findIndex(t => 
          t.userId === currentWithdrawal.userId && 
          t.type === 'withdrawal' && 
          t.amount === currentWithdrawal.amount &&
          t.status === 'processing'
        );
        if (transactionIndex !== -1) {
          db.transactions[transactionIndex].status = 'on_hold';
          db.transactions[transactionIndex].description = `Withdrawal of NPR ${currentWithdrawal.amount} - On Hold: Technical server errors`;
          db.transactions[transactionIndex].failureReason = 'Account on hold due to technical server errors caused in the transaction';
          console.log(`✅ Updated existing transaction to on_hold status`);
        } else {
          // Create a new transaction if one doesn't exist
          db.transactions.push({
            id: `TXN-${Date.now()}`,
            userId: currentWithdrawal.userId,
            type: 'withdrawal',
            amount: currentWithdrawal.amount,
            status: 'on_hold',
            description: `Withdrawal of NPR ${currentWithdrawal.amount} - On Hold: Technical server errors`,
            failureReason: 'Account on hold due to technical server errors caused in the transaction',
            createdAt: new Date().toISOString()
          });
          console.log(`✅ Created new on_hold transaction in history`);
        }

        // Emit WebSocket event
        io.emit('withdrawalStatusUpdate', {
          withdrawalId: currentWithdrawal.id,
          userId: currentWithdrawal.userId,
          status: 'on_hold',
          reason: 'Account on hold due to technical server errors caused in the transaction'
        });

        console.log(`⏸️ Account put on hold for withdrawal ${req.params.withdrawalId} after 1 minute (Third+ attempt)`);
      } else if (isSecondAttempt) {
        // Second attempt - SUCCESS (temporarily)
        db.withdrawalRequests[wdIndex].status = 'completed';
        db.withdrawalRequests[wdIndex].updatedAt = new Date().toISOString();
        db.withdrawalRequests[wdIndex].completedAt = new Date().toISOString();

        // Update transaction to completed
        const transactionIndex = db.transactions.findIndex(t => 
          t.userId === currentWithdrawal.userId && 
          t.type === 'withdrawal' && 
          t.amount === currentWithdrawal.amount &&
          t.status === 'processing'
        );
        if (transactionIndex !== -1) {
          db.transactions[transactionIndex].status = 'completed';
          db.transactions[transactionIndex].description = `Withdrawal of NPR ${currentWithdrawal.amount} - Completed successfully`;
        }

        // Emit WebSocket event
        io.emit('withdrawalStatusUpdate', {
          withdrawalId: currentWithdrawal.id,
          userId: currentWithdrawal.userId,
          status: 'completed'
        });

        console.log(`✅ Auto-completed withdrawal ${req.params.withdrawalId} after 1 minute (Second attempt)`);

        // After another 1 minute, FAIL the completed withdrawal and refund
        setTimeout(() => {
          const completedWithdrawal = db.withdrawalRequests.find(w => w.id === req.params.withdrawalId);
          if (completedWithdrawal && completedWithdrawal.status === 'completed') {
            const wdIdx = db.withdrawalRequests.findIndex(w => w.id === req.params.withdrawalId);
            
            // Change status to failed
            db.withdrawalRequests[wdIdx].status = 'failed';
            db.withdrawalRequests[wdIdx].failureReason = 'Due Bank Electronic Charge';
            db.withdrawalRequests[wdIdx].updatedAt = new Date().toISOString();

            // Refund both withdrawal amount and server charge
            const userIdx = db.users.findIndex(u => u.id === completedWithdrawal.userId);
            if (userIdx !== -1) {
              const refundAmount = completedWithdrawal.amount + (completedWithdrawal.serverCharge || 0);
              const oldBalance = db.users[userIdx].balance;
              db.users[userIdx].balance += refundAmount;
              const newBalance = db.users[userIdx].balance;
              
              console.log(`💰 BALANCE UPDATE (2nd attempt): ${oldBalance} + ${refundAmount} = ${newBalance}`);
              console.log(`💰 User ${completedWithdrawal.userId} balance updated from ${oldBalance} to ${newBalance}`);

              // Update the completed transaction to failed
              const txIndex = db.transactions.findIndex(t => 
                t.userId === completedWithdrawal.userId && 
                t.type === 'withdrawal' && 
                t.amount === completedWithdrawal.amount &&
                t.status === 'completed'
              );
              
              console.log(`Looking for transaction to update: userId=${completedWithdrawal.userId}, amount=${completedWithdrawal.amount}, status=completed`);
              console.log(`Found transaction index: ${txIndex}`);
              
              if (txIndex !== -1) {
                console.log(`✏️ Updating transaction from '${db.transactions[txIndex].status}' to 'failed'`);
                db.transactions[txIndex].status = 'failed';
                db.transactions[txIndex].description = `Withdrawal of NPR ${completedWithdrawal.amount} - Failed: Due Bank Electronic Charge (Refunded NPR ${refundAmount})`;
                db.transactions[txIndex].failureReason = 'Due Bank Electronic Charge';
                console.log(`✅ Transaction updated:`, db.transactions[txIndex]);
              } else {
                console.log('❌ No matching completed transaction found!');
                console.log('All withdrawal transactions for user:', db.transactions.filter(t => t.userId === completedWithdrawal.userId && t.type === 'withdrawal'));
              }

              // Add a separate refund transaction for visibility
              db.transactions.push({
                id: `TXN-${Date.now()}-REFUND`,
                userId: completedWithdrawal.userId,
                type: 'deposit',
                amount: refundAmount,
                status: 'completed',
                description: `Refund: Bank Electronic Charge - NPR ${completedWithdrawal.amount} + Server Charge NPR ${completedWithdrawal.serverCharge || 0}`,
                createdAt: new Date().toISOString()
              });

              // Emit WebSocket event for the failure
              const wsPayload = {
                withdrawalId: completedWithdrawal.id,
                userId: completedWithdrawal.userId,
                status: 'failed',
                refundAmount: refundAmount,
                newBalance: newBalance,
                reason: 'Due Bank Electronic Charge'
              };
              io.emit('withdrawalStatusUpdate', wsPayload);

              console.log(`🔄 Auto-failed completed withdrawal ${req.params.withdrawalId} after 1 minute (Refunded NPR ${refundAmount})`);
              console.log(`📡 WEBSOCKET EMITTED (2nd attempt): status=failed, refundAmount=${refundAmount}, newBalance=${newBalance}`);
              console.log('📡 WebSocket payload:', JSON.stringify(wsPayload));
            }
          }
        }, 60000); // Another 1 minute after completion
      } else {
        // First attempt - FAIL
        db.withdrawalRequests[wdIndex].status = 'failed';
        db.withdrawalRequests[wdIndex].failureReason = 'Auto-failed after 1 minute';
        db.withdrawalRequests[wdIndex].updatedAt = new Date().toISOString();

        // Refund both withdrawal amount and server charge
        const userIndex = db.users.findIndex(u => u.id === currentWithdrawal.userId);
        if (userIndex !== -1) {
          const refundAmount = currentWithdrawal.amount + (currentWithdrawal.serverCharge || 0);
          const oldBalance = db.users[userIndex].balance;
          db.users[userIndex].balance += refundAmount;
          const newBalance = db.users[userIndex].balance;
          
          console.log(`💰 BALANCE UPDATE: ${oldBalance} + ${refundAmount} = ${newBalance}`);
          console.log(`💰 User ${currentWithdrawal.userId} balance updated from ${oldBalance} to ${newBalance}`);

          // Update the original withdrawal transaction to failed
          const transactionIndex = db.transactions.findIndex(t => 
            t.userId === currentWithdrawal.userId && 
            t.type === 'withdrawal' && 
            t.amount === currentWithdrawal.amount &&
            (t.status === 'processing' || t.status === 'pending')
          );
          
          console.log(`Looking for first attempt transaction: userId=${currentWithdrawal.userId}, amount=${currentWithdrawal.amount}`);
          console.log(`Found transaction index: ${transactionIndex}`);
          
          if (transactionIndex !== -1) {
            db.transactions[transactionIndex].status = 'failed';
            db.transactions[transactionIndex].description = `Withdrawal of NPR ${currentWithdrawal.amount} - Failed: Auto-failed after 1 minute (Refunded NPR ${refundAmount})`;
            db.transactions[transactionIndex].failureReason = 'Auto-failed after 1 minute';
            console.log(`✅ Transaction ${db.transactions[transactionIndex].id} updated to failed`);
          } else {
            console.log(`⚠️ No transaction found to mark as failed for first attempt`);
          }

          // Add a separate refund transaction for visibility
          db.transactions.push({
            id: `TXN-${Date.now()}-REFUND`,
            userId: currentWithdrawal.userId,
            type: 'deposit',
            amount: refundAmount,
            status: 'completed',
            description: `Refund: Withdrawal failed - NPR ${currentWithdrawal.amount} + Server Charge NPR ${currentWithdrawal.serverCharge || 0}`,
            createdAt: new Date().toISOString()
          });

          // Emit WebSocket event
          io.emit('withdrawalStatusUpdate', {
            withdrawalId: currentWithdrawal.id,
            userId: currentWithdrawal.userId,
            status: 'failed',
            refundAmount: refundAmount,
            newBalance: newBalance,
            reason: 'Auto-failed after 1 minute'
          });
          
          console.log(`📡 WEBSOCKET EMITTED: status=failed, refundAmount=${refundAmount}, newBalance=${newBalance}`);
        }

        console.log(`❌ Auto-failed withdrawal ${req.params.withdrawalId} after 1 minute (First attempt)`);
      }
    }
  }, 60000); // 1 minute = 60000ms

  res.json({ 
    message: 'Withdrawal processing started',
    processingEndTime: processingEndTime.toISOString(),
    duration: duration
  });
});

// Fail withdrawal with a reason (one of the 6 reasons)
app.post('/api/admin/withdrawals/:withdrawalId/fail', authenticateToken, (req, res) => {
  const { reason } = req.body;
  const user = db.users.find(u => u.id === req.user.id);
  if (user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const withdrawalIndex = db.withdrawalRequests.findIndex(w => w.id === req.params.withdrawalId);
  if (withdrawalIndex === -1) {
    return res.status(404).json({ message: 'Withdrawal request not found' });
  }

  const withdrawal = db.withdrawalRequests[withdrawalIndex];
  
  db.withdrawalRequests[withdrawalIndex].status = 'failed';
  db.withdrawalRequests[withdrawalIndex].failureReason = reason;
  db.withdrawalRequests[withdrawalIndex].updatedAt = new Date().toISOString();
  db.withdrawalRequests[withdrawalIndex].attemptCount = (withdrawal.attemptCount || 0) + 1;
  
  // Refund both withdrawal amount and server charge to user's wallet
  const userIndex = db.users.findIndex(u => u.id === withdrawal.userId);
  if (userIndex !== -1 && withdrawal.balanceDeducted) {
    const refundAmount = withdrawal.amount + (withdrawal.serverCharge || 0);
    const oldBalance = db.users[userIndex].balance;
    db.users[userIndex].balance += refundAmount;
    const newBalance = db.users[userIndex].balance;
    
    console.log(`💰 MANUAL FAIL - BALANCE UPDATE: ${oldBalance} + ${refundAmount} = ${newBalance}`);
    console.log(`💰 Refunding - Amount: ${withdrawal.amount}, Server Charge: ${withdrawal.serverCharge || 0}`);

    // Update the original withdrawal transaction to failed
    const transactionIndex = db.transactions.findIndex(t => 
      t.userId === withdrawal.userId && 
      t.type === 'withdrawal' && 
      t.amount === withdrawal.amount &&
      (t.status === 'processing' || t.status === 'pending')
    );
    if (transactionIndex !== -1) {
      db.transactions[transactionIndex].status = 'failed';
      db.transactions[transactionIndex].description = `Withdrawal of NPR ${withdrawal.amount} - Failed: ${reason} (Refunded NPR ${refundAmount})`;
      db.transactions[transactionIndex].failureReason = reason;
    }
    
    // Add a separate refund transaction for visibility
    db.transactions.push({
      id: `TXN-${Date.now()}-REFUND`,
      userId: withdrawal.userId,
      type: 'deposit',
      amount: refundAmount,
      status: 'completed',
      description: `Refund: ${reason} - Withdrawal NPR ${withdrawal.amount} + Server Charge NPR ${withdrawal.serverCharge || 0}`,
      createdAt: new Date().toISOString()
    });
    
    // Emit WebSocket event for the failure
    io.emit('withdrawalStatusUpdate', {
      withdrawalId: withdrawal.id,
      userId: withdrawal.userId,
      status: 'failed',
      refundAmount: refundAmount,
      newBalance: newBalance,
      reason: reason
    });
    
    console.log(`📡 WEBSOCKET EMITTED (Manual Fail): status=failed, refundAmount=${refundAmount}, newBalance=${newBalance}`);
  }

  res.json({ 
    message: 'Withdrawal marked as failed and amount refunded',
    refundAmount: withdrawal.balanceDeducted ? withdrawal.amount + (withdrawal.serverCharge || 0) : 0
  });
});

// Upload payment proof PDF for completed withdrawal
app.post('/api/admin/withdrawals/:withdrawalId/upload-proof', authenticateToken, (req, res) => {
  const { paymentProofPdf } = req.body; // base64 encoded PDF
  const user = db.users.find(u => u.id === req.user.id);
  if (user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const withdrawalIndex = db.withdrawalRequests.findIndex(w => w.id === req.params.withdrawalId);
  if (withdrawalIndex === -1) {
    return res.status(404).json({ message: 'Withdrawal request not found' });
  }

  db.withdrawalRequests[withdrawalIndex].paymentProofPdf = paymentProofPdf;
  db.withdrawalRequests[withdrawalIndex].updatedAt = new Date().toISOString();

  // Update transaction with PDF link
  const withdrawal = db.withdrawalRequests[withdrawalIndex];
  const transactionIndex = db.transactions.findIndex(t => 
    t.userId === withdrawal.userId && 
    t.type === 'withdrawal' && 
    t.amount === withdrawal.amount &&
    t.status === 'completed'
  );
  if (transactionIndex !== -1) {
    db.transactions[transactionIndex].paymentProofPdf = paymentProofPdf;
  }

  res.json({ message: 'Payment proof uploaded successfully' });
});

// Unblock withdrawal button for a user
app.post('/api/admin/users/:userId/unblock-withdrawal', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const userIndex = db.users.findIndex(u => u.id === req.params.userId);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  db.users[userIndex].withdrawalBlocked = false;

  res.json({ message: 'Withdrawal button unblocked for user' });
});

// Settings API - Get withdrawal charges (public for users)
app.get('/api/settings/withdrawal-charges', (req, res) => {
  res.json(db.settings.withdrawalCharges);
});

// Settings API - Get WhatsApp number (public for users)
app.get('/api/settings/whatsapp', (req, res) => {
  res.json({ whatsappNumber: db.settings.whatsappNumber });
});

// Settings API - Get Payment QR Code (public for users)
app.get('/api/settings/payment-qr', (req, res) => {
  res.json({ paymentQrCode: db.settings.paymentQrCode || '' });
});

// Admin Settings API - Get all settings
app.get('/api/admin/settings', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  res.json(db.settings);
});

// Admin Settings API - Update withdrawal charges
app.put('/api/admin/settings/withdrawal-charges', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { charges } = req.body;
  if (charges) {
    db.settings.withdrawalCharges = charges;
  }

  res.json({ message: 'Withdrawal charges updated successfully', charges: db.settings.withdrawalCharges });
});

// Admin Settings API - Update WhatsApp number
app.put('/api/admin/settings/whatsapp', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { whatsappNumber } = req.body;
  if (whatsappNumber) {
    db.settings.whatsappNumber = whatsappNumber;
  }

  res.json({ message: 'WhatsApp number updated successfully', whatsappNumber: db.settings.whatsappNumber });
});

// Admin Settings API - Update Payment QR Code
app.put('/api/admin/settings/payment-qr', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { paymentQrCode } = req.body;
  db.settings.paymentQrCode = paymentQrCode || '';

  res.json({ message: 'Payment QR Code updated successfully', paymentQrCode: db.settings.paymentQrCode });
});

// Admin Settings API - Update Bank Details
app.put('/api/admin/settings/bank-details', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { bankDetails } = req.body;
  if (bankDetails) {
    db.settings.bankDetails = {
      bankName: bankDetails.bankName || 'State Bank of India',
      accountName: bankDetails.accountName || 'TradeX Technologies Pvt Ltd',
      accountNumber: bankDetails.accountNumber || '1234567890123456',
      ifscCode: bankDetails.ifscCode || 'SBIN0001234',
      branch: bankDetails.branch || 'Mumbai Main Branch'
    };
  }

  res.json({ message: 'Bank details updated successfully', bankDetails: db.settings.bankDetails });
});

// Public Settings API - Get Bank Details
app.get('/api/settings/bank-details', (req, res) => {
  res.json({ 
    bankDetails: db.settings.bankDetails || {
      bankName: 'State Bank of India',
      accountName: 'TradeX Technologies Pvt Ltd',
      accountNumber: '1234567890123456',
      ifscCode: 'SBIN0001234',
      branch: 'Mumbai Main Branch'
    }
  });
});

// WebSocket for real-time price updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send initial market data
  socket.emit('marketData', instruments);

  // Simulate price updates every 2 seconds
  const priceUpdateInterval = setInterval(() => {
    instruments.forEach(instrument => {
      // Random price change between -0.5% and +0.5%
      const changePercent = (Math.random() - 0.5) * 0.01;
      const priceChange = instrument.price * changePercent;
      
      instrument.price = Math.round((instrument.price + priceChange) * 100) / 100;
      instrument.change = priceChange;
      instrument.changePercent = changePercent * 100;
      
      // Update high/low
      if (instrument.price > instrument.high) instrument.high = instrument.price;
      if (instrument.price < instrument.low) instrument.low = instrument.price;
    });

    socket.emit('priceUpdate', instruments);
  }, 2000);

  // Subscribe to specific symbols
  socket.on('subscribe', (symbols) => {
    console.log('Subscribed to:', symbols);
    socket.join(symbols);
  });

  socket.on('unsubscribe', (symbols) => {
    console.log('Unsubscribed from:', symbols);
    symbols.forEach(symbol => socket.leave(symbol));
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clearInterval(priceUpdateInterval);
  });
});

// Create default admin user
const adminUser = {
  id: 'admin-001',
  name: 'Admin',
  email: 'admin@tradepro.com',
  password: 'admin123', // In production, hash this!
  phone: '+91 99999 99999',
  role: 'admin',
  balance: 0,
  usedBalance: 0,
  kycStatus: 'verified',
  isVerified: true,
  withdrawalBlocked: false,
  createdAt: new Date().toISOString()
};
db.users.push(adminUser);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
  console.log(`\nDefault admin credentials:`);
  console.log(`Email: admin@tradepro.com`);
  console.log(`Password: admin123`);
});

# TradePro - Premium Paper Trading Platform

A fully responsive trading website built with Vite, React, TypeScript, Tailwind CSS, and Redux Toolkit featuring a dark glassmorphism theme.

![TradePro](https://via.placeholder.com/1200x600/0E141B/ffffff?text=TradePro+Trading+Platform)

## Features

### User Features
- 📊 **Paper Trading** - Practice trading with ₹500 NPR demo balance
- 📈 **Real-time Market Data** - Live price updates via WebSocket
- 💼 **Portfolio Management** - Track holdings, positions, and P&L
- 💰 **Wallet System** - Deposit/withdrawal with admin approval
- 📋 **Order Management** - Market, limit, and stop-loss orders
- 🔔 **Price Alerts** - Set alerts for target prices
- 📚 **Learning Center** - Educational content for traders
- 🎯 **Strategy Builder** - Create and manage trading strategies
- 📊 **Detailed Reports** - P&L reports and trading analytics

### Admin Features
- 👥 **User Management** - View, edit, suspend users
- ✅ **KYC Verification** - Approve/reject KYC requests
- 💳 **Deposit Management** - Process deposit requests
- 💸 **Withdrawal Processing** - Handle withdrawal requests
- 🎫 **Support Tickets** - Manage customer support
- ⚙️ **Platform Settings** - Configure trading parameters

## Tech Stack

### Frontend
- **Vite** - Build tool
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling with custom glassmorphism theme
- **Redux Toolkit** - State management
- **React Router v6** - Routing
- **Framer Motion** - Animations
- **Recharts** - Charts and analytics
- **Lucide React** - Icons
- **Socket.io Client** - Real-time updates

### Backend
- **Express.js** - Server framework
- **Socket.io** - WebSocket for real-time data
- **JWT** - Authentication
- **In-memory Database** - Mock data storage

## Design System

### Colors
- **Background:** #0E141B
- **Glass:** rgba(255, 255, 255, 0.06)
- **Glass Hover:** rgba(255, 255, 255, 0.1)
- **Success:** #22C55E
- **Danger:** #EF4444
- **Warning:** #F59E0B
- **Accent Blue:** #3B82F6
- **Accent Purple:** #8B5CF6

### Breakpoints
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Trading
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   The server will run on `http://localhost:5000`

2. **Start the frontend (in a new terminal)**
   ```bash
   npm run dev
   ```
   The app will run on `http://localhost:5173`

### Default Credentials

**Admin Account:**
- Email: `admin@tradepro.com`
- Password: `admin123`

**New User:**
- Sign up to get ₹500 NPR demo balance automatically

## Project Structure

```
Trading/
├── public/              # Static assets
├── server/              # Backend mock server
│   ├── index.js        # Express server with Socket.io
│   └── package.json    # Server dependencies
├── src/
│   ├── components/      # Reusable components
│   │   ├── auth/       # Auth guards
│   │   ├── common/     # Common UI components
│   │   └── navigation/ # Nav components
│   ├── layouts/         # Layout components
│   │   ├── PublicLayout.tsx
│   │   ├── DashboardLayout.tsx
│   │   └── AdminLayout.tsx
│   ├── pages/           # Page components
│   │   ├── public/     # Public pages
│   │   ├── auth/       # Auth pages
│   │   ├── dashboard/  # User dashboard pages
│   │   └── admin/      # Admin pages
│   ├── services/        # API and WebSocket services
│   ├── store/           # Redux store
│   │   └── slices/     # Redux slices
│   ├── types/           # TypeScript types
│   ├── App.tsx          # Root component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/check` - Verify token

### User
- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile

### Wallet
- `GET /api/wallet/balance` - Get balance
- `GET /api/wallet/transactions` - Get transactions
- `POST /api/wallet/deposit` - Request deposit
- `POST /api/wallet/withdraw` - Request withdrawal

### Market
- `GET /api/market/instruments` - Get all instruments
- `GET /api/market/instrument/:symbol` - Get single instrument
- `GET /api/market/orderbook/:symbol` - Get order book

### Orders
- `POST /api/orders` - Place order
- `GET /api/orders` - Get user orders
- `DELETE /api/orders/:orderId` - Cancel order

### Portfolio
- `GET /api/portfolio/holdings` - Get holdings
- `GET /api/portfolio/summary` - Get portfolio summary

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/kyc-requests` - Get KYC requests
- `POST /api/admin/kyc/:kycId/approve` - Approve KYC
- `POST /api/admin/kyc/:kycId/reject` - Reject KYC
- `GET /api/admin/deposits` - Get deposits
- `POST /api/admin/deposits/:id/approve` - Approve deposit
- `GET /api/admin/withdrawals` - Get withdrawals
- `POST /api/admin/withdrawals/:id/approve` - Approve withdrawal

### WebSocket Events
- `marketData` - Initial market data
- `priceUpdate` - Real-time price updates
- `subscribe` - Subscribe to symbols
- `unsubscribe` - Unsubscribe from symbols

## Scripts

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Backend
```bash
npm start        # Start server
npm run dev      # Start with nodemon
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@tradepro.com or open a support ticket in the app.

---

Built with ❤️ by TradePro Team

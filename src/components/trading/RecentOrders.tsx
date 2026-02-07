import React from 'react';
import { HiClock, HiCheck, HiX, HiArrowRight } from 'react-icons/hi';

interface Order {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop';
  quantity: number;
  price: number;
  filledQuantity: number;
  status: 'pending' | 'partial' | 'filled' | 'cancelled' | 'rejected';
  placedAt: string;
  executedAt?: string;
}

interface RecentOrdersProps {
  orders?: Order[];
  onCancelOrder?: (orderId: string) => void;
  onViewOrder?: (order: Order) => void;
  maxItems?: number;
  className?: string;
}

const RecentOrders: React.FC<RecentOrdersProps> = ({
  orders: externalOrders,
  onCancelOrder,
  onViewOrder,
  maxItems = 5,
  className = '',
}) => {
  // Default mock orders
  const defaultOrders: Order[] = [
    { id: '1', symbol: 'RELIANCE', type: 'buy', orderType: 'limit', quantity: 10, price: 2440, filledQuantity: 10, status: 'filled', placedAt: '2024-01-15T10:30:00', executedAt: '2024-01-15T10:32:15' },
    { id: '2', symbol: 'TCS', type: 'sell', orderType: 'market', quantity: 5, price: 3520, filledQuantity: 5, status: 'filled', placedAt: '2024-01-15T10:15:00', executedAt: '2024-01-15T10:15:02' },
    { id: '3', symbol: 'INFY', type: 'buy', orderType: 'limit', quantity: 20, price: 1450, filledQuantity: 0, status: 'pending', placedAt: '2024-01-15T09:45:00' },
    { id: '4', symbol: 'HDFCBANK', type: 'buy', orderType: 'limit', quantity: 15, price: 1660, filledQuantity: 8, status: 'partial', placedAt: '2024-01-15T09:30:00' },
    { id: '5', symbol: 'SBIN', type: 'sell', orderType: 'market', quantity: 25, price: 610, filledQuantity: 0, status: 'cancelled', placedAt: '2024-01-15T09:00:00' },
  ];
  
  const orders = (externalOrders || defaultOrders).slice(0, maxItems);
  
  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'filled':
        return <HiCheck className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <HiClock className="w-4 h-4 text-yellow-400" />;
      case 'partial':
        return <HiArrowRight className="w-4 h-4 text-blue-400" />;
      case 'cancelled':
      case 'rejected':
        return <HiX className="w-4 h-4 text-red-400" />;
    }
  };
  
  const getStatusStyle = (status: Order['status']) => {
    switch (status) {
      case 'filled':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'partial':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className={`bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
      </div>
      
      {/* Orders List */}
      <div className="divide-y divide-white/5">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No orders yet
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              onClick={() => onViewOrder?.(order)}
              className="p-4 hover:bg-white/5 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded uppercase ${
                    order.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {order.type}
                  </span>
                  <span className="font-medium text-white">{order.symbol}</span>
                </div>
                <span className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusStyle(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-400">
                  {order.quantity} @ ₹{order.price.toLocaleString('en-IN')}
                  <span className="ml-2 text-xs">({order.orderType})</span>
                </div>
                <div className="text-gray-500 text-xs">
                  {formatTime(order.placedAt)}
                </div>
              </div>
              
              {/* Progress bar for partial fills */}
              {order.status === 'partial' && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Filled</span>
                    <span className="text-white">{order.filledQuantity}/{order.quantity}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(order.filledQuantity / order.quantity) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Cancel button for pending orders */}
              {(order.status === 'pending' || order.status === 'partial') && onCancelOrder && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelOrder(order.id);
                  }}
                  className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Cancel Order
                </button>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* View All Link */}
      {orders.length > 0 && (
        <div className="p-3 border-t border-white/10">
          <button className="w-full text-center text-sm text-blue-400 hover:text-blue-300 transition-colors">
            View All Orders
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentOrders;

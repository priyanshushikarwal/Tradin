import React, { useState } from 'react';
import { HiSwitchHorizontal } from 'react-icons/hi';

interface OrderFormProps {
  symbol?: string;
  currentPrice?: number;
  onSubmit?: (order: OrderFormData) => void;
  className?: string;
}

interface OrderFormData {
  symbol: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop' | 'stop-limit';
  quantity: number;
  price?: number;
  stopPrice?: number;
  validity: 'day' | 'gtc' | 'ioc';
}

const OrderForm: React.FC<OrderFormProps> = ({
  symbol = 'RELIANCE',
  currentPrice = 2450.50,
  onSubmit,
  className = '',
}) => {
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [priceType, setPriceType] = useState<'market' | 'limit' | 'stop' | 'stop-limit'>('market');
  const [quantity, setQuantity] = useState<string>('');
  const [price, setPrice] = useState<string>(currentPrice.toString());
  const [stopPrice, setStopPrice] = useState<string>('');
  const [validity, setValidity] = useState<'day' | 'gtc' | 'ioc'>('day');
  
  const estimatedValue = Number(quantity || 0) * (priceType === 'market' ? currentPrice : Number(price || 0));
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit?.({
      symbol,
      type: orderType,
      orderType: priceType,
      quantity: Number(quantity),
      price: priceType !== 'market' ? Number(price) : undefined,
      stopPrice: priceType.includes('stop') ? Number(stopPrice) : undefined,
      validity,
    });
  };
  
  return (
    <div className={`bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{symbol}</h3>
        <span className="text-lg font-bold text-white">₹{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>
      
      {/* Buy/Sell Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setOrderType('buy')}
          className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
            orderType === 'buy'
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
              : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setOrderType('sell')}
          className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
            orderType === 'sell'
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
              : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          Sell
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Order Type */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Order Type</label>
          <div className="grid grid-cols-2 gap-2">
            {(['market', 'limit'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setPriceType(type)}
                className={`py-2 rounded-lg text-sm font-medium transition-all ${
                  priceType === type
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Quantity */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity"
            min="1"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
          />
        </div>
        
        {/* Price (for limit orders) */}
        {priceType === 'limit' && (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              step="0.01"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>
        )}
        
        {/* Validity */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Validity</label>
          <div className="flex gap-2">
            {(['day', 'gtc', 'ioc'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setValidity(v)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium uppercase transition-all ${
                  validity === v
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'bg-white/5 text-gray-400 border border-white/5 hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="bg-white/5 rounded-xl p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Quantity</span>
            <span className="text-white">{quantity || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Price</span>
            <span className="text-white">
              {priceType === 'market' ? 'Market' : `₹${Number(price || 0).toLocaleString('en-IN')}`}
            </span>
          </div>
          <div className="border-t border-white/10 pt-2 flex justify-between">
            <span className="text-gray-400 font-medium">Estimated Value</span>
            <span className="text-white font-semibold">₹{estimatedValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={!quantity || Number(quantity) <= 0}
          className={`w-full py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            orderType === 'buy'
              ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25'
              : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25'
          }`}
        >
          {orderType === 'buy' ? 'Buy' : 'Sell'} {symbol}
        </button>
      </form>
    </div>
  );
};

export default OrderForm;

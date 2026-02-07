import React, { useState, useEffect } from 'react';

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

interface OrderBookProps {
  symbol: string;
  bids?: OrderBookEntry[];
  asks?: OrderBookEntry[];
  maxRows?: number;
  className?: string;
}

const OrderBook: React.FC<OrderBookProps> = ({
  symbol,
  bids: externalBids,
  asks: externalAsks,
  maxRows = 10,
  className = '',
}) => {
  const [view, setView] = useState<'both' | 'bids' | 'asks'>('both');
  
  // Generate mock data if none provided
  const generateMockData = (isBid: boolean): OrderBookEntry[] => {
    const basePrice = 45000;
    const entries: OrderBookEntry[] = [];
    let runningTotal = 0;
    
    for (let i = 0; i < maxRows; i++) {
      const price = isBid
        ? basePrice - (i + 1) * (Math.random() * 10 + 5)
        : basePrice + (i + 1) * (Math.random() * 10 + 5);
      const quantity = Math.random() * 2 + 0.1;
      runningTotal += quantity;
      
      entries.push({
        price: Math.round(price * 100) / 100,
        quantity: Math.round(quantity * 10000) / 10000,
        total: Math.round(runningTotal * 10000) / 10000,
      });
    }
    
    return entries;
  };
  
  const [bids, setBids] = useState<OrderBookEntry[]>(externalBids || generateMockData(true));
  const [asks, setAsks] = useState<OrderBookEntry[]>(externalAsks || generateMockData(false));
  
  // Simulate live updates
  useEffect(() => {
    if (externalBids && externalAsks) return;
    
    const interval = setInterval(() => {
      setBids(generateMockData(true));
      setAsks(generateMockData(false));
    }, 2000);
    
    return () => clearInterval(interval);
  }, [externalBids, externalAsks]);
  
  const maxBidTotal = Math.max(...bids.map(b => b.total));
  const maxAskTotal = Math.max(...asks.map(a => a.total));
  
  const spreadValue = asks[0]?.price && bids[0]?.price
    ? asks[0].price - bids[0].price
    : 0;
  const spreadPercent = bids[0]?.price
    ? (spreadValue / bids[0].price) * 100
    : 0;
  
  const renderRow = (entry: OrderBookEntry, isBid: boolean, maxTotal: number) => {
    const depthPercent = (entry.total / maxTotal) * 100;
    
    return (
      <div key={entry.price} className="relative group">
        {/* Depth Bar */}
        <div
          className={`absolute inset-y-0 ${isBid ? 'right-0' : 'left-0'} opacity-20`}
          style={{
            width: `${depthPercent}%`,
            backgroundColor: isBid ? '#22C55E' : '#EF4444',
          }}
        />
        
        {/* Data */}
        <div className="relative flex items-center px-3 py-1 hover:bg-white/5 transition-colors text-xs">
          <span className={`flex-1 font-mono ${isBid ? 'text-green-400' : 'text-red-400'}`}>
            {entry.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="flex-1 text-right text-gray-300 font-mono">
            {entry.quantity.toFixed(4)}
          </span>
          <span className="flex-1 text-right text-gray-400 font-mono">
            {entry.total.toFixed(4)}
          </span>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Order Book</h3>
          
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
            <button
              onClick={() => setView('both')}
              className={`px-2 py-1 text-xs rounded transition-all ${
                view === 'both' ? 'bg-white/10 text-white' : 'text-gray-400'
              }`}
            >
              Both
            </button>
            <button
              onClick={() => setView('bids')}
              className={`px-2 py-1 text-xs rounded transition-all ${
                view === 'bids' ? 'bg-green-500/20 text-green-400' : 'text-gray-400'
              }`}
            >
              Bids
            </button>
            <button
              onClick={() => setView('asks')}
              className={`px-2 py-1 text-xs rounded transition-all ${
                view === 'asks' ? 'bg-red-500/20 text-red-400' : 'text-gray-400'
              }`}
            >
              Asks
            </button>
          </div>
        </div>
      </div>
      
      {/* Column Headers */}
      <div className="flex items-center px-3 py-2 text-xs text-gray-500 border-b border-white/5">
        <span className="flex-1">Price (INR)</span>
        <span className="flex-1 text-right">Size</span>
        <span className="flex-1 text-right">Total</span>
      </div>
      
      {/* Asks (Sells) - Reversed to show lowest at bottom */}
      {(view === 'both' || view === 'asks') && (
        <div className="max-h-48 overflow-y-auto scrollbar-thin">
          {[...asks].reverse().map(entry => renderRow(entry, false, maxAskTotal))}
        </div>
      )}
      
      {/* Spread */}
      {view === 'both' && (
        <div className="flex items-center justify-center gap-3 py-2 bg-white/5 border-y border-white/10">
          <span className="text-xs text-gray-400">Spread:</span>
          <span className="text-xs font-medium text-white">
            ₹{spreadValue.toFixed(2)} ({spreadPercent.toFixed(2)}%)
          </span>
        </div>
      )}
      
      {/* Bids (Buys) */}
      {(view === 'both' || view === 'bids') && (
        <div className="max-h-48 overflow-y-auto scrollbar-thin">
          {bids.map(entry => renderRow(entry, true, maxBidTotal))}
        </div>
      )}
    </div>
  );
};

export default OrderBook;

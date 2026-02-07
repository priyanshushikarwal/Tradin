import React, { useState, useEffect } from 'react';
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi';

interface TickerData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
}

interface PriceTickerProps {
  tickers?: TickerData[];
  variant?: 'horizontal' | 'card' | 'compact';
  autoScroll?: boolean;
  onTickerClick?: (ticker: TickerData) => void;
  className?: string;
}

const PriceTicker: React.FC<PriceTickerProps> = ({
  tickers: externalTickers,
  variant = 'horizontal',
  autoScroll = true,
  onTickerClick,
  className = '',
}) => {
  // Mock data if none provided
  const defaultTickers: TickerData[] = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2450.50, change: 25.30, changePercent: 1.04, high: 2480, low: 2420, volume: 5234567 },
    { symbol: 'TCS', name: 'Tata Consultancy', price: 3520.75, change: -15.25, changePercent: -0.43, high: 3550, low: 3510, volume: 2345678 },
    { symbol: 'INFY', name: 'Infosys', price: 1456.30, change: 12.80, changePercent: 0.89, high: 1470, low: 1440, volume: 3456789 },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1678.90, change: -8.45, changePercent: -0.50, high: 1695, low: 1670, volume: 4567890 },
    { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 945.60, change: 5.20, changePercent: 0.55, high: 950, low: 938, volume: 6789012 },
    { symbol: 'SBIN', name: 'State Bank of India', price: 612.35, change: -3.15, changePercent: -0.51, high: 620, low: 608, volume: 8901234 },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 1234.50, change: 18.75, changePercent: 1.54, high: 1250, low: 1210, volume: 1234567 },
    { symbol: 'ITC', name: 'ITC Limited', price: 456.80, change: 2.30, changePercent: 0.51, high: 460, low: 452, volume: 7890123 },
  ];
  
  const [tickers, setTickers] = useState<TickerData[]>(externalTickers || defaultTickers);
  
  // Simulate live price updates
  useEffect(() => {
    if (externalTickers) return;
    
    const interval = setInterval(() => {
      setTickers(prev => prev.map(ticker => {
        const changeAmount = (Math.random() - 0.5) * 2 * ticker.price * 0.001;
        const newPrice = ticker.price + changeAmount;
        return {
          ...ticker,
          price: Math.round(newPrice * 100) / 100,
          change: Math.round((ticker.change + changeAmount) * 100) / 100,
          changePercent: Math.round((ticker.change + changeAmount) / ticker.price * 100 * 100) / 100,
        };
      }));
    }, 3000);
    
    return () => clearInterval(interval);
  }, [externalTickers]);
  
  if (variant === 'horizontal') {
    return (
      <div className={`bg-[#0E141B] border-y border-white/10 overflow-hidden ${className}`}>
        <div className={`flex items-center gap-6 py-2 px-4 ${autoScroll ? 'animate-marquee' : 'overflow-x-auto'}`}>
          {tickers.map((ticker, index) => {
            const isPositive = ticker.change >= 0;
            return (
              <div
                key={`${ticker.symbol}-${index}`}
                onClick={() => onTickerClick?.(ticker)}
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap"
              >
                <span className="text-sm font-semibold text-white">{ticker.symbol}</span>
                <span className="text-sm text-gray-300">₹{ticker.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? <HiTrendingUp className="w-3 h-3" /> : <HiTrendingDown className="w-3 h-3" />}
                  {isPositive ? '+' : ''}{ticker.changePercent.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  
  if (variant === 'compact') {
    return (
      <div className={`space-y-1 ${className}`}>
        {tickers.map((ticker) => {
          const isPositive = ticker.change >= 0;
          return (
            <div
              key={ticker.symbol}
              onClick={() => onTickerClick?.(ticker)}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-sm font-medium text-white">{ticker.symbol}</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-white">₹{ticker.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                <div className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{ticker.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  
  // Card variant
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${className}`}>
      {tickers.map((ticker) => {
        const isPositive = ticker.change >= 0;
        return (
          <div
            key={ticker.symbol}
            onClick={() => onTickerClick?.(ticker)}
            className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:bg-white/8 hover:border-white/15 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-white">{ticker.symbol}</span>
              <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {isPositive ? <HiTrendingUp className="w-3 h-3" /> : <HiTrendingDown className="w-3 h-3" />}
                {isPositive ? '+' : ''}{ticker.changePercent.toFixed(2)}%
              </span>
            </div>
            <div className="text-lg font-bold text-white mb-1">
              ₹{ticker.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>H: ₹{ticker.high.toLocaleString()}</span>
              <span>L: ₹{ticker.low.toLocaleString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PriceTicker;

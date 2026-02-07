import React from 'react';
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi';

interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  investedValue: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

interface HoldingsListProps {
  holdings?: Holding[];
  onHoldingClick?: (holding: Holding) => void;
  compact?: boolean;
  className?: string;
}

const HoldingsList: React.FC<HoldingsListProps> = ({
  holdings: externalHoldings,
  onHoldingClick,
  compact = false,
  className = '',
}) => {
  // Default mock holdings
  const defaultHoldings: Holding[] = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', quantity: 50, avgPrice: 2380, currentPrice: 2450.50, investedValue: 119000, currentValue: 122525, pnl: 3525, pnlPercent: 2.96, dayChange: 25.30, dayChangePercent: 1.04 },
    { symbol: 'TCS', name: 'Tata Consultancy', quantity: 25, avgPrice: 3480, currentPrice: 3520.75, investedValue: 87000, currentValue: 88018.75, pnl: 1018.75, pnlPercent: 1.17, dayChange: -15.25, dayChangePercent: -0.43 },
    { symbol: 'INFY', name: 'Infosys', quantity: 100, avgPrice: 1420, currentPrice: 1456.30, investedValue: 142000, currentValue: 145630, pnl: 3630, pnlPercent: 2.56, dayChange: 12.80, dayChangePercent: 0.89 },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', quantity: 40, avgPrice: 1650, currentPrice: 1678.90, investedValue: 66000, currentValue: 67156, pnl: 1156, pnlPercent: 1.75, dayChange: -8.45, dayChangePercent: -0.50 },
    { symbol: 'ICICIBANK', name: 'ICICI Bank', quantity: 80, avgPrice: 920, currentPrice: 945.60, investedValue: 73600, currentValue: 75648, pnl: 2048, pnlPercent: 2.78, dayChange: 5.20, dayChangePercent: 0.55 },
  ];
  
  const holdings = externalHoldings || defaultHoldings;
  
  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        {holdings.map((holding) => {
          const isPositive = holding.pnl >= 0;
          const isDayPositive = holding.dayChange >= 0;
          
          return (
            <div
              key={holding.symbol}
              onClick={() => onHoldingClick?.(holding)}
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/8 border border-white/10 cursor-pointer transition-all"
            >
              <div>
                <div className="font-medium text-white">{holding.symbol}</div>
                <div className="text-xs text-gray-400">{holding.quantity} shares</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-white">₹{holding.currentValue.toLocaleString('en-IN')}</div>
                <div className={`text-xs flex items-center justify-end gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? <HiTrendingUp className="w-3 h-3" /> : <HiTrendingDown className="w-3 h-3" />}
                  {isPositive ? '+' : ''}₹{Math.abs(holding.pnl).toLocaleString('en-IN')} ({holding.pnlPercent.toFixed(2)}%)
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Instrument</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Qty</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Avg Price</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">LTP</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Current Value</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">P&L</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Day Change</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {holdings.map((holding) => {
            const isPositive = holding.pnl >= 0;
            const isDayPositive = holding.dayChange >= 0;
            
            return (
              <tr
                key={holding.symbol}
                onClick={() => onHoldingClick?.(holding)}
                className="hover:bg-white/5 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{holding.symbol}</div>
                  <div className="text-xs text-gray-400">{holding.name}</div>
                </td>
                <td className="px-4 py-3 text-right text-white">{holding.quantity}</td>
                <td className="px-4 py-3 text-right text-gray-300">₹{holding.avgPrice.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-right text-white font-medium">₹{holding.currentPrice.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-right text-white">₹{holding.currentValue.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-right">
                  <div className={`flex items-center justify-end gap-1 font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? <HiTrendingUp className="w-3 h-3" /> : <HiTrendingDown className="w-3 h-3" />}
                    {isPositive ? '+' : ''}₹{Math.abs(holding.pnl).toLocaleString('en-IN')}
                  </div>
                  <div className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    ({holding.pnlPercent.toFixed(2)}%)
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-sm ${isDayPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isDayPositive ? '+' : ''}{holding.dayChangePercent.toFixed(2)}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default HoldingsList;

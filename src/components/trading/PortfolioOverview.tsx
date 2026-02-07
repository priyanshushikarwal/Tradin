import React from 'react';
import { HiTrendingUp, HiTrendingDown, HiCurrencyRupee, HiChartBar, HiCollection } from 'react-icons/hi';

interface PortfolioSummary {
  totalValue: number;
  investedValue: number;
  currentValue: number;
  dayChange: number;
  dayChangePercent: number;
  overallChange: number;
  overallChangePercent: number;
  holdingsCount: number;
}

interface PortfolioOverviewProps {
  summary?: PortfolioSummary;
  className?: string;
}

const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({
  summary,
  className = '',
}) => {
  // Default mock data
  const data: PortfolioSummary = summary || {
    totalValue: 524500,
    investedValue: 500000,
    currentValue: 524500,
    dayChange: 3250,
    dayChangePercent: 0.62,
    overallChange: 24500,
    overallChangePercent: 4.9,
    holdingsCount: 12,
  };
  
  const isDayPositive = data.dayChange >= 0;
  const isOverallPositive = data.overallChange >= 0;
  
  const stats = [
    {
      label: 'Total Value',
      value: `₹${data.totalValue.toLocaleString('en-IN')}`,
      icon: HiCurrencyRupee,
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
    },
    {
      label: 'Invested',
      value: `₹${data.investedValue.toLocaleString('en-IN')}`,
      icon: HiChartBar,
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
    },
    {
      label: "Today's P&L",
      value: `${isDayPositive ? '+' : ''}₹${Math.abs(data.dayChange).toLocaleString('en-IN')}`,
      subValue: `${isDayPositive ? '+' : ''}${data.dayChangePercent.toFixed(2)}%`,
      icon: isDayPositive ? HiTrendingUp : HiTrendingDown,
      iconBg: isDayPositive ? 'bg-green-500/20' : 'bg-red-500/20',
      iconColor: isDayPositive ? 'text-green-400' : 'text-red-400',
      valueColor: isDayPositive ? 'text-green-400' : 'text-red-400',
    },
    {
      label: 'Overall P&L',
      value: `${isOverallPositive ? '+' : ''}₹${Math.abs(data.overallChange).toLocaleString('en-IN')}`,
      subValue: `${isOverallPositive ? '+' : ''}${data.overallChangePercent.toFixed(2)}%`,
      icon: isOverallPositive ? HiTrendingUp : HiTrendingDown,
      iconBg: isOverallPositive ? 'bg-green-500/20' : 'bg-red-500/20',
      iconColor: isOverallPositive ? 'text-green-400' : 'text-red-400',
      valueColor: isOverallPositive ? 'text-green-400' : 'text-red-400',
    },
  ];
  
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 ${className}`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${stat.iconBg}`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <span className="text-sm text-gray-400">{stat.label}</span>
          </div>
          <div className={`text-xl font-bold ${stat.valueColor || 'text-white'}`}>
            {stat.value}
          </div>
          {stat.subValue && (
            <div className={`text-sm mt-1 ${stat.valueColor || 'text-gray-400'}`}>
              {stat.subValue}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PortfolioOverview;

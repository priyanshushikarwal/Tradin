import React, { useEffect, useRef, useState } from 'react';
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi';

interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TradingChartProps {
  symbol: string;
  data?: CandlestickData[];
  height?: number;
  showVolume?: boolean;
  interval?: '1m' | '5m' | '15m' | '1h' | '4h' | '1D' | '1W';
  onIntervalChange?: (interval: string) => void;
  className?: string;
}

const TradingChart: React.FC<TradingChartProps> = ({
  symbol,
  data: externalData,
  height = 400,
  showVolume = true,
  interval = '1D',
  onIntervalChange,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedInterval, setSelectedInterval] = useState(interval);
  const [hoveredCandle, setHoveredCandle] = useState<CandlestickData | null>(null);
  
  // Generate mock data if none provided
  const generateMockData = (): CandlestickData[] => {
    const data: CandlestickData[] = [];
    let basePrice = 45000 + Math.random() * 5000;
    const now = Date.now();
    
    for (let i = 100; i >= 0; i--) {
      const volatility = 0.02;
      const change = (Math.random() - 0.5) * 2 * volatility;
      const open = basePrice;
      const close = basePrice * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      
      data.push({
        time: now - i * 86400000,
        open,
        high,
        low,
        close,
        volume: Math.random() * 1000000 + 500000,
      });
      
      basePrice = close;
    }
    
    return data;
  };
  
  const data = externalData || generateMockData();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    const chartHeight = showVolume ? rect.height * 0.75 : rect.height - 20;
    const volumeHeight = showVolume ? rect.height * 0.2 : 0;
    const padding = { top: 10, right: 60, bottom: 30, left: 10 };
    
    // Calculate price range
    const prices = data.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    
    // Calculate volume range
    const volumes = data.map(d => d.volume);
    const maxVolume = Math.max(...volumes);
    
    // Clear canvas
    ctx.fillStyle = '#0E141B';
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight - padding.top) * (i / 5);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(rect.width - padding.right, y);
      ctx.stroke();
      
      // Price labels
      const price = maxPrice - (priceRange * i / 5);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(price.toFixed(2), rect.width - padding.right + 5, y + 4);
    }
    
    // Draw candlesticks
    const candleWidth = (rect.width - padding.left - padding.right) / data.length;
    const candleBody = candleWidth * 0.7;
    
    data.forEach((candle, i) => {
      const x = padding.left + i * candleWidth + candleWidth / 2;
      const isGreen = candle.close >= candle.open;
      
      // Wick
      const highY = padding.top + ((maxPrice - candle.high) / priceRange) * (chartHeight - padding.top - 10);
      const lowY = padding.top + ((maxPrice - candle.low) / priceRange) * (chartHeight - padding.top - 10);
      
      ctx.strokeStyle = isGreen ? '#22C55E' : '#EF4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();
      
      // Body
      const openY = padding.top + ((maxPrice - candle.open) / priceRange) * (chartHeight - padding.top - 10);
      const closeY = padding.top + ((maxPrice - candle.close) / priceRange) * (chartHeight - padding.top - 10);
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(Math.abs(closeY - openY), 1);
      
      ctx.fillStyle = isGreen ? '#22C55E' : '#EF4444';
      ctx.fillRect(x - candleBody / 2, bodyTop, candleBody, bodyHeight);
      
      // Volume bars
      if (showVolume) {
        const volumeY = chartHeight + 10;
        const volumeBarHeight = (candle.volume / maxVolume) * volumeHeight;
        ctx.fillStyle = isGreen ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)';
        ctx.fillRect(x - candleBody / 2, volumeY + volumeHeight - volumeBarHeight, candleBody, volumeBarHeight);
      }
    });
    
  }, [data, showVolume]);
  
  const intervals = ['1m', '5m', '15m', '1h', '4h', '1D', '1W'];
  
  const latestPrice = data[data.length - 1]?.close || 0;
  const previousPrice = data[data.length - 2]?.close || latestPrice;
  const priceChange = latestPrice - previousPrice;
  const priceChangePercent = (priceChange / previousPrice) * 100;
  const isPositive = priceChange >= 0;
  
  return (
    <div className={`bg-[#0E141B] rounded-2xl border border-white/10 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-white">{symbol}</h3>
            <div className="flex items-center gap-1">
              <span className="text-xl font-semibold text-white">
                ₹{latestPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? <HiTrendingUp className="w-4 h-4" /> : <HiTrendingDown className="w-4 h-4" />}
                {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
              </span>
            </div>
          </div>
          
          {/* Interval Selector */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            {intervals.map((int) => (
              <button
                key={int}
                onClick={() => {
                  setSelectedInterval(int as typeof selectedInterval);
                  onIntervalChange?.(int);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  selectedInterval === int
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {int}
              </button>
            ))}
          </div>
        </div>
        
        {/* OHLCV Display */}
        {hoveredCandle && (
          <div className="flex items-center gap-4 mt-3 text-xs">
            <span className="text-gray-400">O: <span className="text-white">{hoveredCandle.open.toFixed(2)}</span></span>
            <span className="text-gray-400">H: <span className="text-green-400">{hoveredCandle.high.toFixed(2)}</span></span>
            <span className="text-gray-400">L: <span className="text-red-400">{hoveredCandle.low.toFixed(2)}</span></span>
            <span className="text-gray-400">C: <span className="text-white">{hoveredCandle.close.toFixed(2)}</span></span>
            <span className="text-gray-400">V: <span className="text-white">{(hoveredCandle.volume / 1000).toFixed(0)}K</span></span>
          </div>
        )}
      </div>
      
      {/* Chart Canvas */}
      <div className="relative" style={{ height }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const candleWidth = rect.width / data.length;
            const index = Math.floor(x / candleWidth);
            if (index >= 0 && index < data.length) {
              setHoveredCandle(data[index]);
            }
          }}
          onMouseLeave={() => setHoveredCandle(null)}
        />
      </div>
    </div>
  );
};

export default TradingChart;

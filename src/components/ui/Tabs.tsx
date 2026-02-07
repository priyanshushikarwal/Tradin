import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  variant = 'default',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };
  
  const getTabStyles = (isActive: boolean) => {
    const base = 'flex items-center gap-2 px-4 py-2.5 font-medium transition-all duration-200 whitespace-nowrap';
    
    if (variant === 'pills') {
      return `${base} rounded-xl ${
        isActive
          ? 'bg-blue-500 text-white'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`;
    }
    
    if (variant === 'underline') {
      return `${base} border-b-2 ${
        isActive
          ? 'border-blue-500 text-white'
          : 'border-transparent text-gray-400 hover:text-white hover:border-white/20'
      }`;
    }
    
    // Default
    return `${base} ${
      isActive
        ? 'text-white bg-white/10 rounded-xl'
        : 'text-gray-400 hover:text-white hover:bg-white/5 rounded-xl'
    }`;
  };
  
  return (
    <div className={className}>
      {/* Tab List */}
      <div
        className={`
          flex gap-1 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10
          ${variant === 'underline' ? 'border-b border-white/10' : 'p-1 bg-white/5 rounded-xl'}
        `}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={getTabStyles(activeTab === tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="mt-4">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

export default Tabs;

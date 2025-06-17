import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode; 
  className?: string;
  valueClassName?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, unit, icon, className = '', valueClassName = '' }) => {
  return (
    <div className={`bg-theme-bg-default p-4 sm:p-5 shadow-md rounded-lg border border-theme-border-default transition-all hover:shadow-lg hover:-translate-y-px ${className}`}>
      <div className="flex items-center justify-between mb-0.5 sm:mb-1">
        <h3 className="text-xs sm:text-sm font-medium text-theme-text-muted uppercase tracking-wider truncate">{title}</h3>
        {icon && <div className="text-theme-text-subtle text-sm sm:text-base">{icon}</div>}
      </div>
      <p className={`text-2xl sm:text-3xl font-bold text-theme-text-default truncate ${valueClassName}`}>
        {typeof value === 'number' ? value.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:1}) : value}
        {unit && <span className="text-base sm:text-lg font-medium text-theme-text-muted ml-1">{unit}</span>}
      </p>
    </div>
  );
};

export default StatCard;
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  variant?: 'default' | 'danger' | 'warning' | 'success';
}

const variantStyles = {
  default: 'border-border',
  danger: 'border-destructive/30 glow-destructive',
  warning: 'border-warning/30 glow-warning',
  success: 'border-success/30',
};

const iconStyles = {
  default: 'text-primary',
  danger: 'text-destructive',
  warning: 'text-warning',
  success: 'text-success',
};

export function StatCard({ title, value, icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <div className={`bg-card rounded-lg border p-5 ${variantStyles[variant]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{title}</span>
        <span className={iconStyles[variant]}>{icon}</span>
      </div>
      <div className="text-3xl font-bold font-mono">{value}</div>
      {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
    </div>
  );
}

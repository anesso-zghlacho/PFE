import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  variant?: 'default' | 'danger' | 'warning' | 'success';
}

const variantStyles = {
  default: 'border-white/5 bg-white/[0.03]',
  danger: 'border-destructive/30 bg-destructive/5 box-glow-destructive',
  warning: 'border-warning/30 bg-warning/5 box-glow-warning',
  success: 'border-success/30 bg-success/5',
};

const iconStyles = {
  default: 'bg-primary/10 text-primary',
  danger: 'bg-destructive/20 text-destructive',
  warning: 'bg-warning/20 text-warning',
  success: 'bg-success/20 text-success',
};

export function StatCard({ title, value, icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-2xl border p-5 glass-morphism ${variantStyles[variant]} shimmer-effect group`}
    >
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </span>
        <div className={`p-2 rounded-lg transition-transform duration-300 group-hover:scale-110 ${iconStyles[variant]}`}>
          {icon}
        </div>
      </div>
      
      <div className="relative z-10">
        <div className="text-3xl font-display font-black tracking-tighter text-foreground group-hover:text-glow transition-all">
          {value}
        </div>
        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className={`h-1 w-1 rounded-full ${iconStyles[variant].split(' ')[1]}`} />
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-tight">{trend}</p>
          </div>
        )}
      </div>

      {/* Background Decor */}
      <div className="absolute -bottom-2 -right-2 opacity-5 group-hover:opacity-10 transition-opacity">
        {icon}
      </div>
    </motion.div>
  );
}

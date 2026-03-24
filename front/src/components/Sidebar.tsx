import { NavLink as RouterNavLink } from 'react-router-dom';
import { Shield, Activity, AlertTriangle, Crosshair } from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: Shield },
  { to: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { to: '/traffic', label: 'Traffic', icon: Activity },
 
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-card border-r border-border flex flex-col z-30">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <span className="font-mono font-bold text-primary text-glow-primary text-lg">IDS</span>
        <span className="text-muted-foreground text-xs font-mono">v1.0</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <RouterNavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary glow-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </RouterNavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
          <span className="text-xs text-muted-foreground font-mono">System Active</span>
        </div>
      </div>
    </aside>
  );
}

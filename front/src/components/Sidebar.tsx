import { NavLink as RouterNavLink } from 'react-router-dom';
import { Shield, Activity, AlertTriangle, LogOut, Cpu, Command } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const links = [
  { to: '/', label: 'Overview', icon: Cpu },
  { to: '/alerts', label: 'Incidents', icon: AlertTriangle },
  { to: '/traffic', label: 'Network', icon: Activity },
];

export function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-sidebar-background border-r border-white/5 flex flex-col z-30 overflow-hidden">
      {/* Brand */}
      <div className="p-6 mb-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Shield className="h-8 w-8 text-primary relative z-10" />
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-xl tracking-tighter text-foreground leading-none">MYTHOS</span>
            <span className="text-[10px] font-mono text-primary/70 tracking-widest uppercase mt-1">IDS Core</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest px-2 mb-4">Monitoring</div>
        {links.map(({ to, label, icon: Icon }) => (
          <RouterNavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-primary/5 border border-primary/20 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`h-4 w-4 relative z-10 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-primary drop-shadow-[0_0_8px_rgba(174,100,45,0.5)]' : ''}`} />
                <span className="relative z-10">{label}</span>
              </>
            )}
          </RouterNavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-3 p-2 mb-4 rounded-lg bg-white/5 border border-white/5">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-xs">
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-foreground truncate">{user?.username || 'Operator'}</span>
            <span className="text-[10px] text-muted-foreground truncate">L3 Analyst</span>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-mono text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          TERMINATE_SESSION
        </button>
      </div>
    </aside>
  );
}

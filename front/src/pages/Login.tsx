import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        toast({
          title: "AUTHENTICATION_SUCCESS",
          description: "Session established. Redirecting to core...",
        });
        navigate("/");
      } else {
        toast({
          title: "ACCESS_DENIED",
          description: "Invalid credentials provided.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "SYSTEM_ERROR",
        description: "Failed to reach authentication node.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="scanline" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 relative z-10"
      >
        {/* Brand */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-6">
            <Shield className="h-16 w-16 text-primary relative z-10" />
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          </div>
          <h1 className="text-4xl font-display font-black tracking-tighter text-foreground mb-1">MYTHOS</h1>
          <p className="text-[10px] font-mono text-primary tracking-[0.4em] uppercase">Security_Operations_Console</p>
        </div>

        <div className="glass-morphism rounded-3xl border border-white/5 p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest ml-1">Identity_Token</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm font-mono text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                    placeholder="USERNAME"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest ml-1">Secure_Key</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm font-mono text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs tracking-tighter py-4 rounded-xl shadow-[0_0_20px_rgba(174,100,45,0.3)] hover:shadow-[0_0_30px_rgba(174,100,45,0.5)] transition-all flex items-center justify-center gap-2 uppercase active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Establish_Connection <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              Unregistered Analyst?{" "}
              <Link to="/register" className="text-primary hover:text-primary/80 transition-colors font-bold ml-1">
                CREATE_ACCOUNT
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-10 flex justify-center gap-8 opacity-30 grayscale">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[8px] font-mono uppercase font-bold tracking-tighter">Encryption</span>
            <span className="text-[10px] font-mono">AES_256</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[8px] font-mono uppercase font-bold tracking-tighter">Node</span>
            <span className="text-[10px] font-mono">SEC_01</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[8px] font-mono uppercase font-bold tracking-tighter">Auth</span>
            <span className="text-[10px] font-mono">JWT_RSA</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
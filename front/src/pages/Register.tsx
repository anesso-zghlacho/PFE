import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Lock, User, Mail, UserPlus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "VALIDATION_ERROR",
        description: "Security keys do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.register(username, email, password);
      if (response.message === 'User registered successfully') {
        toast({
          title: "ENROLLMENT_SUCCESS",
          description: "Operator profile created. Please authenticate.",
        });
        navigate("/login");
      } else {
        toast({
          title: "REGISTRATION_FAILED",
          description: response.message || "Failed to create profile.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "SYSTEM_ERROR",
        description: "Communication failure during enrollment.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden font-sans">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="scanline" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <Shield className="h-12 w-12 text-primary relative z-10" />
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
          </div>
          <h1 className="text-3xl font-display font-black tracking-tighter text-foreground mb-1 uppercase">Operator_Enrollment</h1>
          <p className="text-[9px] font-mono text-primary tracking-[0.3em] uppercase">Mythos_IDS_Personnel_Portal</p>
        </div>

        <div className="glass-morphism rounded-3xl border border-white/5 p-8 relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest ml-1">Assigned_Codename</label>
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

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest ml-1">Communication_Channel</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm font-mono text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                    placeholder="EMAIL_ADDRESS"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest ml-1">Security_Token</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm font-mono text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                    placeholder="KEY_01"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest ml-1">Confirm_Token</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm font-mono text-foreground focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                    placeholder="KEY_REENTER"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs tracking-tighter py-4 rounded-xl shadow-[0_0_20px_rgba(174,100,45,0.3)] hover:shadow-[0_0_30px_rgba(174,100,45,0.5)] transition-all flex items-center justify-center gap-2 uppercase mt-6 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Initialize_Profile <UserPlus className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              Existing Operator?{" "}
              <Link to="/login" className="text-primary hover:text-primary/80 transition-colors font-bold ml-1">
                ACCESS_TERMINAL
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
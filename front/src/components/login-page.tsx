import * as React from "react";
import { useAuth } from "@/context/auth-context";
import { Shield, Loader2, AlertCircle, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/context/auth-context";

export function LoginPage() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { login, needsSetup, checkUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (needsSetup) {
        // Register first user
        await api.post("/auth/register/", { username, password, email: `${username}@sentinel.local` });
        await login(username, password);
      } else {
        await login(username, password);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.username?.[0] || "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0E14] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            {needsSetup ? <UserPlus className="h-6 w-6 text-primary" /> : <Shield className="h-6 w-6 text-primary" />}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {needsSetup ? "Initial System Setup" : "Sentinel IDS"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {needsSetup 
              ? "Create the master administrator account to initialize the system." 
              : "Enter your credentials to access the security console"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4" />
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                placeholder="admin"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="relative w-full overflow-hidden rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {needsSetup ? "Creating Account..." : "Authenticating..."}
                  </>
                ) : (
                  needsSetup ? "Initialize System" : "Access Dashboard"
                )}
              </span>
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          &copy; 2024 Sentinel Security Systems. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}

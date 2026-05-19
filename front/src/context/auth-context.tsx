import * as React from "react";
import axios from "axios";

interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  needsSetup: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkUser: () => Promise<void>;
}

const AuthContext = React.createContext<AuthState | null>(null);

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

// Helper to get CSRF token from cookies
function getCookie(name: string) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

api.interceptors.request.use((config) => {
  const csrfToken = getCookie("csrftoken");
  if (csrfToken) {
    config.headers["X-CSRFToken"] = csrfToken;
  }
  return config;
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [needsSetup, setNeedsSetup] = React.useState(false);

  const checkUser = async () => {
    try {
      // First check if setup is needed
      const setupRes = await api.get("/auth/setup-status/");
      setNeedsSetup(setupRes.data.needs_setup);

      // Then get user info
      const res = await api.get("/auth/user/");
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    checkUser();
  }, []);

  const login = async (username: string, password: string) => {
    // First get CSRF token
    await api.get("/auth/csrf/");
    await api.post("/auth/login/", { username, password });
    await checkUser();
  };

  const logout = async () => {
    await api.post("/auth/logout/");
    setUser(null);
  };

  const value = React.useMemo(
    () => ({ user, loading, needsSetup, login, logout, checkUser }),
    [user, loading, needsSetup]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

export { api };

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardOverview } from "@/components/DashboardOverview";
import { AlertsPage } from "@/components/AlertsPage";
import { TrafficPage } from "@/components/TrafficPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { useIDSStore } from "@/hooks/use-ids-store";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function IDSApp() {
  const { trafficLogs, alerts, launchAttack, clearAlerts, clearLogs } = useIDSStore();

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<DashboardOverview trafficLogs={trafficLogs} alerts={alerts} />} />
          <Route path="/alerts" element={<AlertsPage alerts={alerts} onClear={clearAlerts} />} />
          <Route path="/traffic" element={<TrafficPage trafficLogs={trafficLogs} onClear={clearLogs} />} />
        </Routes>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={<IDSApp />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardOverview } from "@/components/DashboardOverview";
import { AlertsPage } from "@/components/AlertsPage";
import { TrafficPage } from "@/components/TrafficPage";
import { SimulatePage } from "@/components/SimulatePage";
import { useIDSStore } from "@/hooks/use-ids-store";

const queryClient = new QueryClient();

function IDSApp() {
  const { trafficLogs, alerts, launchAttack, clearAlerts, clearLogs } = useIDSStore();

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardOverview trafficLogs={trafficLogs} alerts={alerts} />} />
        <Route path="/alerts" element={<AlertsPage alerts={alerts} onClear={clearAlerts} />} />
        <Route path="/traffic" element={<TrafficPage trafficLogs={trafficLogs} onClear={clearLogs} />} />
        
      </Routes>
    </DashboardLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<IDSApp />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

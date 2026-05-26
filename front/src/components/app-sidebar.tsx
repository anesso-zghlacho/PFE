import { Link, useRouterState } from "@tanstack/react-router";
import { Shield, Activity, List, Settings, ShieldAlert, LogOut, User, Users, FileText } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import logoUrl from "@/assets/logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Overview", url: "/", icon: Shield, exact: true },
  { title: "Traffic Logs", url: "/traffic", icon: List },
  { title: "Threat Alerts", url: "/alerts", icon: ShieldAlert },
  { title: "Settings", url: "/settings", icon: Settings },
];

const adminItems = [
  { title: "User Management", url: "/users", icon: Users, exact: true },
  { title: "Auth History", url: "/logs", icon: FileText, exact: true },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url: string, exact?: boolean) =>
    exact ? path === url : path === url || path.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary shrink-0">
            <Activity className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-none group-data-[collapsible=icon]:hidden gap-0.5">
            <img src={logoUrl} alt="Soficlef" className="h-3.5 w-auto object-contain self-start" />
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
              Sentinel Flow IDS
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Monitoring</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url, item.exact)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.is_staff && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url, item.exact)} tooltip={item.title}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={user?.username || "User"}>
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <User className="h-3 w-3" />
                </div>
                <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="text-xs font-medium">{user?.username}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {user?.is_staff ? "Administrator" : "Analyst"}
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => logout()} 
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              tooltip="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}


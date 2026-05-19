## Internal Network IDS Dashboard

A professional dark-mode IDS dashboard with sidebar navigation, four routes, and a polished SaaS aesthetic (Vercel/Linear-inspired).

### Design system (src/styles.css)
- Background `#121417`, surface `#16191D`, border `#222`, muted text, high-contrast foreground
- Accents: Electric Blue `#3B82F6` (info/status), Tomato Red `#EF4444` (threats), Emerald for "secure"
- Convert to oklch tokens; add `--success`, `--warning`, semantic chart color
- Inter for UI, JetBrains Mono for IPs/ports
- Force dark mode by default (add `dark` class on `<html>` in `__root.tsx`)

### Routes (TanStack file-based)
- `src/routes/__root.tsx` — wrap Outlet in `SidebarProvider` + `AppSidebar` + header with page title, Engine Status indicator (pulsing dot), and Start/Stop Monitoring button. Shared monitoring state via React context.
- `src/routes/index.tsx` — Overview (stats + chart + recent alerts preview)
- `src/routes/traffic.tsx` — Traffic Logs (full sticky-header table)
- `src/routes/alerts.tsx` — Threat Alerts (vertical feed)
- `src/routes/settings.tsx` — Settings stubs (engine sensitivity, notification toggles)

Each route gets its own `head()` metadata.

### Components
- `src/components/app-sidebar.tsx` — collapsible icon sidebar with Shield/Activity/List/Settings icons, active route highlight
- `src/components/engine-status.tsx` — dot + label ("Monitoring" / "Idle") + Start/Stop button
- `src/components/stat-card.tsx` — label, value, small delta/icon
- `src/components/traffic-chart.tsx` — Recharts AreaChart, single blue line, subtle fill, 30-min window, mock data updating every 2s when monitoring is on
- `src/components/traffic-table.tsx` — shadcn Table with sticky header, monospace IPs, protocol badges (TCP/UDP), status badge (Secure/Warning)
- `src/components/alert-feed.tsx` — list of alert cards: threat type, source IP, timestamp, "View Details" button (opens Sheet/Dialog)
- `src/context/monitoring-context.tsx` — global running state + mock data generators (packets, throughput, logs, alerts)

### Overview page layout
1. Three stat cards: Traffic Volume (packets), Security Status (clear/N alerts pending), Network Load (KB/s)
2. Traffic chart card (full width)
3. Two-column: recent traffic preview (left) + recent alerts (right)

### Mock data
In-memory generators in the monitoring context:
- Packets increment, KB/s fluctuates, new log rows pushed every ~1s, occasional alert events
- Pause when monitoring stopped

### Motion
- `framer-motion` on route transitions only (fade + 4px translate); no decorative animation on data

### Technical notes
- Use existing shadcn Sidebar, Table, Badge, Button, Card, Sheet, Tooltip
- Recharts already available via `chart.tsx`
- Add JetBrains Mono via Google Fonts `<link>` in root `head()`
- Ensure `Sidebar collapsible="icon"` with trigger in header
- No backend; pure frontend + mock data (per request scope)

### Out of scope
- Real packet capture / backend (would need Lovable Cloud + edge — not requested)
- Auth, persistence, multi-user

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMonitoring } from "@/context/monitoring-context";

const fmtTime = (t: number) =>
  new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export function TrafficChart() {
  const { series } = useMonitoring();
  const data = series.map((p) => ({ time: fmtTime(p.t), kbps: Math.round(p.kbps) }));

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="kbpsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.65 0.2 255)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="oklch(0.65 0.2 255)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            tick={{ fill: "oklch(0.65 0.01 250)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={40}
          />
          <YAxis
            tick={{ fill: "oklch(0.65 0.01 250)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: "oklch(0.21 0.006 250)",
              border: "1px solid oklch(0.28 0.005 250)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "oklch(0.65 0.01 250)" }}
            formatter={(v: number) => [`${v} KB/s`, "Throughput"]}
          />
          <Area
            type="monotone"
            dataKey="kbps"
            stroke="oklch(0.65 0.2 255)"
            strokeWidth={2}
            fill="url(#kbpsFill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

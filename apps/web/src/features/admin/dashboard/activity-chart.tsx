"use client";

import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";

import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { useTRPC } from "@/utils/trpc-client";

const chartConfig = {
  sessions: { label: "Learning Sessions", color: "var(--chart-1)" },
  questions: { label: "Questions", color: "var(--chart-2)" },
};

export function ActivityChart() {
  const trpc = useTRPC();
  const { data = [] } = useQuery(trpc.admin.getWeeklyActivity.queryOptions());
  return (
    <div className="bg-card border-border h-full rounded-3xl border p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Weekly Activity</h3>
          <p className="text-muted-foreground text-sm">Learning sessions and questions over time</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-chart-1 size-3 rounded-full" />
            <span className="text-muted-foreground text-xs">Learning Sessions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-chart-2 size-3 rounded-full" />
            <span className="text-muted-foreground text-xs">Questions</span>
          </div>
        </div>
      </div>
      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="sessionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <ChartTooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="border-border bg-card rounded-xl border px-4 py-3 shadow-2xl">
                    <p className="text-foreground mb-2 text-sm font-semibold">{label}</p>
                    {payload.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div
                          className="size-2 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-muted-foreground">
                          {chartConfig[entry.dataKey as keyof typeof chartConfig]?.label}:
                        </span>
                        <span className="text-foreground font-mono font-semibold">
                          {entry.value?.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="sessions"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#sessionGradient)"
            />
            <Area
              type="monotone"
              dataKey="questions"
              stroke="var(--chart-2)"
              strokeWidth={2}
              fill="transparent"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}

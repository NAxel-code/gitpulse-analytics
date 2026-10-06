"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { GitCommit, Activity } from "lucide-react";

interface ActivityPoint {
  time_bucket: string;
  commits: number;
  pull_requests: number;
  issues: number;
  stars: number;
}

export function ActivityChart({ data, repoName }: { data: ActivityPoint[]; repoName: string }) {
  const [metric, setMetric] = useState<"code" | "community">("code");

  const formattedData = data.map((d) => ({
    ...d,
    dateLabel: d.time_bucket.slice(5), // 'MM-DD'
  }));

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-violet-400" />
            <h3 className="font-semibold text-zinc-100 text-sm md:text-base">
              Repository Activity Velocity
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Tren harian interaksi kode, pull request, dan isu di <span className="font-mono text-zinc-300">{repoName}</span>
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-950 p-0.5 self-start">
          <button
            onClick={() => setMetric("code")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition ${
              metric === "code"
                ? "bg-violet-600 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Commits & PRs
          </button>
          <button
            onClick={() => setMetric("community")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition ${
              metric === "community"
                ? "bg-violet-600 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Issues & Stars
          </button>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorPRs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorStars" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="dateLabel"
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#27272a" }}
            />
            <YAxis
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#27272a" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                borderColor: "#3f3f46",
                borderRadius: "0.5rem",
                color: "#f4f4f5",
                fontSize: "12px",
              }}
            />
            {metric === "code" ? (
              <>
                <Area
                  type="monotone"
                  dataKey="commits"
                  name="Commits"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCommits)"
                />
                <Area
                  type="monotone"
                  dataKey="pull_requests"
                  name="Pull Requests"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPRs)"
                />
              </>
            ) : (
              <>
                <Area
                  type="monotone"
                  dataKey="issues"
                  name="Issues"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIssues)"
                />
                <Area
                  type="monotone"
                  dataKey="stars"
                  name="New Stars"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorStars)"
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

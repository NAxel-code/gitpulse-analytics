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
import { GitCommit, Activity, RefreshCw } from "lucide-react";

interface ActivityPoint {
  time_bucket: string;
  commits: number;
  pull_requests: number;
  issues: number;
  stars: number;
}

export function ActivityChart({
  data,
  repoName,
  onSync,
  isSyncing = false,
}: {
  data: ActivityPoint[];
  repoName: string;
  onSync?: () => void;
  isSyncing?: boolean;
}) {
  const [metric, setMetric] = useState<"code" | "community">("code");

  const formattedData = data.map((d) => ({
    ...d,
    dateLabel: d.time_bucket.slice(5), // 'MM-DD'
  }));

  const computedMax = Math.max(
    ...(formattedData.length > 0
      ? formattedData.map((d) =>
          metric === "code"
            ? Math.max(d.commits || 0, d.pull_requests || 0)
            : Math.max(d.issues || 0, d.stars || 0)
        )
      : [0]),
    5
  );

  const isAllZero =
    formattedData.length > 0 &&
    formattedData.every((d) =>
      metric === "code"
        ? d.commits === 0 && d.pull_requests === 0
        : d.issues === 0 && d.stars === 0
    );

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-sm relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-400" />
            <h3 className="font-semibold text-zinc-100 text-sm md:text-base">
              Repository Activity Velocity
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Tren harian interaksi kode, pull request, dan isu di <span className="font-mono text-zinc-300">{repoName}</span>
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-950 p-1 self-start">
          <button
            onClick={() => setMetric("code")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-zinc-700 focus:outline-none ${
              metric === "code"
                ? "bg-zinc-800 text-zinc-100 border border-zinc-700/60 shadow-xs"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Commits &amp; PRs
          </button>
          <button
            onClick={() => setMetric("community")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-zinc-700 focus:outline-none ${
              metric === "community"
                ? "bg-zinc-800 text-zinc-100 border border-zinc-700/60 shadow-xs"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Issues &amp; Stars
          </button>
        </div>
      </div>

      {formattedData.length === 0 ? (
        <div className="h-[280px] w-full flex flex-col items-center justify-center text-center p-6">
          <Activity className="h-8 w-8 text-zinc-600 mb-2" />
          <h4 className="text-xs font-semibold text-zinc-300">Belum Ada Riwayat Aktivitas Harian</h4>
          <p className="text-[11px] text-zinc-500 mt-1 max-w-xs">
            Data time-series untuk {repoName} belum tersinkronisasi.
          </p>
          {onSync && (
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 transition"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Menyinkronkan..." : "Ambil Data GitHub Sekarang"}
            </button>
          )}
        </div>
      ) : (
        <div className="h-[280px] w-full relative">
          {isAllZero && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-[2px] rounded-lg p-6 text-center z-10">
              <div className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-3 shadow-inner">
                <Activity className="h-5 w-5 text-indigo-400" />
              </div>
              <h4 className="text-sm font-semibold text-zinc-200">
                Belum Ada Aktivitas {metric === "code" ? "Commit & PR" : "Issue & Star"}
              </h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm leading-relaxed">
                Riwayat aktivitas harian untuk <span className="font-mono text-zinc-300 font-medium">{repoName}</span> masih kosong atau belum tersinkronisasi.
              </p>
              {onSync && (
                <button
                  onClick={onSync}
                  disabled={isSyncing}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 px-4 py-2 text-xs font-medium text-white shadow-sm transition cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  {isSyncing ? "Menyinkronkan GitHub..." : `Sinkronisasi Live Data @${repoName}`}
                </button>
              )}
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorPRs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorStars" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
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
              allowDecimals={false}
              domain={[0, Math.ceil(computedMax * 1.15)]}
              width={32}
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
            {metric === "code" && (
              <Area
                type="monotone"
                dataKey="commits"
                name="Commits"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCommits)"
                isAnimationActive={false}
              />
            )}
            {metric === "code" && (
              <Area
                type="monotone"
                dataKey="pull_requests"
                name="Pull Requests"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPRs)"
                isAnimationActive={false}
              />
            )}
            {metric === "community" && (
              <Area
                type="monotone"
                dataKey="issues"
                name="Issues"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorIssues)"
                isAnimationActive={false}
              />
            )}
            {metric === "community" && (
              <Area
                type="monotone"
                dataKey="stars"
                name="New Stars"
                stroke="#38bdf8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorStars)"
                isAnimationActive={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  );
}

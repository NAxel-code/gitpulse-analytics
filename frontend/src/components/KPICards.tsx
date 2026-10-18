"use client";

import {
  Users,
  GitCommit,
  GitPullRequest,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
  Layers,
  Activity,
} from "lucide-react";
import { NumberTicker } from "./magicui/number-ticker";

interface RepoKPIData {
  total_commits: number;
  commits_change_pct: number;
  active_contributors: number;
  contributors_change_pct: number;
  pr_merge_rate: number;
  pr_rate_change_pct: number;
  total_prs: number;
  merged_prs: number;
  open_issues: number;
  issue_resolution_rate: number;
  total_stars: number;
  stars_change_pct: number;
  lines_added_total: number;
  lines_deleted_total: number;
  lead_time_hours?: number;
  lead_time_change_pct?: number;
  time_to_first_review_hours?: number;
  ttfr_change_pct?: number;
  pr_size_distribution?: { small: number; medium: number; large: number };
}

export function KPICards({ data }: { data: RepoKPIData | null }) {
  if (!data) {
    return (
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-zinc-900/60 border border-zinc-800 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-zinc-900/40 border border-zinc-800/60 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: "Active Contributors",
      value: data.active_contributors,
      suffix: "",
      delta: data.contributors_change_pct,
      icon: Users,
      highlight: false,
      subtitle: `${data.total_stars} Total Stargazers`,
      livePulse: true,
    },
    {
      title: "Total Commits",
      value: data.total_commits,
      suffix: "",
      delta: data.commits_change_pct,
      icon: GitCommit,
      highlight: false,
      subtitle: `+${(data.lines_added_total / 1000).toFixed(1)}k / -${(data.lines_deleted_total / 1000).toFixed(1)}k LoC`,
    },
    {
      title: "PR Merge Velocity",
      value: data.pr_merge_rate,
      decimalPlaces: 1,
      suffix: "%",
      delta: data.pr_rate_change_pct,
      icon: GitPullRequest,
      highlight: true,
      subtitle: `${data.merged_prs} of ${data.total_prs} PRs merged`,
    },
    {
      title: "Issue Resolution Rate",
      value: data.issue_resolution_rate,
      decimalPlaces: 1,
      suffix: "%",
      delta: 6.8,
      icon: CheckCircle2,
      highlight: false,
      subtitle: `${data.open_issues} Issues still open`,
    },
  ];

  const hasPRs = (data.total_prs || 0) > 0;
  const leadTime = hasPRs ? (data.lead_time_hours || 0) : 0;
  const leadTimeDelta = data.lead_time_change_pct || 0;
  const ttfr = hasPRs ? (data.time_to_first_review_hours || 0) : 0;
  const ttfrDelta = data.ttfr_change_pct || 0;
  const prDist = data.pr_size_distribution || { small: 0, medium: 0, large: 0 };
  const actualTotalDist = prDist.small + prDist.medium + prDist.large;
  const totalDist = actualTotalDist || 1;

  return (
    <div className="space-y-3.5 mb-6">
      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          const isPositive = kpi.delta >= 0;

          return (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-xl border bg-zinc-900/70 p-5 shadow-sm transition hover:border-zinc-700 ${
                kpi.highlight
                  ? "border-zinc-700 bg-zinc-900/90 before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-indigo-500"
                  : "border-zinc-800/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-zinc-400">{kpi.title}</span>
                  {kpi.livePulse && (
                    <span className="flex h-2 w-2 relative" title="GA4-style real-time activity pulse">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  )}
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800/90 text-zinc-300 border border-zinc-700/50">
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-1">
                <NumberTicker
                  value={kpi.value}
                  decimalPlaces={kpi.decimalPlaces || 0}
                  className="text-3xl font-bold tracking-tight text-white font-mono tabular-nums"
                />
                {kpi.suffix && <span className="text-2xl font-semibold text-zinc-300 font-mono">{kpi.suffix}</span>}
              </div>

              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-zinc-500 text-[11px] truncate max-w-[130px]">{kpi.subtitle}</span>
                <div
                  className={`flex items-center gap-0.5 font-semibold font-mono text-[11px] ${
                    isPositive ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  <span>{isPositive ? `+${kpi.delta}%` : `${kpi.delta}%`}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DORA Velocity & Engineering Hygiene Sub-Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Lead Time to Merge */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3.5 flex items-center justify-between hover:border-zinc-700 transition">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/60">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-200">Lead Time to Merge</div>
              <p className="text-[11px] text-zinc-400 mt-0.5">Time from initial commit to default branch merge</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono font-bold text-white tabular-nums">
              {hasPRs ? `${leadTime.toFixed(1)} hrs` : "-"}
            </div>
            <div className={`text-[10px] font-mono font-semibold ${hasPRs ? (leadTimeDelta <= 0 ? "text-emerald-400" : "text-rose-400") : "text-zinc-500"}`}>
              {hasPRs ? (leadTimeDelta <= 0 ? `▼ ${Math.abs(leadTimeDelta)}% faster` : `▲ ${leadTimeDelta}% slower`) : "No PRs recorded"}
            </div>
          </div>
        </div>

        {/* Time to First Review */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3.5 flex items-center justify-between hover:border-zinc-700 transition">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/60">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-200">Time to First Review (TTFR)</div>
              <p className="text-[11px] text-zinc-400 mt-0.5">Initial reviewer response latency after PR creation</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono font-bold text-white tabular-nums">
              {hasPRs ? `${ttfr.toFixed(1)} hrs` : "-"}
            </div>
            <div className={`text-[10px] font-mono font-semibold ${hasPRs ? (ttfrDelta <= 0 ? "text-emerald-400" : "text-rose-400") : "text-zinc-500"}`}>
              {hasPRs ? (ttfrDelta <= 0 ? `▼ ${Math.abs(ttfrDelta)}% faster` : `▲ ${ttfrDelta}% slower`) : "No PRs recorded"}
            </div>
          </div>
        </div>

        {/* PR Size Distribution */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3.5 flex items-center justify-between hover:border-zinc-700 transition">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/60">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-200">PR Size Hygiene</span>
                <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                  {actualTotalDist > 0 ? `${Math.round((prDist.small / totalDist) * 100)}% Small` : "0 PR"}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">Ideal PR size &lt;200 LoC for rapid, high-quality reviews</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {/* Segmented breakdown bar */}
            <div className="w-24 h-2 rounded-full overflow-hidden flex bg-zinc-800">
              {actualTotalDist > 0 ? (
                <>
                  <div style={{ width: `${(prDist.small / totalDist) * 100}%` }} className="bg-emerald-500 h-full" title={`Small: ${prDist.small}`} />
                  <div style={{ width: `${(prDist.medium / totalDist) * 100}%` }} className="bg-amber-500 h-full" title={`Medium: ${prDist.medium}`} />
                  <div style={{ width: `${(prDist.large / totalDist) * 100}%` }} className="bg-rose-500 h-full" title={`Large: ${prDist.large}`} />
                </>
              ) : (
                <div className="w-full h-full bg-zinc-800" title="No PR data recorded" />
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono">
              <span className="text-emerald-400 font-medium">S:{prDist.small}</span>
              <span className="text-zinc-600">·</span>
              <span className="text-amber-400 font-medium">M:{prDist.medium}</span>
              <span className="text-zinc-600">·</span>
              <span className="text-rose-400 font-medium">L:{prDist.large}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

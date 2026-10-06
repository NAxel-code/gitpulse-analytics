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
import { BorderBeam } from "./magicui/border-beam";

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
      highlight: true, // Uses Magic UI Border Beam
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

  const leadTime = data.lead_time_hours ?? 16.5;
  const leadTimeDelta = data.lead_time_change_pct ?? -12.4;
  const ttfr = data.time_to_first_review_hours ?? 3.6;
  const ttfrDelta = data.ttfr_change_pct ?? -18.2;
  const prDist = data.pr_size_distribution ?? { small: 22, medium: 14, large: 6 };
  const totalDist = prDist.small + prDist.medium + prDist.large || 1;

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
              className={`relative overflow-hidden rounded-xl border bg-zinc-900/70 p-5 shadow-sm transition hover:border-zinc-700/80 ${
                kpi.highlight ? "border-violet-500/40 bg-zinc-900/90" : "border-zinc-800/80"
              }`}
            >
              {kpi.highlight && (
                <BorderBeam size={180} duration={8} borderWidth={1.5} colorFrom="#8b5cf6" colorTo="#38bdf8" />
              )}

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
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-1">
                <NumberTicker
                  value={kpi.value}
                  decimalPlaces={kpi.decimalPlaces || 0}
                  className="text-3xl font-extrabold text-white"
                />
                {kpi.suffix && <span className="text-2xl font-bold text-white">{kpi.suffix}</span>}
              </div>

              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-zinc-500 text-[11px] truncate max-w-[130px]">{kpi.subtitle}</span>
                <div
                  className={`flex items-center gap-0.5 font-semibold ${
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
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-3.5 flex items-center justify-between hover:border-zinc-700/80 transition">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-zinc-200">DORA Lead Time to Merge</span>
                <span className="text-[10px] rounded bg-cyan-500/15 text-cyan-300 px-1 py-0.2 font-mono">DORA</span>
              </div>
              <p className="text-[11px] text-zinc-500">Waktu dari commit pertama hingga main merge</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-white">{leadTime.toFixed(1)} hrs</div>
            <div className={`text-[10px] font-semibold ${leadTimeDelta <= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {leadTimeDelta <= 0 ? `▼ ${Math.abs(leadTimeDelta)}% faster` : `▲ ${leadTimeDelta}% slower`}
            </div>
          </div>
        </div>

        {/* Time to First Review */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-3.5 flex items-center justify-between hover:border-zinc-700/80 transition">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-zinc-200">Time to First Review (TTFR)</span>
                <span className="text-[10px] rounded bg-violet-500/15 text-violet-300 px-1 py-0.2 font-mono">Speed</span>
              </div>
              <p className="text-[11px] text-zinc-500">Respon reviewer awal sejak PR dibuka</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-white">{ttfr.toFixed(1)} hrs</div>
            <div className={`text-[10px] font-semibold ${ttfrDelta <= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {ttfrDelta <= 0 ? `▼ ${Math.abs(ttfrDelta)}% faster` : `▲ ${ttfrDelta}% slower`}
            </div>
          </div>
        </div>

        {/* PR Size Distribution */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-3.5 flex items-center justify-between hover:border-zinc-700/80 transition">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-zinc-200">PR Size Hygiene</span>
                <span className="text-[10px] text-emerald-400 font-medium">{Math.round((prDist.small / totalDist) * 100)}% Small</span>
              </div>
              <p className="text-[11px] text-zinc-500">Ukuran PR ideal &lt;200 LoC untuk review cepat</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-mono text-emerald-400" title="Small (<200 LoC)">
              S: {prDist.small}
            </span>
            <span className="rounded-md bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-[10px] font-mono text-amber-400" title="Medium (200-500 LoC)">
              M: {prDist.medium}
            </span>
            <span className="rounded-md bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.5 text-[10px] font-mono text-rose-400" title="Large (>500 LoC)">
              L: {prDist.large}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

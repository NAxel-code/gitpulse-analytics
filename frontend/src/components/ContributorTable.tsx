"use client";

import { useState } from "react";
import { Search, ArrowUpDown, Award, Flame, Zap, TrendingUp, ChevronRight } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export interface ContributorItem {
  login: string;
  avatar_url: string;
  commits: number;
  prs_opened: number;
  prs_merged: number;
  issues_closed: number;
  lines_added: number;
  lines_deleted: number;
  velocity_score: number;
  rank?: number;
  rank_badge?: string;
  momentum_tag?: string;
}

interface ContributorTableProps {
  data: ContributorItem[];
  onSelectContributor?: (login: string) => void;
}

export function ContributorTable({ data, onSelectContributor }: ContributorTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof ContributorItem>("velocity_score");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = data
    .filter((item) => item.login.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === "number" && typeof valB === "number") {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA ?? "").localeCompare(String(valB ?? ""))
        : String(valB ?? "").localeCompare(String(valA ?? ""));
    });

  const handleSort = (field: keyof ContributorItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const getRankBadgeDisplay = (badge?: string, rank?: number) => {
    if (badge === "gold" || rank === 1) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-500/40">
          🥇 Gold
        </span>
      );
    }
    if (badge === "silver" || rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-slate-300/20 px-2 py-0.5 text-[11px] font-bold text-slate-200 border border-slate-300/40">
          🥈 Silver
        </span>
      );
    }
    if (badge === "bronze" || rank === 3) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-700/20 px-2 py-0.5 text-[11px] font-bold text-amber-500 border border-amber-700/40">
          🥉 Bronze
        </span>
      );
    }
    return (
      <span className="text-[11px] font-mono text-zinc-500 px-1">
        #{rank ?? "-"}
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-violet-400" />
            <h3 className="font-semibold text-zinc-100 text-sm md:text-base">
              Contributor Engineering Velocity &amp; Momentum
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Peringkat gaya Kalodata &amp; klik kontributor untuk melihat Woopra-style action journey
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-60">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Cari kontributor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="border-b border-zinc-800 bg-zinc-950/50 text-[11px] uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="py-2.5 px-3">Tier</th>
              <th className="py-2.5 px-3">Developer</th>
              <th
                onClick={() => handleSort("commits")}
                className="py-2.5 px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Commits</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("prs_merged")}
                className="py-2.5 px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>PRs Merged</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("lines_added")}
                className="py-2.5 px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Lines +/-</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("velocity_score")}
                className="py-2.5 px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Velocity &amp; Momentum</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-2.5 px-2 text-right">Journey</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center">
                  <p className="text-xs font-medium text-zinc-300">
                    {search
                      ? `Tidak ditemukan kontributor yang cocok dengan "${search}".`
                      : "Belum ada data kontributor untuk repositori ini."}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    {search
                      ? "Periksa kembali ejaan username atau hapus filter pencarian."
                      : "Klik tombol 'Sync Live Repo' di navigasi atas untuk memuat data GitHub."}
                  </p>
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="mt-3 inline-flex items-center rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs text-zinc-200 hover:bg-zinc-700 transition"
                    >
                      Reset Filter
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filtered.slice(0, 10).map((dev, idx) => {
                return (
                  <tr
                    key={idx}
                    onClick={() => onSelectContributor?.(dev.login)}
                    className="hover:bg-zinc-800/50 cursor-pointer transition group"
                    title={`Klik untuk melihat riwayat aktivitas @${dev.login}`}
                  >
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {getRankBadgeDisplay(dev.rank_badge, dev.rank ?? idx + 1)}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={dev.avatar_url}
                        alt={dev.login}
                        className="h-6 w-6 rounded-full border border-zinc-700 bg-zinc-800 object-cover"
                      />
                      <span className="font-semibold text-white group-hover:text-violet-400 transition">
                        @{dev.login}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-white tabular-nums">
                    {formatNumber(dev.commits)}
                  </td>
                  <td className="py-2.5 px-3 tabular-nums">
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-medium text-emerald-400">
                      {dev.prs_merged} merged
                    </span>
                  </td>
                  <td className="py-2.5 px-3 tabular-nums font-mono text-[11px]">
                    <span className="text-emerald-400">+{formatNumber(dev.lines_added)}</span>
                    <span className="text-zinc-600 mx-1">/</span>
                    <span className="text-rose-400">-{formatNumber(dev.lines_deleted)}</span>
                  </td>
                  <td className="py-2.5 px-3 tabular-nums">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-violet-300">
                        {dev.velocity_score} pts
                      </span>
                      {dev.momentum_tag && (
                        <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.2 rounded border border-zinc-700/50">
                          {dev.momentum_tag}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-violet-400 transition inline" />
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

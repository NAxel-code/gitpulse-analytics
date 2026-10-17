"use client";

import { useState, useEffect } from "react";
import {
  GitBranch,
  GitPullRequest,
  Sparkles,
  RefreshCw,
  Calendar,
  Key,
  Check,
  X,
  HelpCircle,
  Plus,
  Search,
  FolderGit2,
  Trophy,
} from "lucide-react";

interface HeaderProps {
  currentRepo: string;
  onRepoChange: (repo: string) => void;
  onSyncRepo: (repo: string) => void;
  syncing: boolean;
  days: number;
  onDaysChange: (days: number) => void;
  onOpenAI: () => void;
  githubToken: string;
  onTokenChange: (token: string) => void;
  onOpenHelp?: () => void;
  onOpenLeaderboard?: () => void;
}

export function Header({
  currentRepo,
  onRepoChange,
  onSyncRepo,
  syncing,
  days,
  onDaysChange,
  onOpenAI,
  githubToken,
  onTokenChange,
  onOpenHelp,
  onOpenLeaderboard,
}: HeaderProps) {
  const [repoInput, setRepoInput] = useState(currentRepo);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showRepoModal, setShowRepoModal] = useState(false);
  const [customRepo, setCustomRepo] = useState("");
  const [repoError, setRepoError] = useState("");
  const [tempToken, setTempToken] = useState(githubToken);

  useEffect(() => {
    setTempToken(githubToken);
  }, [githubToken]);

  const presets = [
    "vercel/next.js",
    "facebook/react",
    "tailwindlabs/tailwindcss",
    "NAxel-code/gitpulse-analytics",
  ];

  const handleSelectPreset = (repo: string) => {
    setRepoInput(repo);
    onRepoChange(repo);
  };

  const handleCustomRepoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customRepo
      .trim()
      .replace(/^https?:\/\/github\.com\//i, "")
      .replace(/\/$/, "");
    if (!trimmed.includes("/") || trimmed.split("/").length !== 2) {
      setRepoError("Format repositori harus: owner/nama-repo (contoh: NAxel-code/gitpulse-analytics)");
      return;
    }
    setRepoError("");
    setRepoInput(trimmed);
    onRepoChange(trimmed);
    setShowRepoModal(false);
    setCustomRepo("");
  };

  const handleSaveToken = () => {
    onTokenChange(tempToken.trim());
    setShowTokenModal(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 border-b border-zinc-800/80 bg-zinc-950/90 px-6 py-3 backdrop-blur-md">
        {/* Brand & Repository Switcher */}
        <div id="tour-repo-sync" className="flex flex-wrap items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-100 shadow-sm">
            <GitPullRequest className="h-4 w-4 text-zinc-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-base">GitPulse</span>
              <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[10px] font-mono font-medium text-zinc-300 border border-zinc-700/60">
                v1.1
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <GitBranch className="h-3.5 w-3.5 text-zinc-400" />
              <span>Target:</span>
              <button
                onClick={() => setShowRepoModal(true)}
                className="font-mono text-zinc-200 font-semibold hover:text-indigo-300 underline decoration-dotted underline-offset-2 transition cursor-pointer"
                title="Klik untuk memilih atau mengganti repositori GitHub publik mana pun"
              >
                {currentRepo}
              </button>
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 ml-1" />
              <span className="text-[11px] font-medium text-emerald-400">Live</span>
            </div>
          </div>

          {/* Quick Repo Pills */}
          <div className="hidden sm:flex items-center gap-1 ml-2">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => handleSelectPreset(p)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-mono transition cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none ${
                  currentRepo === p
                    ? "bg-zinc-800 text-zinc-100 border border-zinc-600 font-semibold shadow-xs"
                    : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-transparent"
                }`}
              >
                {p.split("/")[1]}
              </button>
            ))}
            {/* Custom Repo Button */}
            <button
              onClick={() => setShowRepoModal(true)}
              className="rounded-lg px-2 py-1 text-[11px] font-mono border border-dashed border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:text-white hover:border-zinc-500 hover:bg-zinc-800 transition flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
              title="Analisis repositori publik GitHub apa saja di seluruh dunia"
            >
              <Plus className="h-3 w-3 text-indigo-400" />
              <span>Ganti Repo...</span>
            </button>

            {/* Leaderboard Button */}
            <button
              onClick={onOpenLeaderboard}
              className="rounded-lg px-2.5 py-1 text-[11px] font-mono border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:text-white hover:border-amber-400 hover:bg-amber-500/20 transition flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
              title="Lihat Benchmark Leaderboard Repositori berdasarkan Bintang, Lisensi, dan Velocity"
            >
              <Trophy className="h-3 w-3 text-amber-400" />
              <span>Leaderboard</span>
            </button>
          </div>
        </div>

        {/* Center Search / AI Query Box */}
        <div className="w-full xl:w-auto flex-1 max-w-sm sm:max-w-md mx-auto min-w-[200px]">
          <button
            id="tour-ai-search"
            onClick={onOpenAI}
            className="group flex w-full h-9 items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 text-xs text-zinc-400 shadow-xs transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none overflow-hidden"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Sparkles className="h-4 w-4 shrink-0 text-indigo-400 transition group-hover:rotate-6" />
              <span className="truncate whitespace-nowrap text-zinc-300 text-left">
                <span className="font-semibold text-indigo-300">Tanya AI:</span>{" "}
                <span className="text-zinc-400 hidden md:inline">&quot;Top contributor dengan PR merge terbanyak&quot;</span>
                <span className="text-zinc-400 md:hidden">&quot;Top contributor...&quot;</span>
              </span>
            </div>
            <kbd className="shrink-0 hidden sm:inline-flex items-center rounded border border-zinc-700/80 bg-zinc-800/90 px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-300">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Actions: PAT Token, Sync Button, Date Range & Guide */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
          {/* GitHub Token / PAT Button */}
          <button
            onClick={() => setShowTokenModal(true)}
            title={githubToken ? "GitHub Token Aktif (5.000 req/jam)" : "Atur Personal Access Token untuk bypass rate limit 60 req/jam"}
            className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none ${
              githubToken
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700"
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{githubToken ? "Token Active" : "Set PAT"}</span>
          </button>

          {/* Sync Button */}
          <button
            onClick={() => onSyncRepo(currentRepo)}
            disabled={syncing}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700 disabled:opacity-50 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-indigo-400 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Syncing..." : "Sync Live Repo"}</span>
          </button>

          {/* Date Range Selector */}
          <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900/70 p-1">
            <Calendar className="ml-2 mr-1 h-3.5 w-3.5 text-zinc-400" />
            {[
              { label: "7D", value: 7 },
              { label: "14D", value: 14 },
              { label: "30D", value: 30 },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => onDaysChange(item.value)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none ${
                  days === item.value
                    ? "bg-zinc-100 text-zinc-950 font-semibold shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Leaderboard Action Button */}
          <button
            onClick={onOpenLeaderboard}
            title="Buka Benchmark Leaderboard Repositori"
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 hover:bg-amber-500/20 hover:border-amber-500/50 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
          >
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Leaderboard</span>
          </button>

          {/* Help & Guide Button */}
          <button
            onClick={onOpenHelp}
            title="Panduan & Tutorial GitPulse (Tekan '?')"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-850 hover:border-zinc-700 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
          >
            <HelpCircle className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Panduan</span>
          </button>
        </div>
      </header>

      {/* GitHub PAT Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-violet-400" />
                <h3 className="font-semibold text-white text-sm">GitHub Personal Access Token</h3>
              </div>
              <button
                onClick={() => setShowTokenModal(false)}
                className="rounded-lg p-1 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
              Secara default GitHub membatasi <strong>60 request/jam</strong> tanpa token. Masukkan token GitHub Anda (read-only) untuk menaikkan limit hingga <strong>5.000 request/jam</strong>.
            </p>

            <div className="mt-4 space-y-3">
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={tempToken}
                onChange={(e) => setTempToken(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none"
              />
              <div className="flex justify-between items-center text-[11px] text-zinc-500">
                <span>Tersimpan lokal di browser (localStorage)</span>
                {githubToken && (
                  <button
                    onClick={() => {
                      setTempToken("");
                      onTokenChange("");
                      setShowTokenModal(false);
                    }}
                    className="text-rose-400 hover:underline"
                  >
                    Hapus Token
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowTokenModal(false)}
                className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-900"
              >
                Batal
              </button>
              <button
                onClick={handleSaveToken}
                className="flex items-center gap-1 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 px-4 py-1.5 text-xs font-semibold shadow-xs transition-colors"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Simpan Token</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Repository Switcher Modal */}
      {showRepoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-700/80 text-zinc-200">
                  <FolderGit2 className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100 text-sm md:text-base">
                    Ganti / Analisis Repositori GitHub
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    GitPulse dapat menganalisis repositori publik GitHub apa pun di dunia
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowRepoModal(false);
                  setRepoError("");
                }}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCustomRepoSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">
                  Nama Repositori GitHub:
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Ketik owner/nama-repo (misal: NAxel-code/gitpulse-analytics)"
                    value={customRepo}
                    onChange={(e) => {
                      setCustomRepo(e.target.value);
                      if (repoError) setRepoError("");
                    }}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-8 pr-3.5 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 focus:outline-none transition-colors"
                  />
                </div>
                {repoError && (
                  <p className="text-[11px] text-rose-400 mt-1">{repoError}</p>
                )}
              </div>

              {/* Popular & Suggested Repositories */}
              <div className="pt-2">
                <span className="text-[11px] font-mono text-zinc-400 block mb-1.5">
                  Pilihan Populer / Cepat:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "NAxel-code/gitpulse-analytics",
                    "vercel/next.js",
                    "facebook/react",
                    "tailwindlabs/tailwindcss",
                    "shadcn-ui/ui",
                    "oven-sh/bun",
                    "torvalds/linux",
                  ].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setCustomRepo(r);
                        setRepoError("");
                      }}
                      className={`rounded-md border px-2 py-1 text-[11px] font-mono transition ${
                        r === currentRepo
                          ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                          : "border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-700 hover:text-white hover:bg-zinc-800"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRepoModal(false);
                    setRepoError("");
                  }}
                  className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!customRepo.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-4 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-white disabled:opacity-40 transition-colors shadow-xs"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Muat &amp; Analisis Repositori</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { GitBranch, GitPullRequest, Sparkles, RefreshCw, Calendar, Key, Check, X } from "lucide-react";

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
}: HeaderProps) {
  const [repoInput, setRepoInput] = useState(currentRepo);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tempToken, setTempToken] = useState(githubToken);

  useEffect(() => {
    setTempToken(githubToken);
  }, [githubToken]);

  const presets = ["vercel/next.js", "facebook/react", "tailwindlabs/tailwindcss"];

  const handleSelectPreset = (repo: string) => {
    setRepoInput(repo);
    onRepoChange(repo);
  };

  const handleSaveToken = () => {
    onTokenChange(tempToken.trim());
    setShowTokenModal(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 border-b border-zinc-800/80 bg-zinc-950/85 px-6 py-3 backdrop-blur-md">
        {/* Brand & Repository Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-lg shadow-indigo-500/20">
            <GitPullRequest className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-base">GitPulse</span>
              <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400 border border-violet-500/20">
                v1.1 Intelligence
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <GitBranch className="h-3.5 w-3.5 text-zinc-500" />
              <span>Target Repo:</span>
              <span className="font-mono text-zinc-200 font-semibold">{currentRepo}</span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping ml-1" />
              <span className="text-[10px] text-emerald-400">Live Ingesting</span>
            </div>
          </div>

          {/* Quick Repo Pills */}
          <div className="hidden sm:flex items-center gap-1 ml-2">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => handleSelectPreset(p)}
                className={`rounded-lg px-2 py-1 text-[11px] font-mono transition ${
                  currentRepo === p
                    ? "bg-zinc-800 text-indigo-400 border border-indigo-500/40 font-semibold"
                    : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                {p.split("/")[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Center Search / AI Query Box */}
        <div className="w-full lg:w-auto flex-1 max-w-md mx-auto">
          <button
            onClick={onOpenAI}
            className="group flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 text-sm text-zinc-400 shadow-inner transition hover:border-violet-500/50 hover:bg-zinc-900"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-400 transition group-hover:rotate-12" />
              <span className="text-xs md:text-sm text-zinc-300">Tanya AI: &quot;Top contributor dengan PR merge terbanyak&quot;</span>
            </div>
            <kbd className="hidden sm:inline-block rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Actions: PAT Token, Sync Button & Date Range */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
          {/* GitHub Token / PAT Button */}
          <button
            onClick={() => setShowTokenModal(true)}
            title={githubToken ? "GitHub Token Aktif (5,000 req/h)" : "Atur Personal Access Token untuk bypass rate limit 60 req/h"}
            className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition ${
              githubToken
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{githubToken ? "Token Active" : "Set PAT"}</span>
          </button>

          {/* Sync Button */}
          <button
            onClick={() => onSyncRepo(currentRepo)}
            disabled={syncing}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700 disabled:opacity-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-violet-400 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Syncing..." : "Sync Live Repo"}</span>
          </button>

          {/* Date Range Selector */}
          <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900/60 p-1">
            <Calendar className="ml-2 mr-1 h-3.5 w-3.5 text-zinc-400" />
            {[
              { label: "7D", value: 7 },
              { label: "14D", value: 14 },
              { label: "30D", value: 30 },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => onDaysChange(item.value)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  days === item.value
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
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
                className="flex items-center gap-1 rounded-lg bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-violet-500"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Simpan Token</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

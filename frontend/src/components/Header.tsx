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
  Star,
  Loader2,
  Globe,
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
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategoryPills, setSelectedCategoryPills] = useState<string>("all");

  useEffect(() => {
    setTempToken(githubToken);
  }, [githubToken]);

  // Live GitHub search autocomplete
  useEffect(() => {
    const q = customRepo.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/github/search?q=${encodeURIComponent(q)}`, {
          headers: githubToken ? { Authorization: `Bearer ${githubToken.trim()}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.items || []);
        }
      } catch (err) {
        console.warn("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [customRepo, githubToken]);

  const featuredPresets = [
    {
      repo: "ollama/ollama",
      label: "ollama",
      category: "AI",
      icon: "🤖",
      stars: "118k",
      tooltip: "Local AI & Large Language Model Runner (118k ⭐)",
    },
    {
      repo: "astral-sh/uv",
      label: "uv",
      category: "Systems",
      icon: "🦀",
      stars: "49k",
      tooltip: "Ultra-Fast Python Package Manager in Rust (49k ⭐)",
    },
    {
      repo: "vercel/next.js",
      label: "next.js",
      category: "Web",
      icon: "🌐",
      stars: "128k",
      tooltip: "The React Framework for the Web (128k ⭐)",
    },
    {
      repo: "kubernetes/kubernetes",
      label: "kubernetes",
      category: "DevOps",
      icon: "☸️",
      stars: "113k",
      tooltip: "Production-Grade Container Orchestration (113k ⭐)",
    },
    {
      repo: "NAxel-code/gitpulse-analytics",
      label: "gitpulse",
      category: "Featured",
      icon: "⚡",
      stars: "Self",
      tooltip: "GitPulse Analytics Platform (Author Project)",
      isHero: true,
    },
  ];

  const universalPresets = [
    { name: "NAxel-code/gitpulse-analytics", category: "personal", label: "GitPulse (Your Repo)", lang: "TypeScript" },
    { name: "vllm-project/vllm", category: "ai", label: "vLLM (AI Inference)", lang: "Python" },
    { name: "huggingface/transformers", category: "ai", label: "Transformers", lang: "Python" },
    { name: "ollama/ollama", category: "ai", label: "Ollama (Local LLM)", lang: "Go" },
    { name: "astral-sh/uv", category: "systems", label: "uv (Fast Python)", lang: "Rust" },
    { name: "torvalds/linux", category: "systems", label: "Linux Kernel", lang: "C" },
    { name: "oven-sh/bun", category: "systems", label: "Bun Runtime", lang: "Zig" },
    { name: "kubernetes/kubernetes", category: "devops", label: "Kubernetes", lang: "Go" },
    { name: "prometheus/prometheus", category: "devops", label: "Prometheus", lang: "Go" },
    { name: "flutter/flutter", category: "mobile", label: "Flutter", lang: "Dart" },
    { name: "facebook/react-native", category: "mobile", label: "React Native", lang: "C++ / JS" },
    { name: "vercel/next.js", category: "web", label: "Next.js", lang: "TypeScript" },
    { name: "facebook/react", category: "web", label: "React", lang: "JavaScript" },
    { name: "tailwindlabs/tailwindcss", category: "web", label: "Tailwind CSS", lang: "CSS" },
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
      setRepoError("Repository format must be: owner/repo-name (e.g. NAxel-code/gitpulse-analytics)");
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
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md">
        {/* Tier 1: Primary Navigation Bar */}
        <div className="flex items-center justify-between gap-4 px-6 py-2.5">
          {/* Brand & Active Target Repository */}
          <div id="tour-repo-sync" className="flex items-center gap-3 shrink-0">
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
                <GitBranch className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <span className="text-zinc-500">Target:</span>
                <button
                  onClick={() => setShowRepoModal(true)}
                  className="font-mono text-zinc-200 font-semibold hover:text-indigo-300 underline decoration-dotted underline-offset-2 transition cursor-pointer max-w-[200px] truncate"
                  title="Click to select or switch to any public GitHub repository"
                >
                  {currentRepo}
                </button>
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 ml-0.5 shrink-0" />
                <span className="text-[11px] font-medium text-emerald-400">Live</span>
              </div>
            </div>
          </div>

          {/* Center Search / AI Query Box */}
          <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-2">
            <button
              id="tour-ai-search"
              onClick={onOpenAI}
              className="group flex w-full h-9 items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 text-xs text-zinc-400 shadow-xs transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none overflow-hidden"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Search className="h-4 w-4 shrink-0 text-indigo-400 transition group-hover:scale-110" />
                <span className="truncate whitespace-nowrap text-zinc-300 text-left">
                  <span className="font-semibold text-indigo-300">Search:</span>{" "}
                  <span className="text-zinc-400 hidden lg:inline">&quot;Search repositories, @devs, or ask AI...&quot;</span>
                  <span className="text-zinc-400 lg:hidden">&quot;Search or ask AI...&quot;</span>
                </span>
              </div>
              <kbd className="shrink-0 hidden sm:inline-flex items-center rounded border border-zinc-700/80 bg-zinc-800/90 px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-300">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Toolbar: Date Range, Sync, Leaderboard, Token, Guide */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile AI Button */}
            <button
              onClick={onOpenAI}
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-indigo-400 hover:bg-zinc-800"
              title="Ask AI (⌘K)"
            >
              <Sparkles className="h-4 w-4" />
            </button>

            {/* Date Range Selector */}
            <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900/70 p-0.5">
              <Calendar className="ml-2 mr-1 h-3.5 w-3.5 text-zinc-400 shrink-0" />
              {[
                { label: "7D", value: 7 },
                { label: "14D", value: 14 },
                { label: "30D", value: 30 },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => onDaysChange(item.value)}
                  className={`rounded-lg px-2 py-1 text-xs font-medium transition cursor-pointer ${
                    days === item.value
                      ? "bg-zinc-100 text-zinc-950 font-semibold shadow-xs"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Sync Button */}
            <button
              onClick={() => onSyncRepo(currentRepo)}
              disabled={syncing}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700 disabled:opacity-50 transition cursor-pointer whitespace-nowrap"
              title="Synchronize repository data with GitHub"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-indigo-400 ${syncing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{syncing ? "Syncing..." : "Sync Repo"}</span>
            </button>

            {/* Leaderboard Action Button */}
            <button
              onClick={onOpenLeaderboard}
              title="Open Repository Benchmark Leaderboard"
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 hover:bg-amber-500/20 hover:border-amber-500/50 transition cursor-pointer whitespace-nowrap"
            >
              <Trophy className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Leaderboard</span>
            </button>

            {/* GitHub Token / PAT Button */}
            <button
              onClick={() => setShowTokenModal(true)}
              title={githubToken ? "GitHub Token Active (5,000 req/hr)" : "Set Personal Access Token to bypass 60 req/hr limit"}
              className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                githubToken
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                  : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700"
              }`}
            >
              <Key className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden md:inline">{githubToken ? "Token Active" : "Set PAT"}</span>
            </button>

            {/* Help & Guide Button */}
            <button
              onClick={onOpenHelp}
              title="GitPulse Documentation & Guide (Press '?')"
              className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-850 hover:border-zinc-700 transition cursor-pointer whitespace-nowrap"
            >
              <HelpCircle className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span className="hidden md:inline">Guide</span>
            </button>
          </div>
        </div>

        {/* Tier 2: Dedicated Featured Repositories Subnav Strip */}
        <div className="flex items-center gap-2 px-6 py-2 border-t border-zinc-800/50 bg-zinc-950/60 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-mono text-zinc-500 shrink-0 flex items-center gap-1.5 mr-1">
            <Globe className="h-3 w-3 text-indigo-400" />
            <span>Featured:</span>
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            {featuredPresets.map((p) => {
              const isActive = currentRepo.toLowerCase() === p.repo.toLowerCase();
              return (
                <button
                  key={p.repo}
                  onClick={() => handleSelectPreset(p.repo)}
                  title={p.tooltip}
                  className={`group relative flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? p.isHero
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-semibold shadow-xs"
                        : "bg-indigo-500/15 text-indigo-200 border border-indigo-500/40 font-semibold shadow-xs"
                      : p.isHero
                      ? "bg-zinc-900/80 text-emerald-400/90 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300"
                      : "bg-zinc-900/60 text-zinc-400 border border-zinc-800/80 hover:text-zinc-200 hover:bg-zinc-850 hover:border-zinc-700"
                  }`}
                >
                  <span className="text-[11px] group-hover:scale-110 transition-transform">{p.icon}</span>
                  <span className="font-medium">{p.label}</span>
                  {p.isHero && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                  )}
                </button>
              );
            })}

            {/* Custom Repo Button */}
            <button
              id="btn-ganti-repo"
              onClick={() => setShowRepoModal(true)}
              className="rounded-lg px-2.5 py-1 text-xs font-mono border border-dashed border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:text-white hover:border-zinc-500 hover:bg-zinc-800 transition flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 ml-1"
              title="Analyze any public GitHub repository worldwide"
            >
              <Plus className="h-3 w-3 text-indigo-400" />
              <span>Switch Repo...</span>
            </button>
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
              By default GitHub limits unauthenticated requests to <strong>60 requests/hour</strong>. Enter your personal GitHub token (read-only) to increase your quota up to <strong>5,000 requests/hour</strong>.
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
                <span>Stored locally in your browser (localStorage)</span>
                {githubToken && (
                  <button
                    onClick={() => {
                      setTempToken("");
                      onTokenChange("");
                      setShowTokenModal(false);
                    }}
                    className="text-rose-400 hover:underline"
                  >
                    Remove Token
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowTokenModal(false)}
                className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveToken}
                className="flex items-center gap-1 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 px-4 py-1.5 text-xs font-semibold shadow-xs transition-colors"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save Token</span>
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
                    Switch / Analyze GitHub Repository
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    GitPulse can analyze any public GitHub repository worldwide
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
                  GitHub Repository Name (Universal):
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    id="input-custom-repo"
                    type="text"
                    autoFocus
                    placeholder="Type owner/repo-name (e.g., astral-sh/uv, vllm-project/vllm, torvalds/linux)..."
                    value={customRepo}
                    onChange={(e) => {
                      setCustomRepo(e.target.value);
                      if (repoError) setRepoError("");
                    }}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-9 pr-8 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-2.5 h-3.5 w-3.5 text-indigo-400 animate-spin" />
                  )}
                </div>
                {repoError && (
                  <p className="text-[11px] text-rose-400 mt-1">{repoError}</p>
                )}

                {/* Live Autocomplete Results from GitHub Search */}
                {searchResults.length > 0 && (
                  <div
                    id="autocomplete-dropdown"
                    className="mt-2 rounded-xl border border-zinc-800 bg-zinc-900/95 max-h-48 overflow-y-auto divide-y divide-zinc-800/80 shadow-lg"
                  >
                    {searchResults.map((sr) => (
                      <button
                        key={sr.full_name}
                        type="button"
                        onClick={() => {
                          setCustomRepo(sr.full_name);
                          setSearchResults([]);
                          setRepoError("");
                        }}
                        className="w-full text-left p-2.5 hover:bg-zinc-800/80 transition flex items-start justify-between gap-3 cursor-pointer group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-white group-hover:text-indigo-300">
                              {sr.full_name}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">
                              {sr.language}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                            {sr.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-300 shrink-0">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>{sr.stars_formatted}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Multi-Sector Preset Selector */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-zinc-400">
                    Multi-Sector &amp; Language Presets:
                  </span>
                  {/* Category Filter Mini Tabs */}
                  <div className="flex items-center gap-1 text-[10px] font-mono">
                    {[
                      { id: "all", label: "All" },
                      { id: "ai", label: "🤖 AI" },
                      { id: "systems", label: "🦀 Systems" },
                      { id: "devops", label: "⚙️ DevOps" },
                      { id: "web", label: "🌐 Web" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategoryPills(cat.id)}
                        className={`px-1.5 py-0.5 rounded transition ${
                          selectedCategoryPills === cat.id
                            ? "bg-zinc-800 text-zinc-100 font-semibold"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {universalPresets
                    .filter((p) => selectedCategoryPills === "all" || p.category === selectedCategoryPills)
                    .map((r) => (
                      <button
                        key={r.name}
                        type="button"
                        onClick={() => {
                          handleSelectPreset(r.name);
                          setShowRepoModal(false);
                          setCustomRepo("");
                          setRepoError("");
                          setSearchResults([]);
                        }}
                        className={`rounded-md border px-2 py-1 text-[11px] font-mono transition flex items-center gap-1 cursor-pointer ${
                          r.name === currentRepo
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-semibold"
                            : "border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-700 hover:text-white hover:bg-zinc-800"
                        }`}
                        title={`${r.label} (${r.lang})`}
                      >
                        <span>{r.name}</span>
                        <span className="text-[9px] text-zinc-500">[{r.lang}]</span>
                      </button>
                    ))}
                </div>
              </div>

              {/* Direct Leaderboard Banner */}
              {onOpenLeaderboard && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-400 shrink-0" />
                    <span className="text-[11px] text-zinc-300">
                      Want full comparison of stars, licenses, &amp; velocity?
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRepoModal(false);
                      onOpenLeaderboard();
                    }}
                    className="font-semibold text-[11px] text-amber-400 hover:text-amber-300 hover:underline shrink-0 cursor-pointer"
                  >
                    Open Leaderboard &rarr;
                  </button>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRepoModal(false);
                    setRepoError("");
                    setSearchResults([]);
                  }}
                  className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customRepo.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-4 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-white disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Load &amp; Analyze Repository</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

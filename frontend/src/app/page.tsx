"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { KPICards } from "@/components/KPICards";
import { ActivityChart } from "@/components/ActivityChart";
import { FunnelChart } from "@/components/FunnelChart";
import { ContributorTable } from "@/components/ContributorTable";
import { ContributorJourneyModal } from "@/components/ContributorJourneyModal";
import { DORAFeed } from "@/components/DORAFeed";
import { AIModal } from "@/components/AIModal";
import { HelpTourModal } from "@/components/HelpTourModal";
import { RepoLeaderboardModal } from "@/components/RepoLeaderboardModal";
import { GITHUB_API_URL } from "@/lib/api";
import { getFallbackDashboardData } from "@/lib/fallback";

export default function GitPulseDashboard() {
  const [currentRepo, setCurrentRepo] = useState("vercel/next.js");
  const [days, setDays] = useState(14);
  const [githubToken, setGithubToken] = useState("");
  const [kpiData, setKpiData] = useState<any>(null);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [contributors, setContributors] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [executiveSummary, setExecutiveSummary] = useState<any>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [selectedContributor, setSelectedContributor] = useState<string | null>(null);
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Load saved GitHub PAT from localStorage
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("gitpulse_github_token");
      if (savedToken) {
        setGithubToken(savedToken);
      }
    } catch (e) {
      console.warn("Could not read localStorage for token:", e);
    }
  }, []);

  const handleTokenChange = (token: string) => {
    setGithubToken(token);
    try {
      if (token) {
        localStorage.setItem("gitpulse_github_token", token);
      } else {
        localStorage.removeItem("gitpulse_github_token");
      }
    } catch (e) {
      console.warn("Could not write localStorage token:", e);
    }
  };

  // Keyboard shortcut Cmd+K or Ctrl+K for AI modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsAIModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Global shortcut '?' for Help & Documentation modal
  useEffect(() => {
    const handleHelpKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "?" &&
        !isHelpModalOpen &&
        !isTourActive &&
        !isAIModalOpen &&
        !isJourneyModalOpen &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setIsHelpModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleHelpKeyDown);
    return () => window.removeEventListener("keydown", handleHelpKeyDown);
  }, [isHelpModalOpen, isTourActive, isAIModalOpen, isJourneyModalOpen]);

  const fetchData = async (targetRepo = currentRepo) => {
    try {
      const [kpiRes, timelineRes, funnelRes, contribRes, anomalyRes, summaryRes] = await Promise.all([
        fetch(`${GITHUB_API_URL}/overview?repo=${encodeURIComponent(targetRepo)}&days=${days}`).then((r) => r.json()),
        fetch(`${GITHUB_API_URL}/timeline?repo=${encodeURIComponent(targetRepo)}&days=${days}`).then((r) => r.json()),
        fetch(`${GITHUB_API_URL}/pr-funnel?repo=${encodeURIComponent(targetRepo)}&days=${days}`).then((r) => r.json()),
        fetch(`${GITHUB_API_URL}/contributors?repo=${encodeURIComponent(targetRepo)}&days=${days}`).then((r) => r.json()),
        fetch(`${GITHUB_API_URL}/anomalies?repo=${encodeURIComponent(targetRepo)}`).then((r) => r.json()),
        fetch(`${GITHUB_API_URL}/executive-summary?repo=${encodeURIComponent(targetRepo)}`).then((r) => r.json()),
      ]);

      // Use authentic real API responses directly from DuckDB & GitHub
      if (Array.isArray(timelineRes)) {
        setTimelineData(timelineRes);
      }
      if (kpiRes && typeof kpiRes === "object") {
        setKpiData(kpiRes);
      }
      if (Array.isArray(funnelRes)) {
        setFunnelData(funnelRes);
      }
      if (Array.isArray(contribRes)) {
        setContributors(contribRes);
      }
      if (Array.isArray(anomalyRes)) {
        setAnomalies(anomalyRes);
      }
      if (summaryRes && typeof summaryRes === "object") {
        setExecutiveSummary(summaryRes);
      }
    } catch (err) {
      console.warn("API unavailable, falling back to resilient preview dataset:", err);
      const fallback = getFallbackDashboardData(targetRepo, days);
      setKpiData(fallback.kpis);
      setTimelineData(fallback.timeline);
      setFunnelData(fallback.funnel);
      setContributors(fallback.contributors);
      setAnomalies(fallback.anomalies);
      setExecutiveSummary(fallback.executiveSummary);
    }
  };

  const handleSyncRepo = async (repoName: string) => {
    setSyncing(true);
    try {
      await fetch(`${GITHUB_API_URL}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo_name: repoName,
          days: days,
          github_token: githubToken ? githubToken.trim() : undefined,
        }),
      });
      await fetchData(repoName);
    } catch (e) {
      console.error("Sync error:", e);
      await fetchData(repoName);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchData(currentRepo);
  }, [currentRepo, days]);

  const handleOpenJourney = (login: string) => {
    setSelectedContributor(login);
    setIsJourneyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Sticky Header with Token, Sync & Help controls */}
      <Header
        currentRepo={currentRepo}
        onRepoChange={(r) => {
          setCurrentRepo(r);
          handleSyncRepo(r);
        }}
        onSyncRepo={handleSyncRepo}
        syncing={syncing}
        days={days}
        onDaysChange={(d) => setDays(d)}
        onOpenAI={() => setIsAIModalOpen(true)}
        githubToken={githubToken}
        onTokenChange={handleTokenChange}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
      />

      {/* Main Content Bento Grid */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Top: Bento KPI Cards with Number Ticker & DORA Velocity */}
        <div id="tour-kpi-cards">
          <KPICards key={currentRepo} data={kpiData} />
        </div>

        {/* Middle Section: Activity Timeline Chart (65%) vs PR Lifecycle Funnel (35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8">
            <ActivityChart
              data={timelineData}
              repoName={currentRepo}
              onSync={() => handleSyncRepo(currentRepo)}
              isSyncing={syncing}
            />
          </div>
          <div id="tour-pr-funnel" className="lg:col-span-4">
            <FunnelChart stages={funnelData} />
          </div>
        </div>

        {/* Bottom Section: Contributor Velocity Table (60%) vs DORA Feed (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div id="tour-contributors" className="lg:col-span-7">
            <ContributorTable
              data={contributors}
              onSelectContributor={handleOpenJourney}
            />
          </div>
          <div className="lg:col-span-5">
            <DORAFeed alerts={anomalies} summary={executiveSummary} />
          </div>
        </div>
      </main>

      {/* Contributor Action Stream Journey Modal */}
      <ContributorJourneyModal
        isOpen={isJourneyModalOpen}
        onClose={() => setIsJourneyModalOpen(false)}
        login={selectedContributor}
        repoName={currentRepo}
      />

      {/* AI Text-to-Insight Modal */}
      <AIModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        currentRepo={currentRepo}
        onViewJourney={handleOpenJourney}
        onRepoChange={(r) => {
          setCurrentRepo(r);
          handleSyncRepo(r);
        }}
        onSyncRepo={handleSyncRepo}
      />

      {/* Interactive Guided Tour & Feature Help Modal */}
      <HelpTourModal
        isHelpOpen={isHelpModalOpen}
        onCloseHelp={() => setIsHelpModalOpen(false)}
        isTourActive={isTourActive}
        onStartTour={() => setIsTourActive(true)}
        onCloseTour={() => setIsTourActive(false)}
        onSelectRepo={(r) => {
          setCurrentRepo(r);
          handleSyncRepo(r);
        }}
        onOpenAI={() => setIsAIModalOpen(true)}
      />

      {/* Benchmark Repository Leaderboard Modal */}
      <RepoLeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentRepo={currentRepo}
        onSelectRepo={(r) => {
          setCurrentRepo(r);
          handleSyncRepo(r);
        }}
      />
    </div>
  );
}

"use client";
import type { ReactNode } from "react";
import { parseAsString, useQueryState } from "nuqs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeroStats } from "./hero-stats";
import { ActivityChart } from "./activity-chart";
import { QuestionDonut } from "./question-donut";
import { TopicGrid } from "./topic-grid";
import { PeakHours } from "./peak-hours";
import { DifficultyBars } from "./difficulty-bars";
import { LiveFeed } from "./live-feed";
import { TopLearners } from "./top-learners";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "sessions", label: "Learning Sessions" },
  { id: "performance", label: "Performance" },
  { id: "users", label: "Users" },
];

type TabId = (typeof tabs)[number]["id"];

const tabContent: Record<TabId, ReactNode> = {
  overview: (
    <>
      <HeroStats />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityChart />
        </div>
        <QuestionDonut />
      </div>
    </>
  ),
  sessions: (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityChart />
        </div>
        <PeakHours />
      </div>
      <LiveFeed />
    </>
  ),
  performance: (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopicGrid />
        </div>
        <QuestionDonut />
      </div>
      <DifficultyBars />
    </>
  ),
  users: (
    <>
      <HeroStats />
      <TopLearners />
    </>
  ),
};

export function AdminDashboardTabs() {
  const [activeTab, setActiveTab] = useQueryState("tab", parseAsString.withDefault(tabs[0].id));

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-0">
      <div className="px-6">
        <div className="mx-auto max-w-[1600px]">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>

      <main className="p-6">
        <div className="mx-auto max-w-[1600px] space-y-6">
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-0 space-y-6">
              {tabContent[tab.id]}
            </TabsContent>
          ))}
        </div>
      </main>
    </Tabs>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/utils/trpc-client";

export function TopicGrid() {
  const trpc = useTRPC();
  const { data: topics = [] } = useQuery(trpc.admin.getTopicPerformance.queryOptions());
  return (
    <div className="bg-card border-border h-full rounded-3xl border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Topic Performance</h3>
        <p className="text-muted-foreground text-sm">Accuracy by subject</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {topics.map((topic) => (
          <div
            key={topic.name}
            className="bg-secondary/50 group hover:bg-secondary rounded-2xl p-4 transition-colors"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">{topic.name}</span>
              <div className={`size-2 rounded-full ${topic.color}`} />
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold tracking-tight">{topic.accuracy}%</span>
              <span className="text-muted-foreground text-xs">
                {(topic.questions / 1000).toFixed(1)}K
              </span>
            </div>
            <div className="bg-background mt-3 h-1.5 overflow-hidden rounded-full">
              <div
                className={`h-full ${topic.color} rounded-full transition-all`}
                style={{ width: `${topic.accuracy}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

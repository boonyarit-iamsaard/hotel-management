"use client";

import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";

interface HealthCheckStatusProps {
  isLoading: boolean;
  isConnected: boolean;
}

const STATUS_CONFIGS = {
  connected: {
    color: "bg-green-500",
    message: "Connected",
  },
  disconnected: {
    color: "bg-red-500",
    message: "Disconnected",
  },
  checking: {
    color: "bg-yellow-500",
    message: "Checking...",
  },
} as const;
type StatusKey = keyof typeof STATUS_CONFIGS;

function getStatusKey(isLoading: boolean, isConnected: boolean): StatusKey {
  if (isLoading) {
    return "checking";
  }

  return isConnected ? "connected" : "disconnected";
}

function HealthCheckStatus({
  isLoading,
  isConnected,
}: Readonly<HealthCheckStatusProps>) {
  const statusKey = getStatusKey(isLoading, isConnected);
  const { color, message: statusMessage } = STATUS_CONFIGS[statusKey];

  return (
    <div className="flex items-center gap-2">
      <div className={cn("size-2 rounded-full", color)} />
      <span className="text-muted-foreground text-sm">{statusMessage}</span>
    </div>
  );
}

export default function Home() {
  const healthCheck = useQuery(trpc.healthCheck.queryOptions());

  return (
    <div className="container mx-auto max-w-3xl px-4">
      <div className="grid gap-4">
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">API Status</h2>
          <HealthCheckStatus
            isLoading={healthCheck.isLoading}
            isConnected={!!healthCheck.data}
          />
        </section>
      </div>
    </div>
  );
}

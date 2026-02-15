"use client";
import { useQuery } from "@tanstack/react-query";

import type { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

interface DashboardProps {
  session: typeof authClient.$Infer.Session;
}

export default function Dashboard({ session: _ }: Readonly<DashboardProps>) {
  const privateData = useQuery(trpc.privateData.queryOptions());

  return <p>API: {privateData.data?.message}</p>;
}

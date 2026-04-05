"use client";

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ConvexQueryClient } from "@convex-dev/react-query";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({
  children,
  initialToken,
}: {
  children: React.ReactNode;
  initialToken?: string | null;
}) {
  const convexQueryClient = new ConvexQueryClient(convex);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  });
  convexQueryClient.connect(queryClient);

  return (
    <ConvexBetterAuthProvider
      client={convex}
      authClient={authClient}
      initialToken={initialToken}
    >
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ConvexBetterAuthProvider>
  );
}
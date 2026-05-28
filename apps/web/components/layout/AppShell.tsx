"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { useState } from "react";

/**
 * App-wide providers. The previous version wrapped wagmi/RainbowKit here;
 * now that we use a fully client-side embedded wallet, the only global
 * provider we need is TanStack Query for contract-read polling.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col bg-bg">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}

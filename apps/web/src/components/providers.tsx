"use client";

import { QueryClientProvider } from "@tanstack/react-query";

import { getQueryClient } from "@/utils/query-client";
import { ChatWidget } from "@/features/chat/chat-widget";
import { authClient } from "@/lib/auth-client";

import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const { data: session } = authClient.useSession();

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      <Toaster richColors />
      {session && <ChatWidget />}
    </ThemeProvider>
  );
}

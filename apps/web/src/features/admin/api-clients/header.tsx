"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageHeader } from "../page-header";
import { CreateClientDialog } from "./create-client-dialog";

export function ApiClientsHeader() {
  const router = useRouter();

  return (
    <PageHeader
      title="API Clients"
      subtitle="Manage M2M clients for external API access"
      actions={
        <>
          <Button
            variant="outline"
            size="icon"
            className="border-border/50 bg-card/50"
            onClick={() => router.refresh()}
          >
            <RefreshCw className="size-4" />
            <span className="sr-only">Refresh data</span>
          </Button>
          <CreateClientDialog />
        </>
      }
    />
  );
}

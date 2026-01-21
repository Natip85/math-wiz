"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { CreateUserDialog } from "./create-user-dialog";
import { useRouter } from "next/navigation";
import { PageHeader } from "../page-header";

export function UsersHeader() {
  const router = useRouter();

  return (
    <PageHeader
      title="User Management"
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
          <CreateUserDialog />
        </>
      }
    />
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { useTRPCClient } from "@/utils/trpc-client";

interface ApiClient {
  clientId: string;
  name: string;
  description: string | null;
  scopes: string[];
  createdAt: string;
}

interface ClientRowProps {
  client: ApiClient;
}

export function ClientRow({ client }: ClientRowProps) {
  const router = useRouter();
  const trpc = useTRPCClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(client.clientId);
    toast.success("Client ID copied to clipboard");
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await trpc.apiClients.delete.mutate({ clientId: client.clientId });
      toast.success("API client deleted");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete client");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const formattedDate = new Date(client.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="space-y-1">
            <p className="font-medium">{client.name}</p>
            {client.description && (
              <p className="text-muted-foreground text-sm">{client.description}</p>
            )}
            <div className="flex items-center gap-1.5">
              <code className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-xs">
                {client.clientId.slice(0, 20)}...
              </code>
              <Button variant="ghost" size="icon" className="size-6" onClick={handleCopyId}>
                <Copy className="size-3" />
              </Button>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {client.scopes.map((scope) => (
              <Badge key={scope} variant="secondary" className="text-xs">
                {scope.replace("read:", "")}
              </Badge>
            ))}
          </div>
        </TableCell>
        <TableCell className="text-muted-foreground">{formattedDate}</TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyId}>
                <Copy className="mr-2 size-4" />
                Copy Client ID
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{client.name}&quot;? This will immediately
              revoke access for any systems using this client. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

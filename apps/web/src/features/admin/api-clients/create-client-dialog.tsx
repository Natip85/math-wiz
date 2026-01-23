"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Copy, Eye, EyeOff, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTRPCClient } from "@/utils/trpc-client";

const AVAILABLE_SCOPES = [
  { value: "read:sessions", label: "Read Sessions", description: "Access learning session data" },
  { value: "read:questions", label: "Read Questions", description: "Access question data" },
  { value: "read:progress", label: "Read Progress", description: "Access user progress stats" },
  { value: "read:leaderboard", label: "Read Leaderboard", description: "Access leaderboard data" },
];

interface CreatedClient {
  clientId: string;
  clientSecret: string;
  name: string;
}

export function CreateClientDialog() {
  const router = useRouter();
  const trpc = useTRPCClient();
  const [open, setOpen] = useState(false);
  const [createdClient, setCreatedClient] = useState<CreatedClient | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      scopes: [] as string[],
    },
    onSubmit: async ({ value }) => {
      // Manual validation
      if (!value.name.trim()) {
        toast.error("Name is required");
        return;
      }
      if (value.scopes.length === 0) {
        toast.error("Select at least one scope");
        return;
      }

      try {
        const result = await trpc.apiClients.create.mutate({
          name: value.name,
          description: value.description || undefined,
          scopes: value.scopes,
        });

        setCreatedClient({
          clientId: result.clientId,
          clientSecret: result.clientSecret,
          name: result.name,
        });

        toast.success("API client created successfully");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to create client");
      }
    },
  });

  const handleClose = () => {
    setOpen(false);
    setCreatedClient(null);
    setShowSecret(false);
    setCopiedId(false);
    setCopiedSecret(false);
    form.reset();
    router.refresh();
  };

  const copyToClipboard = async (text: string, type: "id" | "secret") => {
    await navigator.clipboard.writeText(text);
    if (type === "id") {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
    toast.success(`${type === "id" ? "Client ID" : "Client Secret"} copied to clipboard`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" /> New API Client
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        {createdClient ? (
          <>
            <DialogHeader>
              <DialogTitle>API Client Created</DialogTitle>
              <DialogDescription>
                Save these credentials securely. The client secret will not be shown again!
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 rounded-lg border p-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Client Name</Label>
                    <p className="font-medium">{createdClient.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Client ID</Label>
                    <div className="flex items-center gap-2">
                      <code className="bg-background flex-1 truncate rounded border px-2 py-1 text-sm">
                        {createdClient.clientId}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => copyToClipboard(createdClient.clientId, "id")}
                      >
                        <Copy className="size-4" />
                      </Button>
                    </div>
                    {copiedId && <p className="text-muted-foreground mt-1 text-xs">Copied!</p>}
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Client Secret</Label>
                    <div className="flex items-center gap-2">
                      <code className="bg-background flex-1 truncate rounded border px-2 py-1 text-sm">
                        {showSecret ? createdClient.clientSecret : "••••••••••••••••••••"}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => setShowSecret(!showSecret)}
                      >
                        {showSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => copyToClipboard(createdClient.clientSecret, "secret")}
                      >
                        <Copy className="size-4" />
                      </Button>
                    </div>
                    {copiedSecret && <p className="text-muted-foreground mt-1 text-xs">Copied!</p>}
                  </div>
                </div>
              </div>
              <div className="bg-destructive/10 text-destructive border-destructive/20 rounded-lg border p-3 text-sm">
                <strong>Important:</strong> Copy the client secret now. You won&apos;t be able to
                see it again!
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create API Client</DialogTitle>
              <DialogDescription>
                Create a new M2M client for external API access. Share the credentials securely with
                your integration partner.
              </DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void form.handleSubmit();
              }}
            >
              <form.Field name="name">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="client-name">Client Name</Label>
                    <Input
                      id="client-name"
                      placeholder="e.g., Partner Company Integration"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>
              <form.Field name="description">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="client-description">Description (optional)</Label>
                    <Input
                      id="client-description"
                      placeholder="e.g., Access for analytics dashboard"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>
              <form.Field name="scopes">
                {(field) => (
                  <div className="space-y-3">
                    <Label>Permissions</Label>
                    <div className="space-y-2">
                      {AVAILABLE_SCOPES.map((scope) => (
                        <label
                          key={scope.value}
                          className="hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors"
                        >
                          <Checkbox
                            checked={field.state.value.includes(scope.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.handleChange([...field.state.value, scope.value]);
                              } else {
                                field.handleChange(
                                  field.state.value.filter((s) => s !== scope.value)
                                );
                              }
                            }}
                          />
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">{scope.label}</p>
                            <p className="text-muted-foreground text-xs">{scope.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </form.Field>
              <form.Subscribe>
                {(state) => (
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                      disabled={state.isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!state.canSubmit || state.isSubmitting}>
                      {state.isSubmitting ? "Creating..." : "Create Client"}
                    </Button>
                  </DialogFooter>
                )}
              </form.Subscribe>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, FileText, Loader2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NotionPage {
  id: string;
  title: string;
  icon: string | null;
  url: string;
}

interface NotionExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportEndpoint: string;
}

export function NotionExportDialog({ open, onOpenChange, exportEndpoint }: NotionExportDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedPage, setSelectedPage] = useState<NotionPage | null>(null);
  const { toast } = useToast();

  const { data: pages = [], isLoading } = useQuery<NotionPage[]>({
    queryKey: ["/api/notion/pages", search],
    queryFn: async () => {
      const res = await fetch(`/api/notion/pages?q=${encodeURIComponent(search)}`);
      if (!res.ok) throw new Error("Failed to fetch Notion pages");
      return res.json();
    },
    enabled: open,
  });

  const exportMutation = useMutation({
    mutationFn: async (parentPageId: string) => {
      const res = await apiRequest("POST", exportEndpoint, { parentPageId });
      return res.json() as Promise<{ url: string }>;
    },
    onSuccess: (data) => {
      toast({
        title: "Exported to Notion",
        description: "Your content has been exported. Opening in Notion...",
      });
      window.open(data.url, "_blank");
      onOpenChange(false);
      setSelectedPage(null);
      setSearch("");
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
        description: error.message || "Could not export to Notion.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle data-testid="text-notion-dialog-title">Export to Notion</DialogTitle>
          <DialogDescription>
            Choose a Notion page to export to. A new child page will be created under your selection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your Notion pages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-notion-search"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 border rounded-md p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : pages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6" data-testid="text-no-pages">
                No pages found. Make sure you've shared pages with the Notion integration.
              </p>
            ) : (
              pages.map((page) => (
                <div
                  key={page.id}
                  role="button"
                  tabIndex={0}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors cursor-pointer ${
                    selectedPage?.id === page.id
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "hover:bg-muted border border-transparent"
                  }`}
                  onClick={() => setSelectedPage(page)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedPage(page); }}
                  data-testid={`button-notion-page-${page.id}`}
                >
                  {page.icon ? (
                    <span className="shrink-0">{page.icon}</span>
                  ) : (
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="truncate">{page.title}</span>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { onOpenChange(false); setSelectedPage(null); setSearch(""); }}
              data-testid="button-notion-cancel"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!selectedPage || exportMutation.isPending}
              onClick={() => selectedPage && exportMutation.mutate(selectedPage.id)}
              data-testid="button-notion-export"
            >
              {exportMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Exporting...</>
              ) : (
                <><ExternalLink className="mr-2 h-4 w-4" />Export</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

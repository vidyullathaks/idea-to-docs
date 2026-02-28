import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import {
  BookOpen,
  Target,
  BarChart3,
  Calendar,
  GraduationCap,
  Loader2,
  Trash2,
  ExternalLink,
  FolderOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ToolResult } from "@shared/schema";

const toolMeta: Record<string, { label: string; icon: typeof BookOpen; path: string }> = {
  "user-stories": { label: "User Stories", icon: BookOpen, path: "/user-stories" },
  "problem-refiner": { label: "Problem Refiner", icon: Target, path: "/problem-refiner" },
  "feature-prioritizer": { label: "Feature Prioritizer", icon: BarChart3, path: "/prioritization" },
  "sprint-planner": { label: "Sprint Planner", icon: Calendar, path: "/sprint-planning" },
  "interview-prep": { label: "Interview Prep", icon: GraduationCap, path: "/interview-prep" },
};

export default function ToolResultsPage() {
  const { toast } = useToast();

  const { data: results = [], isLoading } = useQuery<ToolResult[]>({
    queryKey: ["/api/tool-results"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tool-results/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tool-results"] });
      toast({ title: "Deleted", description: "Tool result has been deleted." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Tool Results History</h1>
        <p className="text-sm text-muted-foreground mt-1">View and manage your past AI tool outputs.</p>
      </div>

      {results.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground" />
            <h2 className="text-lg font-semibold">No results yet</h2>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Use any of the AI tools from the sidebar to generate results. They'll appear here for easy access.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {results.map((result) => {
            const meta = toolMeta[result.toolType] || { label: result.toolType, icon: BookOpen, path: "/" };
            const Icon = meta.icon;
            return (
              <Card key={result.id} className="hover-elevate" data-testid={`card-result-${result.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Link href={`/tool-results/${result.id}`}>
                        <CardTitle className="text-base cursor-pointer hover:underline flex items-center gap-2" data-testid={`link-result-${result.id}`}>
                          <Icon className="h-4 w-4 text-primary shrink-0" />
                          {result.title}
                        </CardTitle>
                      </Link>
                      <CardDescription className="mt-1 flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="no-default-hover-elevate">{meta.label}</Badge>
                        <span className="text-xs">
                          {result.createdAt ? format(new Date(result.createdAt), "MMM d, yyyy 'at' h:mm a") : ""}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link href={`/tool-results/${result.id}`}>
                        <Button variant="ghost" size="icon" data-testid={`button-view-${result.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(result.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${result.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {result.rawInput && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">{result.rawInput}</p>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { PrdDisplay } from "@/components/prd-display";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import {
  FileText,
  Clock,
  ChevronRight,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Prd } from "@shared/schema";

function PrdSkeleton() {
  return (
    <div className="p-4 border rounded-md space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

export default function PrdsPage() {
  const [selectedPrd, setSelectedPrd] = useState<Prd | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: prds = [], isLoading } = useQuery<Prd[]>({
    queryKey: ["/api/prds"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/prds/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prds"] });
      if (selectedPrd) {
        setSelectedPrd(null);
      }
      toast({
        title: "PRD Deleted",
        description: "The PRD has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Could not delete the PRD. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUpdatePrd = (updates: Partial<Prd>) => {
    if (selectedPrd) {
      setSelectedPrd({ ...selectedPrd, ...updates });
    }
  };

  if (selectedPrd) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="sm" onClick={() => setSelectedPrd(null)} data-testid="button-back-to-list">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to PRDs
          </Button>
        </div>
        <PrdDisplay prd={selectedPrd} onUpdate={handleUpdatePrd} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-prds-title">
            <FileText className="h-6 w-6 text-primary" />
            Your PRDs
          </h1>
          <p className="text-sm text-muted-foreground mt-1" data-testid="text-prds-count">
            {isLoading ? "Loading..." : `${prds.length} document${prds.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button onClick={() => navigate("/")} data-testid="button-create-prd">
          <Plus className="mr-2 h-4 w-4" />
          Create New PRD
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <PrdSkeleton />
          <PrdSkeleton />
          <PrdSkeleton />
        </div>
      ) : prds.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-lg">No PRDs yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Generate your first PRD to see it here
              </p>
            </div>
            <Button onClick={() => navigate("/")} data-testid="button-generate-first">
              <Plus className="mr-2 h-4 w-4" />
              Generate Your First PRD
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {prds.map((prd) => (
            <Card
              key={prd.id}
              className="hover-elevate cursor-pointer"
              data-testid={`card-prd-${prd.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <button
                    className="flex-1 min-w-0 text-left"
                    onClick={() => setSelectedPrd(prd)}
                    data-testid={`button-view-prd-${prd.id}`}
                  >
                    <h3 className="font-medium line-clamp-1" data-testid={`text-prd-title-${prd.id}`}>
                      {prd.title || "Untitled PRD"}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {prd.rawIdea}
                    </p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(prd.createdAt), { addSuffix: true })}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {prd.status || "draft"}
                      </Badge>
                    </div>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(prd.id);
                      }}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-prd-${prd.id}`}
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

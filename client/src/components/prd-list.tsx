import { formatDistanceToNow } from "date-fns";
import { FileText, Clock, ChevronRight, Plus, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Prd } from "@shared/schema";

interface PrdListProps {
  prds: Prd[];
  onSelect: (prd: Prd) => void;
  onNew: () => void;
  isLoading: boolean;
  selectedId?: number;
}

function PrdSkeleton() {
  return (
    <div className="p-4 border rounded-md space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

export function PrdList({ prds, onSelect, onNew, isLoading, selectedId }: PrdListProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Your PRDs
          </CardTitle>
          <CardDescription className="mt-1">
            {prds.length} document{prds.length !== 1 ? 's' : ''}
          </CardDescription>
        </div>
        <Button size="sm" onClick={onNew} data-testid="button-new-prd">
          <Plus className="mr-2 h-4 w-4" />
          New
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <>
            <PrdSkeleton />
            <PrdSkeleton />
            <PrdSkeleton />
          </>
        ) : prds.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">No PRDs yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first PRD to get started
              </p>
            </div>
            <Button onClick={onNew} variant="outline" size="sm" data-testid="button-create-first">
              <Plus className="mr-2 h-4 w-4" />
              Create PRD
            </Button>
          </div>
        ) : (
          prds.map((prd) => (
            <button
              key={prd.id}
              onClick={() => onSelect(prd)}
              className={`w-full text-left p-4 border rounded-md transition-colors hover-elevate ${
                selectedId === prd.id 
                  ? "border-primary bg-primary/5" 
                  : "border-border bg-card"
              }`}
              data-testid={`button-prd-${prd.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium line-clamp-1">
                    {prd.title || "Untitled PRD"}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {prd.rawIdea}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatDistanceToNow(new Date(prd.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </div>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
}

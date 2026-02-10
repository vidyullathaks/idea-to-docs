import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToolResultDisplay } from "@/components/tool-result-display";
import { queryClient } from "@/lib/queryClient";
import type { ToolResult } from "@shared/schema";

export default function ToolResultDetail() {
  const [, params] = useRoute("/tool-results/:id");
  const id = params?.id;

  const { data: toolResult, isLoading, error } = useQuery<ToolResult>({
    queryKey: ["/api/tool-results", id],
    queryFn: async () => {
      const res = await fetch(`/api/tool-results/${id}`);
      if (!res.ok) throw new Error("Result not found");
      return res.json();
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !toolResult) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Result Not Found</h2>
            <p className="text-sm text-muted-foreground text-center">
              This result may have been deleted.
            </p>
            <Link href="/tool-results">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Back to Results
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-4">
        <Link href="/tool-results">
          <Button variant="outline" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
            All Results
          </Button>
        </Link>
      </div>
      <ToolResultDisplay
        toolResult={toolResult}
        onUpdate={(updated) => {
          queryClient.setQueryData(["/api/tool-results", id], updated);
        }}
      />
    </div>
  );
}

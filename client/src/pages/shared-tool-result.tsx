import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ToolResultDisplay } from "@/components/tool-result-display";
import type { ToolResult } from "@shared/schema";

export default function SharedToolResult() {
  const [, params] = useRoute("/share/tool/:shareId");
  const shareId = params?.shareId;

  const { data: toolResult, isLoading, error } = useQuery<ToolResult>({
    queryKey: ["/api/shared/tool", shareId],
    queryFn: async () => {
      const res = await fetch(`/api/shared/tool/${shareId}`);
      if (!res.ok) throw new Error("Result not found");
      return res.json();
    },
    enabled: !!shareId,
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
              This shared link may have expired or the result may have been deleted.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ToolResultDisplay toolResult={toolResult} readOnly />
    </div>
  );
}

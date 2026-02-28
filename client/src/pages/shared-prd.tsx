import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { PrdDisplay } from "@/components/prd-display";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Prd } from "@shared/schema";

export default function SharedPrd() {
  const [, params] = useRoute("/share/:shareId");
  const shareId = params?.shareId;

  const { data: prd, isLoading, error } = useQuery<Prd>({
    queryKey: ["/api/shared", shareId],
    queryFn: async () => {
      const res = await fetch(`/api/shared/${shareId}`);
      if (!res.ok) throw new Error("PRD not found");
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

  if (error || !prd) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold">PRD Not Found</h2>
            <p className="text-sm text-muted-foreground text-center">
              This shared link may have expired or the PRD may have been deleted.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <PrdDisplay prd={prd} readOnly />
    </div>
  );
}

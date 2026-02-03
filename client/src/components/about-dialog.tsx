import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Info, Sparkles, Target, Users, Zap, BarChart3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface AnalyticsSummary {
  totalPrds: number;
  totalGenerations: number;
  avgGenerationTime: number;
}

export function AboutDialog() {
  const [open, setOpen] = useState(false);

  const { data: analytics } = useQuery<AnalyticsSummary>({
    queryKey: ["/api/analytics/summary"],
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" data-testid="button-about">
          <Info className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            About IdeaForge
          </DialogTitle>
          <DialogDescription>
            AI-powered PRD generation for product managers and founders
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <section>
            <h4 className="font-semibold mb-2">What It Does</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              IdeaForge transforms rough product ideas into structured Product Requirements Documents (PRDs) 
              with comprehensive user stories and acceptance criteria. Simply describe your idea, and our AI 
              generates a complete PRD ready for development.
            </p>
          </section>

          <Separator />

          <section>
            <h4 className="font-semibold mb-3">Who It's For</h4>
            <div className="grid gap-3">
              <div className="flex items-start gap-3">
                <Target className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Product Managers</p>
                  <p className="text-xs text-muted-foreground">Quickly draft PRDs and user stories</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Founders & Entrepreneurs</p>
                  <p className="text-xs text-muted-foreground">Transform ideas into actionable specs</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Students & Aspiring PMs</p>
                  <p className="text-xs text-muted-foreground">Learn PRD structure and best practices</p>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h4 className="font-semibold mb-2">How To Use</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Describe your product idea in 3-5 sentences</li>
              <li>Click "Generate PRD" and wait for the AI</li>
              <li>Review and edit the generated document</li>
              <li>Copy or export to your preferred tool</li>
            </ol>
          </section>

          {analytics && (
            <>
              <Separator />
              <section>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Usage Stats
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{analytics.totalPrds}</p>
                    <p className="text-xs text-muted-foreground">PRDs Created</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{analytics.totalGenerations}</p>
                    <p className="text-xs text-muted-foreground">Generations</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {analytics.avgGenerationTime > 0 ? `${(analytics.avgGenerationTime / 1000).toFixed(1)}s` : '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">Avg Time</p>
                  </div>
                </div>
              </section>
            </>
          )}

          <Separator />

          <p className="text-xs text-muted-foreground text-center">
            Built with OpenAI GPT-5.2 on Replit
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

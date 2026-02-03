import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { IdeaInputForm } from "@/components/idea-input-form";
import { PrdDisplay } from "@/components/prd-display";
import { PrdList } from "@/components/prd-list";
import { LoadingPrd } from "@/components/loading-prd";
import { Header } from "@/components/header";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, FileText, Users, CheckCircle2 } from "lucide-react";
import type { Prd } from "@shared/schema";

type ViewState = "input" | "loading" | "display";

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>("input");
  const [selectedPrd, setSelectedPrd] = useState<Prd | null>(null);
  const { toast } = useToast();

  const { data: prds = [], isLoading: prdsLoading } = useQuery<Prd[]>({
    queryKey: ["/api/prds"],
  });

  const generateMutation = useMutation({
    mutationFn: async (idea: string) => {
      const response = await apiRequest("POST", "/api/prds/generate", { idea });
      const prd = await response.json();
      return prd as Prd;
    },
    onMutate: () => {
      setViewState("loading");
    },
    onSuccess: (prd) => {
      setSelectedPrd(prd);
      setViewState("display");
      queryClient.invalidateQueries({ queryKey: ["/api/prds"] });
      toast({
        title: "PRD Generated",
        description: "Your product requirements document is ready!",
      });
    },
    onError: (error: Error) => {
      setViewState("input");
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate PRD. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = useCallback((idea: string) => {
    generateMutation.mutate(idea);
  }, [generateMutation]);

  const handleSelectPrd = useCallback((prd: Prd) => {
    setSelectedPrd(prd);
    setViewState("display");
  }, []);

  const handleNewPrd = useCallback(() => {
    setSelectedPrd(null);
    setViewState("input");
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Hero Section - Only show when in input mode */}
      {viewState === "input" && !selectedPrd && (
        <section className="bg-gradient-to-b from-primary/5 to-background py-12 border-b border-border/50">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" data-testid="text-hero-title">
              Turn Any Idea Into a
              <span className="text-primary"> Complete PRD</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8" data-testid="text-hero-subtitle">
              Structured requirements, user stories, and acceptance criteria — generated instantly by AI.
            </p>
            
            {/* How It Works */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-8">
              <div className="flex flex-col items-center gap-2 p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">1. Describe Your Idea</h3>
                <p className="text-sm text-muted-foreground">Write a few sentences about your product concept</p>
              </div>
              <div className="flex flex-col items-center gap-2 p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">2. AI Generates PRD</h3>
                <p className="text-sm text-muted-foreground">Get a complete PRD with user stories in seconds</p>
              </div>
              <div className="flex flex-col items-center gap-2 p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">3. Export & Share</h3>
                <p className="text-sm text-muted-foreground">Copy as Markdown or export to Notion/Jira</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          <aside className="order-2 lg:order-1">
            <div className="sticky top-24">
              <PrdList
                prds={prds}
                onSelect={handleSelectPrd}
                onNew={handleNewPrd}
                isLoading={prdsLoading}
                selectedId={selectedPrd?.id}
              />
            </div>
          </aside>
          
          <div className="order-1 lg:order-2">
            {viewState === "input" && (
              <IdeaInputForm 
                onSubmit={handleSubmit} 
                isLoading={generateMutation.isPending}
              />
            )}
            
            {viewState === "loading" && <LoadingPrd />}
            
            {viewState === "display" && selectedPrd && (
              <PrdDisplay prd={selectedPrd} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>IdeaForge — AI-Powered PRD Generator</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Built for Product Managers, Founders & Students</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

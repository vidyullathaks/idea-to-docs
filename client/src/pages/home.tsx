import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { IdeaInputForm } from "@/components/idea-input-form";
import { PrdDisplay } from "@/components/prd-display";
import { PrdList } from "@/components/prd-list";
import { LoadingPrd } from "@/components/loading-prd";
import { Header } from "@/components/header";
import { useToast } from "@/hooks/use-toast";
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
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
    </div>
  );
}

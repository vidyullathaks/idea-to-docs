import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { IdeaInputForm } from "@/components/idea-input-form";
import { PrdDisplay } from "@/components/prd-display";
import { PrdList } from "@/components/prd-list";
import { LoadingPrd } from "@/components/loading-prd";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, FileText, CheckCircle2, Cloud, Smartphone, ShoppingCart, Code, Newspaper } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Prd } from "@shared/schema";

const templates = [
  {
    title: "SaaS Product",
    icon: Cloud,
    idea: "A project management SaaS platform for small design agencies that helps them track client projects, manage feedback loops, and automate invoicing. The tool should integrate with popular design tools like Figma and support real-time collaboration between team members and clients.",
  },
  {
    title: "Mobile App",
    icon: Smartphone,
    idea: "A mobile fitness app that creates personalized workout plans based on users' fitness goals, available equipment, and schedule. It should track progress with visual charts, offer video demonstrations for exercises, and include a social feature where users can challenge friends.",
  },
  {
    title: "E-commerce Platform",
    icon: ShoppingCart,
    idea: "An online marketplace for handmade and artisanal food products that connects local food artisans with health-conscious consumers. The platform should support subscription boxes, provide detailed sourcing information, and handle cold-chain shipping logistics.",
  },
  {
    title: "Developer Tool",
    icon: Code,
    idea: "A CLI tool and VS Code extension that automatically generates API documentation from code comments and type definitions. It should support TypeScript, Python, and Go, output OpenAPI specs, and include a hosted documentation site with search and versioning.",
  },
  {
    title: "Content Platform",
    icon: Newspaper,
    idea: "A community-driven learning platform where industry professionals can create and sell micro-courses (under 2 hours). It should include interactive quizzes, completion certificates, a review system, and revenue sharing for course creators.",
  },
];

type ViewState = "input" | "loading" | "display";

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>("input");
  const [selectedPrd, setSelectedPrd] = useState<Prd | null>(null);
  const [templateIdea, setTemplateIdea] = useState("");
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

  const handleUpdatePrd = useCallback((updates: Partial<Prd>) => {
    if (selectedPrd) {
      const updated = { ...selectedPrd, ...updates };
      setSelectedPrd(updated);
    }
  }, [selectedPrd]);

  return (
    <div className="bg-background">
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

      {viewState === "input" && !selectedPrd && (
        <section className="container mx-auto px-4 py-8" data-testid="section-templates">
          <h2 className="text-xl font-semibold mb-4" data-testid="text-templates-header">Start with a Template</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template, index) => (
              <Card
                key={template.title}
                className="hover-elevate cursor-pointer"
                onClick={() => setTemplateIdea(template.idea)}
                data-testid={`card-template-${index}`}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <template.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium mb-1" data-testid={`text-template-title-${index}`}>{template.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-template-preview-${index}`}>{template.idea}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 py-8">
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
                initialIdea={templateIdea}
              />
            )}

            {viewState === "loading" && <LoadingPrd />}

            {viewState === "display" && selectedPrd && (
              <PrdDisplay prd={selectedPrd} onUpdate={handleUpdatePrd} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

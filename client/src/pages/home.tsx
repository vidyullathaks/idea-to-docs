import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { IdeaInputForm } from "@/components/idea-input-form";
import { PrdDisplay } from "@/components/prd-display";
import { LoadingPrd } from "@/components/loading-prd";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Sparkles,
  FileText,
  Cloud,
  Smartphone,
  BookOpen,
  Target,
  BarChart3,
  Calendar,
  GraduationCap,
  ArrowLeftRight,
  Download,
  Users,
  History,
  Palette,
  Cpu,
  UserCircle,
  Link2,
  Lock,
  ExternalLink,
  Globe,
  Pencil,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
];

const liveFeatures = [
  { icon: Cpu, label: "Multi-model support" },
  { icon: Download, label: "Export as PDF or Markdown" },
  { icon: Pencil, label: "Inline editing with version history" },
  { icon: Link2, label: "Shareable links" },
  { icon: Palette, label: "Custom templates" },
];

const roadmapItems = [
  { icon: Users, label: "Collaborative editing", status: "planned" as const },
  { icon: UserCircle, label: "User accounts + cloud sync", status: "planned" as const },
  { icon: ExternalLink, label: "Export to Notion / Jira", status: "planned" as const },
  { icon: Globe, label: "Multi-language support", status: "planned" as const },
];

type ViewState = "input" | "loading" | "display";

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>("input");
  const [selectedPrd, setSelectedPrd] = useState<Prd | null>(null);
  const [templateIdea, setTemplateIdea] = useState("");
  const [model, setModel] = useState("gpt-5.2");
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const generateMutation = useMutation({
    mutationFn: async (idea: string) => {
      const response = await apiRequest("POST", "/api/prds/generate", { idea, model });
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
        <section className="bg-gradient-to-b from-primary/5 to-background py-10 border-b border-border/50">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" data-testid="text-hero-title">
              Your AI-Powered
              <span className="text-primary"> PM Toolkit</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-hero-subtitle">
              7 tools to help you write PRDs, prioritize features, plan sprints, and more — all powered by AI.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 max-w-4xl mx-auto mt-6">
              {[
                { icon: FileText, label: "PRDs" },
                { icon: BookOpen, label: "User Stories" },
                { icon: Target, label: "Problem Refiner" },
                { icon: BarChart3, label: "Prioritization" },
                { icon: Calendar, label: "Sprint Planning" },
                { icon: GraduationCap, label: "Interview Prep" },
                { icon: ArrowLeftRight, label: "Compare" },
              ].map((tool) => (
                <div key={tool.label} className="flex flex-col items-center gap-2 p-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <tool.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{tool.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {viewState === "input" && !selectedPrd && (
          <div className="space-y-8">
            <IdeaInputForm
              onSubmit={handleSubmit}
              isLoading={generateMutation.isPending}
              initialIdea={templateIdea}
              model={model}
              onModelChange={setModel}
            />

            <section data-testid="section-templates">
              <h2 className="text-lg font-semibold mb-3" data-testid="text-templates-header">Start with a Template</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <section className="border-t border-border/50 pt-8" data-testid="section-features">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold" data-testid="text-features-header">What You Can Do</h2>
                <p className="text-sm text-muted-foreground mt-1">Recently shipped features</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {liveFeatures.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 p-3 rounded-md border border-primary/20 bg-primary/5"
                    data-testid={`feature-item-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  </div>
                ))}
              </div>

              <div className="text-center mt-8 mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground">Coming Soon</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roadmapItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 p-3 rounded-md border border-border/50 bg-card/50"
                    data-testid={`roadmap-item-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {item.status === "coming-soon" ? "Coming Soon" : "Planned"}
                    </Badge>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {viewState === "input" && selectedPrd && (
          <IdeaInputForm
            onSubmit={handleSubmit}
            isLoading={generateMutation.isPending}
            initialIdea={templateIdea}
            model={model}
            onModelChange={setModel}
          />
        )}

        {viewState === "loading" && <LoadingPrd />}

        {viewState === "display" && selectedPrd && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleNewPrd} data-testid="button-back-to-input">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Another
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/prds")} data-testid="button-view-all-prds">
                <FileText className="mr-2 h-4 w-4" />
                View All PRDs
              </Button>
            </div>
            <PrdDisplay prd={selectedPrd} onUpdate={handleUpdatePrd} />
          </div>
        )}
      </div>
    </div>
  );
}

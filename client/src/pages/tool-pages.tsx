import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  BookOpen,
  Target,
  BarChart3,
  Calendar,
  GraduationCap,
  Plus,
  Trash2,
  Copy,
  Check,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Users,
  Lightbulb,
  MessageSquare,
  Shield,
  Star,
  ClipboardList,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function PriorityBadge({ priority }: { priority: string }) {
  const variants: Record<string, string> = {
    high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };

  return (
    <Badge className={`${variants[priority] || variants.medium} border-0 text-xs font-medium no-default-hover-elevate`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
}

function RecommendationBadge({ recommendation }: { recommendation: string }) {
  const lower = recommendation.toLowerCase().replace(/[\s-]+/g, "-");
  const variants: Record<string, string> = {
    "must-have": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    "should-have": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "could-have": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    "won't-have": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <Badge className={`${variants[lower] || variants["could-have"]} border-0 text-xs font-medium no-default-hover-elevate`}>
      {recommendation}
    </Badge>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const lower = severity.toLowerCase();
  const variants: Record<string, string> = {
    high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };

  return (
    <Badge className={`${variants[lower] || variants.medium} border-0 text-xs font-medium no-default-hover-elevate`}>
      {severity}
    </Badge>
  );
}

function CopyButton({ text, testId }: { text: string; testId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} data-testid={testId}>
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

function ExampleSuggestion({ examples, onSelect }: { examples: string[]; onSelect: (text: string) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground font-medium">Need inspiration? Try one of these:</p>
      <div className="flex flex-col gap-2">
        {examples.map((example, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(example)}
            className="text-left text-sm p-3 rounded-md border border-border bg-card hover-elevate"
            data-testid={`button-example-${index}`}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}

export function UserStoryGenerator() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (featureIdea: string) => {
      const res = await apiRequest("POST", "/api/tools/user-stories", { featureIdea });
      return res.json();
    },
    onSuccess: (data) => setResult(data),
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (input.trim().length < 10) {
      toast({ title: "Input too short", description: "Please provide at least 10 characters.", variant: "destructive" });
      return;
    }
    mutation.mutate(input.trim());
  };

  const handleReset = () => {
    setResult(null);
    setInput("");
    mutation.reset();
  };

  if (result) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-feature-name">
                <BookOpen className="h-6 w-6 text-primary" />
                {result.featureName}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{result.userStories?.length || 0} user stories generated</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <CopyButton
                text={result.userStories?.map((s: any, i: number) =>
                  `US-${String(i + 1).padStart(3, "0")}: ${s.title}\n${s.description}\nAcceptance Criteria:\n${s.acceptanceCriteria?.map((c: string) => `- ${c}`).join("\n") || ""}`
                ).join("\n\n") || ""}
                testId="button-copy-stories"
              />
              <Button variant="outline" onClick={handleReset} data-testid="button-start-over">
                <Sparkles className="h-4 w-4" />
                Generate Again
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {result.userStories?.map((story: any, index: number) => (
              <StoryCard key={story.id || index} story={story} index={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" data-testid="text-tool-title">
            <BookOpen className="h-5 w-5 text-primary" />
            User Story Generator
          </CardTitle>
          <CardDescription data-testid="text-tool-description">
            Describe a feature idea and get detailed user stories with acceptance criteria and edge cases.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Textarea
              placeholder="Describe your feature idea in detail..."
              className="min-h-[150px] resize-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              data-testid="input-feature-idea"
            />
          </div>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={mutation.isPending}
            data-testid="button-generate"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate User Stories
              </>
            )}
          </Button>
          <ExampleSuggestion
            examples={[
              "User authentication with social login",
              "E-commerce shopping cart checkout flow",
              "Real-time chat messaging between users",
            ]}
            onSelect={setInput}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function StoryCard({ story, index }: { story: any; index: number }) {
  const [isOpen, setIsOpen] = useState(index === 0);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <button
            className="w-full p-4 flex items-start justify-between gap-4 text-left hover-elevate rounded-md"
            data-testid={`button-story-toggle-${index}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-muted-foreground">US-{String(index + 1).padStart(3, "0")}</span>
                <PriorityBadge priority={story.priority} />
              </div>
              <h4 className="font-medium mt-1 line-clamp-1">{story.title}</h4>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            <Separator />
            <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-story-description-${index}`}>
              {story.description}
            </p>

            {story.acceptanceCriteria?.length > 0 && (
              <div>
                <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Acceptance Criteria
                </h5>
                <ul className="space-y-2">
                  {story.acceptanceCriteria.map((c: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {story.edgeCases?.length > 0 && (
              <div>
                <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Edge Cases
                </h5>
                <ul className="space-y-2">
                  {story.edgeCases.map((e: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export function ProblemRefiner() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (problem: string) => {
      const res = await apiRequest("POST", "/api/tools/refine-problem", { problem });
      return res.json();
    },
    onSuccess: (data) => setResult(data),
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (input.trim().length < 10) {
      toast({ title: "Input too short", description: "Please provide at least 10 characters.", variant: "destructive" });
      return;
    }
    mutation.mutate(input.trim());
  };

  const handleReset = () => {
    setResult(null);
    setInput("");
    mutation.reset();
  };

  const generateCopyText = () => {
    if (!result) return "";
    return [
      `Original Problem: ${result.originalProblem}`,
      `Refined Statement: ${result.refinedStatement}`,
      `Context: ${result.context}`,
      `Impact: ${result.impact}`,
      `Affected Users: ${result.affectedUsers}`,
      `Current Solutions: ${result.currentSolutions}`,
      `Proposed Approach: ${result.proposedApproach}`,
      `Success Criteria:\n${result.successCriteria?.map((c: string) => `- ${c}`).join("\n") || ""}`,
    ].join("\n\n");
  };

  if (result) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-refiner-title">
              <Target className="h-6 w-6 text-primary" />
              Refined Problem Statement
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <CopyButton text={generateCopyText()} testId="button-copy-refined" />
              <Button variant="outline" onClick={handleReset} data-testid="button-start-over">
                <Sparkles className="h-4 w-4" />
                Start Over
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Original Problem</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground italic leading-relaxed" data-testid="text-original-problem">
                  {result.originalProblem}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  Refined Statement
                  <ArrowRight className="h-4 w-4 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed font-medium" data-testid="text-refined-statement">
                  {result.refinedStatement}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-6">
              {result.context && (
                <div>
                  <h3 className="font-semibold flex items-center gap-2 mb-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Context
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-context">
                    {result.context}
                  </p>
                </div>
              )}

              {result.impact && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Impact
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-impact">
                      {result.impact}
                    </p>
                  </div>
                </>
              )}

              {result.affectedUsers && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-primary" />
                      Affected Users
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-affected-users">
                      {result.affectedUsers}
                    </p>
                  </div>
                </>
              )}

              {result.currentSolutions && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Current Solutions
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-current-solutions">
                      {result.currentSolutions}
                    </p>
                  </div>
                </>
              )}

              {result.proposedApproach && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-primary" />
                      Proposed Approach
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-proposed-approach">
                      {result.proposedApproach}
                    </p>
                  </div>
                </>
              )}

              {result.successCriteria?.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Success Criteria
                    </h3>
                    <ul className="space-y-2">
                      {result.successCriteria.map((c: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" data-testid="text-tool-title">
            <Target className="h-5 w-5 text-primary" />
            Problem Refiner
          </CardTitle>
          <CardDescription data-testid="text-tool-description">
            Turn a messy, vague problem into a clear, actionable problem statement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Textarea
            placeholder="Describe your problem, even if it's messy or vague..."
            className="min-h-[150px] resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            data-testid="input-problem"
          />
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={mutation.isPending}
            data-testid="button-generate"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Refine Problem
              </>
            )}
          </Button>
          <ExampleSuggestion
            examples={[
              "our app is slow and users are leaving we need to fix it somehow",
            ]}
            onSelect={setInput}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function FeaturePrioritizer() {
  const [features, setFeatures] = useState<string[]>(["", "", ""]);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (featureList: string[]) => {
      const res = await apiRequest("POST", "/api/tools/prioritize-features", { features: featureList });
      return res.json();
    },
    onSuccess: (data) => setResult(data),
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleAddFeature = () => {
    setFeatures([...features, ""]);
  };

  const handleRemoveFeature = (index: number) => {
    if (features.length <= 2) return;
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };

  const handleSubmit = () => {
    const validFeatures = features.filter((f) => f.trim().length > 0);
    if (validFeatures.length < 2) {
      toast({ title: "Not enough features", description: "Please provide at least 2 features to prioritize.", variant: "destructive" });
      return;
    }
    mutation.mutate(validFeatures);
  };

  const handleReset = () => {
    setResult(null);
    setFeatures(["", "", ""]);
    mutation.reset();
  };

  if (result) {
    const sortedFeatures = [...(result.features || [])].sort((a: any, b: any) => (b.riceScore || 0) - (a.riceScore || 0));

    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-prioritizer-title">
              <BarChart3 className="h-6 w-6 text-primary" />
              Feature Prioritization Results
            </h1>
            <Button variant="outline" onClick={handleReset} data-testid="button-start-over">
              <Sparkles className="h-4 w-4" />
              Start Over
            </Button>
          </div>

          <div className="space-y-4">
            {sortedFeatures.map((feature: any, index: number) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>

          {result.summary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-summary">
                  {result.summary}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" data-testid="text-tool-title">
            <BarChart3 className="h-5 w-5 text-primary" />
            Feature Prioritizer
          </CardTitle>
          <CardDescription data-testid="text-tool-description">
            Add your features and get RICE scores with MoSCoW recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={`Feature ${index + 1}`}
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    data-testid={`input-feature-${index}`}
                  />
                </div>
                {features.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFeature(index)}
                    data-testid={`button-remove-feature-${index}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button variant="outline" onClick={handleAddFeature} className="w-full" data-testid="button-add-feature">
            <Plus className="h-4 w-4" />
            Add Feature
          </Button>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={mutation.isPending}
            data-testid="button-generate"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Prioritize Features
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function FeatureCard({ feature, index }: { feature: any; index: number }) {
  const [isOpen, setIsOpen] = useState(index === 0);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <button
            className="w-full p-4 flex items-start justify-between gap-4 text-left hover-elevate rounded-md"
            data-testid={`button-feature-toggle-${index}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium">{feature.name}</h4>
                <RecommendationBadge recommendation={feature.recommendation} />
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                <span>RICE: <strong className="text-foreground">{feature.riceScore}</strong></span>
                <span>Reach: {feature.reach}</span>
                <span>Impact: {feature.impact}</span>
                <span>Confidence: {feature.confidence}</span>
                <span>Effort: {feature.effort}</span>
              </div>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            <Separator />
            {feature.reasoning && (
              <div>
                <h5 className="text-sm font-medium mb-1">Reasoning</h5>
                <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-reasoning-${index}`}>
                  {feature.reasoning}
                </p>
              </div>
            )}
            {feature.tradeoffs && (
              <div>
                <h5 className="text-sm font-medium mb-1">Tradeoffs</h5>
                <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-tradeoffs-${index}`}>
                  {feature.tradeoffs}
                </p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export function SprintPlanner() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (backlog: string) => {
      const res = await apiRequest("POST", "/api/tools/plan-sprint", { backlog });
      return res.json();
    },
    onSuccess: (data) => setResult(data),
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (input.trim().length < 20) {
      toast({ title: "Input too short", description: "Please provide at least 20 characters.", variant: "destructive" });
      return;
    }
    mutation.mutate(input.trim());
  };

  const handleReset = () => {
    setResult(null);
    setInput("");
    mutation.reset();
  };

  if (result) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-sprint-title">
              <Calendar className="h-6 w-6 text-primary" />
              Sprint Plan
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <CopyButton
                text={`Sprint Goal: ${result.sprintGoal}\nDuration: ${result.duration}\nCapacity: ${result.capacity}\nTotal Points: ${result.totalPoints}\n\nStories:\n${result.stories?.map((s: any) => `- ${s.title} (${s.storyPoints} pts, ${s.priority})`).join("\n") || ""}`}
                testId="button-copy-sprint"
              />
              <Button variant="outline" onClick={handleReset} data-testid="button-start-over">
                <Sparkles className="h-4 w-4" />
                Start Over
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Sprint Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed" data-testid="text-sprint-goal">{result.sprintGoal}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground flex-wrap">
                {result.duration && <span>Duration: <strong className="text-foreground">{result.duration}</strong></span>}
                {result.capacity && <span>Capacity: <strong className="text-foreground">{result.capacity}</strong></span>}
                {result.totalPoints && <span>Total Points: <strong className="text-foreground">{result.totalPoints}</strong></span>}
              </div>
            </CardContent>
          </Card>

          {result.stories?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Stories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.stories.map((story: any, index: number) => (
                    <div key={index} className="flex items-start justify-between gap-4 p-3 rounded-md border flex-wrap" data-testid={`card-story-${index}`}>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium">{story.title}</h4>
                        {story.assignmentSuggestion && (
                          <p className="text-xs text-muted-foreground mt-1">{story.assignmentSuggestion}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="no-default-hover-elevate">{story.storyPoints} pts</Badge>
                        <PriorityBadge priority={story.priority} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {result.risks?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Risks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.risks.map((risk: any, index: number) => (
                    <div key={index} className="p-3 rounded-md border space-y-2" data-testid={`card-risk-${index}`}>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-sm font-medium">{risk.risk}</span>
                        <SeverityBadge severity={risk.severity} />
                      </div>
                      <p className="text-xs text-muted-foreground">{risk.mitigation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {result.recommendations?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" data-testid="text-tool-title">
            <Calendar className="h-5 w-5 text-primary" />
            Sprint Planner
          </CardTitle>
          <CardDescription data-testid="text-tool-description">
            Describe your backlog items and get a structured sprint plan with story points and risk assessment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Textarea
            placeholder="List your backlog items, separated by commas or new lines..."
            className="min-h-[150px] resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            data-testid="input-backlog"
          />
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={mutation.isPending}
            data-testid="button-generate"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Plan Sprint
              </>
            )}
          </Button>
          <ExampleSuggestion
            examples={[
              "Build user onboarding flow, Fix payment processing bugs, Add email notifications, Redesign dashboard, API rate limiting",
            ]}
            onSelect={setInput}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function InterviewPrep() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (question: string) => {
      const res = await apiRequest("POST", "/api/tools/interview-prep", { question });
      return res.json();
    },
    onSuccess: (data) => setResult(data),
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (input.trim().length < 10) {
      toast({ title: "Input too short", description: "Please provide at least 10 characters.", variant: "destructive" });
      return;
    }
    mutation.mutate(input.trim());
  };

  const handleReset = () => {
    setResult(null);
    setInput("");
    mutation.reset();
  };

  const generateCopyText = () => {
    if (!result) return "";
    return [
      `Question: ${result.question}`,
      `Framework: ${result.framework}`,
      `\nStructured Answer:\n${result.structuredAnswer}`,
      `\nKey Points:\n${result.keyPoints?.map((p: string) => `- ${p}`).join("\n") || ""}`,
      `\nExample Scenario:\n${result.exampleScenario}`,
      `\nFollow-up Questions:\n${result.followUpQuestions?.map((q: string) => `- ${q}`).join("\n") || ""}`,
      `\nTips:\n${result.tips?.map((t: string) => `- ${t}`).join("\n") || ""}`,
    ].join("\n");
  };

  if (result) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-interview-title">
              <GraduationCap className="h-6 w-6 text-primary" />
              Interview Prep
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <CopyButton text={generateCopyText()} testId="button-copy-answer" />
              <Button variant="outline" onClick={handleReset} data-testid="button-start-over">
                <Sparkles className="h-4 w-4" />
                Start Over
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base" data-testid="text-question">{result.question}</CardTitle>
              <CardDescription className="flex items-center gap-2 flex-wrap">
                Framework:
                <Badge variant="outline" className="no-default-hover-elevate" data-testid="badge-framework">{result.framework}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {result.structuredAnswer && (
                <div>
                  <h3 className="font-semibold flex items-center gap-2 mb-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Structured Answer
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line" data-testid="text-structured-answer">
                    {result.structuredAnswer}
                  </p>
                </div>
              )}

              {result.keyPoints?.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Key Points
                    </h3>
                    <ul className="space-y-2">
                      {result.keyPoints.map((point: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {result.exampleScenario && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Example Scenario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line" data-testid="text-example-scenario">
                  {result.exampleScenario}
                </p>
              </CardContent>
            </Card>
          )}

          {result.followUpQuestions?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Follow-up Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.followUpQuestions.map((q: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground" data-testid={`text-followup-${i}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {result.feedback && (
            <Alert data-testid="alert-feedback">
              <Star className="h-4 w-4" />
              <AlertDescription>
                <strong>Feedback:</strong> {result.feedback}
              </AlertDescription>
            </Alert>
          )}

          {result.tips?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.tips.map((tip: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground" data-testid={`text-tip-${i}`}>
                      <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" data-testid="text-tool-title">
            <GraduationCap className="h-5 w-5 text-primary" />
            Interview Prep
          </CardTitle>
          <CardDescription data-testid="text-tool-description">
            Practice PM interview questions and get structured answers with frameworks and tips.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Textarea
            placeholder="Enter a PM interview question..."
            className="min-h-[150px] resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            data-testid="input-question"
          />
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={mutation.isPending}
            data-testid="button-generate"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Prepare Answer
              </>
            )}
          </Button>
          <ExampleSuggestion
            examples={[
              "How would you improve Instagram Stories?",
              "Tell me about a product you launched from 0 to 1",
              "How do you prioritize features when you have limited resources?",
            ]}
            onSelect={setInput}
          />
        </CardContent>
      </Card>
    </div>
  );
}

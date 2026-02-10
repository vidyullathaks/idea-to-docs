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
  Loader2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ToolResultDisplay } from "@/components/tool-result-display";
import type { ToolResult } from "@shared/schema";

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
  const [savedResult, setSavedResult] = useState<ToolResult | null>(null);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (featureIdea: string) => {
      const res = await apiRequest("POST", "/api/tools/user-stories/generate", { featureIdea });
      return res.json() as Promise<ToolResult>;
    },
    onSuccess: (data) => setSavedResult(data),
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
    setSavedResult(null);
    setInput("");
    mutation.reset();
  };

  if (savedResult) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-4">
          <Button variant="outline" onClick={handleReset} data-testid="button-start-over">
            <Sparkles className="h-4 w-4" />
            Generate Again
          </Button>
        </div>
        <ToolResultDisplay
          toolResult={savedResult}
          onUpdate={(updated) => setSavedResult(updated)}
        />
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

export function ProblemRefiner() {
  const [input, setInput] = useState("");
  const [savedResult, setSavedResult] = useState<ToolResult | null>(null);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (problem: string) => {
      const res = await apiRequest("POST", "/api/tools/refine-problem/generate", { problem });
      return res.json() as Promise<ToolResult>;
    },
    onSuccess: (data) => setSavedResult(data),
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
    setSavedResult(null);
    setInput("");
    mutation.reset();
  };

  if (savedResult) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-4">
          <Button variant="outline" onClick={handleReset} data-testid="button-start-over">
            <Sparkles className="h-4 w-4" />
            Start Over
          </Button>
        </div>
        <ToolResultDisplay
          toolResult={savedResult}
          onUpdate={(updated) => setSavedResult(updated)}
        />
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
  const [savedResult, setSavedResult] = useState<ToolResult | null>(null);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (featureList: string[]) => {
      const res = await apiRequest("POST", "/api/tools/prioritize-features/generate", { features: featureList });
      return res.json() as Promise<ToolResult>;
    },
    onSuccess: (data) => setSavedResult(data),
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
    setSavedResult(null);
    setFeatures(["", "", ""]);
    mutation.reset();
  };

  if (savedResult) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-4">
          <Button variant="outline" onClick={handleReset} data-testid="button-start-over">
            <Sparkles className="h-4 w-4" />
            Start Over
          </Button>
        </div>
        <ToolResultDisplay
          toolResult={savedResult}
          onUpdate={(updated) => setSavedResult(updated)}
        />
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

export function SprintPlanner() {
  const [input, setInput] = useState("");
  const [savedResult, setSavedResult] = useState<ToolResult | null>(null);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (backlog: string) => {
      const res = await apiRequest("POST", "/api/tools/plan-sprint/generate", { backlog });
      return res.json() as Promise<ToolResult>;
    },
    onSuccess: (data) => setSavedResult(data),
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
    setSavedResult(null);
    setInput("");
    mutation.reset();
  };

  if (savedResult) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-4">
          <Button variant="outline" onClick={handleReset} data-testid="button-start-over">
            <Sparkles className="h-4 w-4" />
            Start Over
          </Button>
        </div>
        <ToolResultDisplay
          toolResult={savedResult}
          onUpdate={(updated) => setSavedResult(updated)}
        />
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
  const [savedResult, setSavedResult] = useState<ToolResult | null>(null);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (question: string) => {
      const res = await apiRequest("POST", "/api/tools/interview-prep/generate", { question });
      return res.json() as Promise<ToolResult>;
    },
    onSuccess: (data) => setSavedResult(data),
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
    setSavedResult(null);
    setInput("");
    mutation.reset();
  };

  if (savedResult) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-4">
          <Button variant="outline" onClick={handleReset} data-testid="button-start-over">
            <Sparkles className="h-4 w-4" />
            Start Over
          </Button>
        </div>
        <ToolResultDisplay
          toolResult={savedResult}
          onUpdate={(updated) => setSavedResult(updated)}
        />
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

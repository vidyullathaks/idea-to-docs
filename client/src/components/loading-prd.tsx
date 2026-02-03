import { Loader2, Sparkles, Brain, FileText, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

const steps = [
  { icon: Brain, label: "Analyzing your idea", duration: 2000 },
  { icon: FileText, label: "Structuring requirements", duration: 3000 },
  { icon: Sparkles, label: "Generating user stories", duration: 4000 },
  { icon: CheckCircle2, label: "Finalizing PRD", duration: 2000 },
];

export function LoadingPrd() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = steps.reduce((acc, step) => acc + step.duration, 0);
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += 100;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 95);
      setProgress(newProgress);

      let accumulatedDuration = 0;
      for (let i = 0; i < steps.length; i++) {
        accumulatedDuration += steps[i].duration;
        if (elapsed < accumulatedDuration) {
          setCurrentStep(i);
          break;
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border-0 bg-gradient-to-br from-primary/5 to-background">
      <CardContent className="py-12">
        <div className="max-w-md mx-auto space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <h3 className="text-xl font-semibold">Generating Your PRD</h3>
            <p className="text-sm text-muted-foreground">
              Our AI is crafting your product requirements document
            </p>
          </div>

          <div className="space-y-4">
            <Progress value={progress} className="h-2" />
            
            <div className="space-y-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isComplete = index < currentStep;

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
                      isActive
                        ? "bg-primary/10 text-foreground"
                        : isComplete
                        ? "text-muted-foreground"
                        : "text-muted-foreground/50"
                    }`}
                  >
                    <div className={`shrink-0 ${isActive ? "animate-pulse" : ""}`}>
                      {isComplete ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                      )}
                    </div>
                    <span className={`text-sm ${isActive ? "font-medium" : ""}`}>
                      {step.label}
                    </span>
                    {isActive && (
                      <Loader2 className="h-4 w-4 animate-spin ml-auto text-primary" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

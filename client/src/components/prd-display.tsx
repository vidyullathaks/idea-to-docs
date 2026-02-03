import { useState } from "react";
import { 
  Target, 
  Users, 
  CheckCircle2, 
  ListChecks, 
  BarChart3, 
  XCircle,
  MessageSquare,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Prd, UserStory } from "@shared/schema";

interface PrdDisplayProps {
  prd: Prd;
}

function PriorityBadge({ priority }: { priority: string }) {
  const variants: Record<string, string> = {
    high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };

  return (
    <Badge className={`${variants[priority]} border-0 text-xs font-medium`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
}

function UserStoryCard({ story, index }: { story: UserStory; index: number }) {
  const [isOpen, setIsOpen] = useState(index === 0);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-md bg-card">
        <CollapsibleTrigger asChild>
          <button 
            className="w-full p-4 flex items-start justify-between gap-4 text-left hover-elevate rounded-md"
            data-testid={`button-story-toggle-${index}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-muted-foreground">US-{String(index + 1).padStart(3, '0')}</span>
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
            <div>
              <p className="text-sm text-muted-foreground leading-relaxed">{story.description}</p>
            </div>
            <div>
              <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Acceptance Criteria
              </h5>
              <ul className="space-y-2">
                {story.acceptanceCriteria.map((criteria, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{criteria}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function Section({ 
  icon: Icon, 
  title, 
  children,
  className = ""
}: { 
  icon: React.ElementType; 
  title: string; 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="font-semibold flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function ListSection({ 
  icon: Icon, 
  title, 
  items 
}: { 
  icon: React.ElementType; 
  title: string; 
  items: string[] | null | undefined;
}) {
  if (!items || items.length === 0) return null;
  
  return (
    <Section icon={Icon} title={title}>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function PrdDisplay({ prd }: PrdDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = generatePrdText(prd);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const userStories = (prd.userStories as UserStory[]) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold" data-testid="text-prd-title">
              {prd.title || "Product Requirements Document"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Generated from your product idea
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            data-testid="button-copy-prd"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-8">
          {prd.problemStatement && (
            <Section icon={Target} title="Problem Statement">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {prd.problemStatement}
              </p>
            </Section>
          )}

          {prd.targetAudience && (
            <Section icon={Users} title="Target Audience">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {prd.targetAudience}
              </p>
            </Section>
          )}

          <ListSection icon={Target} title="Goals & Objectives" items={prd.goals} />
          <ListSection icon={ListChecks} title="Key Features" items={prd.features} />
          <ListSection icon={BarChart3} title="Success Metrics" items={prd.successMetrics} />
          <ListSection icon={XCircle} title="Out of Scope" items={prd.outOfScope} />
          <ListSection icon={AlertCircle} title="Assumptions" items={prd.assumptions} />
        </CardContent>
      </Card>

      {userStories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              User Stories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userStories.map((story, index) => (
                <UserStoryCard key={story.id} story={story} index={index} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function generatePrdText(prd: Prd): string {
  const userStories = (prd.userStories as UserStory[]) || [];
  
  let text = `# ${prd.title || "Product Requirements Document"}\n\n`;
  
  if (prd.problemStatement) {
    text += `## Problem Statement\n${prd.problemStatement}\n\n`;
  }
  
  if (prd.targetAudience) {
    text += `## Target Audience\n${prd.targetAudience}\n\n`;
  }
  
  if (prd.goals?.length) {
    text += `## Goals & Objectives\n${prd.goals.map(g => `- ${g}`).join('\n')}\n\n`;
  }
  
  if (prd.features?.length) {
    text += `## Key Features\n${prd.features.map(f => `- ${f}`).join('\n')}\n\n`;
  }
  
  if (prd.successMetrics?.length) {
    text += `## Success Metrics\n${prd.successMetrics.map(m => `- ${m}`).join('\n')}\n\n`;
  }
  
  if (prd.outOfScope?.length) {
    text += `## Out of Scope\n${prd.outOfScope.map(o => `- ${o}`).join('\n')}\n\n`;
  }
  
  if (prd.assumptions?.length) {
    text += `## Assumptions\n${prd.assumptions.map(a => `- ${a}`).join('\n')}\n\n`;
  }
  
  if (userStories.length > 0) {
    text += `## User Stories\n\n`;
    userStories.forEach((story, index) => {
      text += `### US-${String(index + 1).padStart(3, '0')}: ${story.title}\n`;
      text += `Priority: ${story.priority}\n\n`;
      text += `${story.description}\n\n`;
      text += `**Acceptance Criteria:**\n`;
      story.acceptanceCriteria.forEach(ac => {
        text += `- ${ac}\n`;
      });
      text += '\n';
    });
  }
  
  return text;
}

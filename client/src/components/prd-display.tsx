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
  AlertCircle,
  AlertTriangle,
  Pencil,
  Loader2
} from "lucide-react";
import { SiNotion, SiJira } from "react-icons/si";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Prd, UserStory } from "@shared/schema";

interface PrdDisplayProps {
  prd: Prd;
  onUpdate?: (updates: Partial<Prd>) => void;
}

function RewriteDialog({
  open,
  onOpenChange,
  sectionName,
  currentContent,
  onAccept,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionName: string;
  currentContent: string;
  onAccept: (rewrittenContent: string) => void;
}) {
  const [instruction, setInstruction] = useState("");
  const [rewrittenContent, setRewrittenContent] = useState<string | null>(null);

  const rewriteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/tools/rewrite-section", {
        sectionName,
        currentContent,
        instruction,
      });
      return res.json() as Promise<{ rewrittenContent: string }>;
    },
    onSuccess: (data) => {
      setRewrittenContent(data.rewrittenContent);
    },
  });

  const handleClose = (value: boolean) => {
    if (!value) {
      setInstruction("");
      setRewrittenContent(null);
      rewriteMutation.reset();
    }
    onOpenChange(value);
  };

  const handleAccept = () => {
    if (rewrittenContent) {
      onAccept(rewrittenContent);
      handleClose(false);
    }
  };

  const handleCancel = () => {
    setRewrittenContent(null);
    rewriteMutation.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg" data-testid="dialog-rewrite-section">
        <DialogHeader>
          <DialogTitle data-testid="text-rewrite-title">Rewrite: {sectionName}</DialogTitle>
          <DialogDescription>Provide instructions for how this section should be rewritten.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">Current Content</p>
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md max-h-32 overflow-y-auto" data-testid="text-current-content">
              {currentContent}
            </div>
          </div>

          {rewrittenContent ? (
            <>
              <div>
                <p className="text-sm font-medium mb-1">Rewritten Content</p>
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md max-h-32 overflow-y-auto" data-testid="text-rewritten-content">
                  {rewrittenContent}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  data-testid="button-rewrite-cancel"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAccept}
                  data-testid="button-rewrite-accept"
                >
                  Accept
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-sm font-medium mb-1">Rewrite Instruction</p>
                <Textarea
                  placeholder="e.g., Make it more concise, Add more detail, Add metrics..."
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  data-testid="input-rewrite-instruction"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => rewriteMutation.mutate()}
                  disabled={instruction.length < 5 || rewriteMutation.isPending}
                  data-testid="button-rewrite-submit"
                >
                  {rewriteMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Rewriting...
                    </>
                  ) : (
                    "Rewrite"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
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
  className = "",
  onRewrite,
}: { 
  icon: React.ElementType; 
  title: string; 
  children: React.ReactNode;
  className?: string;
  onRewrite?: () => void;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="font-semibold flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        {title}
        {onRewrite && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRewrite}
            className="h-7 w-7"
            data-testid={`button-rewrite-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
      </h3>
      {children}
    </div>
  );
}

function ListSection({ 
  icon: Icon, 
  title, 
  items,
  onRewrite,
}: { 
  icon: React.ElementType; 
  title: string; 
  items: string[] | null | undefined;
  onRewrite?: () => void;
}) {
  if (!items || items.length === 0) return null;
  
  return (
    <Section icon={Icon} title={title} onRewrite={onRewrite}>
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

export function PrdDisplay({ prd, onUpdate }: PrdDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [rewriteDialog, setRewriteDialog] = useState<{
    sectionName: string;
    currentContent: string;
    fieldKey: keyof Prd;
    isArray: boolean;
  } | null>(null);
  const { toast } = useToast();

  const handleCopy = async () => {
    const text = generatePrdText(prd);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    try {
      await apiRequest("POST", "/api/analytics/export", { prdId: prd.id, exportType: 'markdown' });
    } catch (e) {
    }
  };

  const handleNotionExport = async () => {
    toast({
      title: "Notion Export",
      description: "Connect your Notion account in Settings to enable export. For now, use 'Copy' to copy the PRD as Markdown.",
    });
    
    try {
      await apiRequest("POST", "/api/analytics/export", { prdId: prd.id, exportType: 'notion' });
    } catch (e) {
    }
  };

  const handleJiraExport = async () => {
    toast({
      title: "Jira Export",
      description: "Connect your Jira account in Settings to enable export. For now, use 'Copy' to copy the PRD as Markdown.",
    });
    
    try {
      await apiRequest("POST", "/api/analytics/export", { prdId: prd.id, exportType: 'jira' });
    } catch (e) {
    }
  };

  const openRewrite = (sectionName: string, currentContent: string, fieldKey: keyof Prd, isArray: boolean) => {
    setRewriteDialog({ sectionName, currentContent, fieldKey, isArray });
  };

  const handleRewriteAccept = (rewrittenContent: string) => {
    if (!rewriteDialog || !onUpdate) return;
    
    if (rewriteDialog.isArray) {
      const items = rewrittenContent.split('\n').map(s => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
      onUpdate({ [rewriteDialog.fieldKey]: items } as Partial<Prd>);
    } else {
      onUpdate({ [rewriteDialog.fieldKey]: rewrittenContent } as Partial<Prd>);
    }
  };

  const userStories = (prd.userStories as UserStory[]) || [];

  return (
    <div className="space-y-6">
      {rewriteDialog && (
        <RewriteDialog
          open={!!rewriteDialog}
          onOpenChange={(open) => { if (!open) setRewriteDialog(null); }}
          sectionName={rewriteDialog.sectionName}
          currentContent={rewriteDialog.currentContent}
          onAccept={handleRewriteAccept}
        />
      )}

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
          <div className="flex items-center gap-2 flex-wrap">
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleNotionExport}
              data-testid="button-export-notion"
            >
              <SiNotion className="mr-2 h-4 w-4" />
              Notion
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleJiraExport}
              data-testid="button-export-jira"
            >
              <SiJira className="mr-2 h-4 w-4" />
              Jira
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {prd.problemStatement && (
            <Section
              icon={Target}
              title="Problem Statement"
              onRewrite={onUpdate ? () => openRewrite("Problem Statement", prd.problemStatement!, "problemStatement", false) : undefined}
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                {prd.problemStatement}
              </p>
            </Section>
          )}

          {prd.targetAudience && (
            <Section
              icon={Users}
              title="Target Audience"
              onRewrite={onUpdate ? () => openRewrite("Target Audience", prd.targetAudience!, "targetAudience", false) : undefined}
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                {prd.targetAudience}
              </p>
            </Section>
          )}

          <ListSection
            icon={Target}
            title="Goals & Objectives"
            items={prd.goals}
            onRewrite={onUpdate && prd.goals?.length ? () => openRewrite("Goals & Objectives", prd.goals!.join('\n'), "goals", true) : undefined}
          />
          <ListSection
            icon={ListChecks}
            title="Key Features"
            items={prd.features}
            onRewrite={onUpdate && prd.features?.length ? () => openRewrite("Key Features", prd.features!.join('\n'), "features", true) : undefined}
          />
          <ListSection
            icon={BarChart3}
            title="Success Metrics"
            items={prd.successMetrics}
            onRewrite={onUpdate && prd.successMetrics?.length ? () => openRewrite("Success Metrics", prd.successMetrics!.join('\n'), "successMetrics", true) : undefined}
          />
          <ListSection
            icon={XCircle}
            title="Out of Scope"
            items={prd.outOfScope}
            onRewrite={onUpdate && prd.outOfScope?.length ? () => openRewrite("Out of Scope", prd.outOfScope!.join('\n'), "outOfScope", true) : undefined}
          />
          <ListSection
            icon={AlertCircle}
            title="Assumptions"
            items={prd.assumptions}
            onRewrite={onUpdate && prd.assumptions?.length ? () => openRewrite("Assumptions", prd.assumptions!.join('\n'), "assumptions", true) : undefined}
          />
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

      <Alert 
        className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
        data-testid="alert-ai-disclaimer"
      >
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-800 dark:text-amber-300 text-sm" data-testid="text-ai-disclaimer">
          <strong>AI-Generated Content:</strong> This PRD was generated by AI and may contain inaccuracies. 
          Please review and edit before sharing with stakeholders or using for development.
        </AlertDescription>
      </Alert>
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

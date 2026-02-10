import { useState } from "react";
import {
  Copy,
  Check,
  Download,
  FileDown,
  Link2,
  History,
  Pencil,
  Save,
  X,
  Loader2,
  RotateCcw,
  BookOpen,
  Target,
  BarChart3,
  Calendar,
  GraduationCap,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import type { ToolResult, ToolResultVersion } from "@shared/schema";

interface ToolResultDisplayProps {
  toolResult: ToolResult;
  onUpdate?: (updated: ToolResult) => void;
  readOnly?: boolean;
}

const TOOL_META: Record<string, { icon: typeof BookOpen; label: string }> = {
  "user-stories": { icon: BookOpen, label: "User Stories" },
  "problem-refiner": { icon: Target, label: "Refined Problem" },
  "feature-prioritizer": { icon: BarChart3, label: "Feature Prioritization" },
  "sprint-planner": { icon: Calendar, label: "Sprint Plan" },
  "interview-prep": { icon: GraduationCap, label: "Interview Prep" },
};

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

function VersionHistoryDialog({
  open,
  onOpenChange,
  toolResultId,
  onRestore,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toolResultId: number;
  onRestore: (result: ToolResult) => void;
}) {
  const { data: versions = [], isLoading } = useQuery<ToolResultVersion[]>({
    queryKey: ["/api/tool-results", toolResultId, "versions"],
    queryFn: async () => {
      const res = await fetch(`/api/tool-results/${toolResultId}/versions`);
      if (!res.ok) throw new Error("Failed to fetch versions");
      return res.json();
    },
    enabled: open,
  });

  const { toast } = useToast();

  const restoreMutation = useMutation({
    mutationFn: async (versionId: number) => {
      const res = await apiRequest("POST", `/api/tool-results/${toolResultId}/versions/${versionId}/restore`);
      return res.json() as Promise<ToolResult>;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tool-results"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tool-results", toolResultId, "versions"] });
      onRestore(result);
      toast({ title: "Version Restored", description: "Result has been restored to the selected version." });
    },
    onError: () => {
      toast({ title: "Restore Failed", description: "Could not restore this version.", variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col" data-testid="dialog-tool-version-history">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Version History
          </DialogTitle>
          <DialogDescription>View and restore previous versions of this result.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No previous versions yet. Versions are created when you edit sections.
            </div>
          ) : (
            versions.map((version) => {
              const snapshot = version.snapshot as Record<string, unknown>;
              return (
                <div key={version.id} className="border rounded-md p-3 space-y-2" data-testid={`version-item-${version.id}`}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-medium">{snapshot.title as string || "Untitled"}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => restoreMutation.mutate(version.id)}
                      disabled={restoreMutation.isPending}
                      data-testid={`button-restore-version-${version.id}`}
                    >
                      <RotateCcw className="mr-2 h-3 w-3" />
                      Restore
                    </Button>
                  </div>
                  {version.changeSummary && (
                    <p className="text-xs text-muted-foreground">{version.changeSummary}</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditableText({
  value,
  onSave,
  readOnly,
  multiline,
}: {
  value: string;
  onSave: (v: string) => void;
  readOnly?: boolean;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  if (readOnly || !editing) {
    return (
      <div className="group flex items-start gap-1">
        <span className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line flex-1">{value}</span>
        {!readOnly && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 invisible group-hover:visible"
            onClick={() => { setEditValue(value); setEditing(true); }}
            data-testid="button-inline-edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        className="min-h-[80px]"
        data-testid="input-inline-edit"
      />
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => { onSave(editValue); setEditing(false); }} data-testid="button-save-edit">
          <Save className="mr-2 h-3.5 w-3.5" />
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={() => { setEditValue(value); setEditing(false); }}>
          <X className="mr-2 h-3.5 w-3.5" />
          Cancel
        </Button>
      </div>
    </div>
  );
}

function generateToolMarkdown(toolResult: ToolResult): string {
  const r = toolResult.result as Record<string, unknown>;
  let text = `# ${toolResult.title}\n\n`;
  text += `**Tool:** ${TOOL_META[toolResult.toolType]?.label || toolResult.toolType}\n`;
  text += `**Input:** ${toolResult.rawInput}\n\n---\n\n`;

  switch (toolResult.toolType) {
    case "user-stories": {
      const stories = (r.userStories as any[]) || [];
      stories.forEach((s, i) => {
        text += `## US-${String(i + 1).padStart(3, "0")}: ${s.title}\n`;
        text += `Priority: ${s.priority}\n\n${s.description}\n\n`;
        text += `**Acceptance Criteria:**\n${(s.acceptanceCriteria || []).map((c: string) => `- ${c}`).join("\n")}\n`;
        if (s.edgeCases?.length) text += `\n**Edge Cases:**\n${s.edgeCases.map((e: string) => `- ${e}`).join("\n")}\n`;
        text += "\n";
      });
      break;
    }
    case "problem-refiner": {
      if (r.originalProblem) text += `## Original Problem\n${r.originalProblem}\n\n`;
      if (r.refinedStatement) text += `## Refined Statement\n${r.refinedStatement}\n\n`;
      if (r.context) text += `## Context\n${r.context}\n\n`;
      if (r.impact) text += `## Impact\n${r.impact}\n\n`;
      if (r.affectedUsers) text += `## Affected Users\n${r.affectedUsers}\n\n`;
      if (r.currentSolutions) text += `## Current Solutions\n${r.currentSolutions}\n\n`;
      if (r.proposedApproach) text += `## Proposed Approach\n${r.proposedApproach}\n\n`;
      if ((r.successCriteria as string[])?.length) text += `## Success Criteria\n${(r.successCriteria as string[]).map(c => `- ${c}`).join("\n")}\n\n`;
      break;
    }
    case "feature-prioritizer": {
      const features = (r.features as any[]) || [];
      features.forEach((f) => {
        text += `## ${f.name}\n`;
        text += `RICE Score: ${f.riceScore} | Recommendation: ${f.recommendation}\n`;
        text += `Reach: ${f.reach} | Impact: ${f.impact} | Confidence: ${f.confidence} | Effort: ${f.effort}\n\n`;
        if (f.reasoning) text += `**Reasoning:** ${f.reasoning}\n\n`;
        if (f.tradeoffs) text += `**Tradeoffs:** ${f.tradeoffs}\n\n`;
      });
      if (r.summary) text += `## Summary\n${r.summary}\n\n`;
      break;
    }
    case "sprint-planner": {
      if (r.sprintGoal) text += `## Sprint Goal\n${r.sprintGoal}\n\n`;
      if (r.duration) text += `Duration: ${r.duration}\n`;
      if (r.capacity) text += `Capacity: ${r.capacity}\n`;
      if (r.totalPoints) text += `Total Points: ${r.totalPoints}\n\n`;
      const stories = (r.stories as any[]) || [];
      if (stories.length) {
        text += `## Stories\n`;
        stories.forEach(s => { text += `- ${s.title} (${s.storyPoints} pts, ${s.priority})\n`; });
        text += "\n";
      }
      const risks = (r.risks as any[]) || [];
      if (risks.length) {
        text += `## Risks\n`;
        risks.forEach(rk => { text += `- ${rk.risk} (${rk.severity}) — ${rk.mitigation}\n`; });
        text += "\n";
      }
      const recs = (r.recommendations as string[]) || [];
      if (recs.length) {
        text += `## Recommendations\n${recs.map(rc => `- ${rc}`).join("\n")}\n\n`;
      }
      break;
    }
    case "interview-prep": {
      if (r.question) text += `## Question\n${r.question}\n\n`;
      if (r.framework) text += `**Framework:** ${r.framework}\n\n`;
      if (r.structuredAnswer) text += `## Structured Answer\n${r.structuredAnswer}\n\n`;
      if ((r.keyPoints as string[])?.length) text += `## Key Points\n${(r.keyPoints as string[]).map(p => `- ${p}`).join("\n")}\n\n`;
      if (r.exampleScenario) text += `## Example Scenario\n${r.exampleScenario}\n\n`;
      if ((r.followUpQuestions as string[])?.length) text += `## Follow-up Questions\n${(r.followUpQuestions as string[]).map(q => `- ${q}`).join("\n")}\n\n`;
      if ((r.tips as string[])?.length) text += `## Tips\n${(r.tips as string[]).map(t => `- ${t}`).join("\n")}\n\n`;
      if (r.feedback) text += `## Feedback\n${r.feedback}\n\n`;
      break;
    }
  }
  return text;
}

function buildToolPdfHtml(toolResult: ToolResult): string {
  const r = toolResult.result as Record<string, unknown>;
  const css = `body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;line-height:1.6;color:#333;background:white;padding:2rem;max-width:900px;margin:0 auto}h1{font-size:2rem;font-weight:700;margin-bottom:.5rem}h2{font-size:1.3rem;font-weight:600;margin-top:1.5rem;margin-bottom:.75rem;border-bottom:2px solid #e5e7eb;padding-bottom:.25rem}p{margin:.5rem 0;color:#555}ul{padding-left:2rem}li{margin:.25rem 0;color:#555}.badge{display:inline-block;padding:.15rem .5rem;border-radius:4px;font-size:.8rem;background:#f0f0f0;margin-right:.5rem}.card{break-inside:avoid;margin-bottom:1rem;padding:.75rem;border-left:4px solid #7c3aed;background:#f9fafb;border-radius:4px}@media print{body{padding:1rem}h2{page-break-after:avoid}.card{page-break-inside:avoid}}`;
  let body = `<h1>${toolResult.title}</h1><p style="color:#888">${TOOL_META[toolResult.toolType]?.label || toolResult.toolType}</p>`;

  switch (toolResult.toolType) {
    case "user-stories": {
      const stories = (r.userStories as any[]) || [];
      stories.forEach((s, i) => {
        body += `<div class="card"><strong>US-${String(i+1).padStart(3,"0")}: ${s.title}</strong> <span class="badge">${s.priority}</span><p>${s.description}</p>`;
        if (s.acceptanceCriteria?.length) body += `<strong>Acceptance Criteria:</strong><ul>${s.acceptanceCriteria.map((c: string) => `<li>${c}</li>`).join("")}</ul>`;
        if (s.edgeCases?.length) body += `<strong>Edge Cases:</strong><ul>${s.edgeCases.map((e: string) => `<li>${e}</li>`).join("")}</ul>`;
        body += `</div>`;
      });
      break;
    }
    case "problem-refiner": {
      if (r.refinedStatement) body += `<h2>Refined Statement</h2><p><strong>${r.refinedStatement}</strong></p>`;
      if (r.context) body += `<h2>Context</h2><p>${r.context}</p>`;
      if (r.impact) body += `<h2>Impact</h2><p>${r.impact}</p>`;
      if (r.affectedUsers) body += `<h2>Affected Users</h2><p>${r.affectedUsers}</p>`;
      if (r.currentSolutions) body += `<h2>Current Solutions</h2><p>${r.currentSolutions}</p>`;
      if (r.proposedApproach) body += `<h2>Proposed Approach</h2><p>${r.proposedApproach}</p>`;
      if ((r.successCriteria as string[])?.length) body += `<h2>Success Criteria</h2><ul>${(r.successCriteria as string[]).map(c => `<li>${c}</li>`).join("")}</ul>`;
      break;
    }
    case "feature-prioritizer": {
      const features = (r.features as any[]) || [];
      features.forEach(f => {
        body += `<div class="card"><strong>${f.name}</strong> <span class="badge">${f.recommendation}</span> <span class="badge">RICE: ${f.riceScore}</span><p>Reach: ${f.reach} | Impact: ${f.impact} | Confidence: ${f.confidence} | Effort: ${f.effort}</p>`;
        if (f.reasoning) body += `<p><strong>Reasoning:</strong> ${f.reasoning}</p>`;
        body += `</div>`;
      });
      if (r.summary) body += `<h2>Summary</h2><p>${r.summary}</p>`;
      break;
    }
    case "sprint-planner": {
      if (r.sprintGoal) body += `<h2>Sprint Goal</h2><p>${r.sprintGoal}</p>`;
      body += `<p>Duration: ${r.duration || "—"} | Capacity: ${r.capacity || "—"} | Total Points: ${r.totalPoints || "—"}</p>`;
      const stories = (r.stories as any[]) || [];
      if (stories.length) { body += `<h2>Stories</h2>`; stories.forEach(s => { body += `<div class="card"><strong>${s.title}</strong> <span class="badge">${s.storyPoints} pts</span> <span class="badge">${s.priority}</span></div>`; }); }
      const risks = (r.risks as any[]) || [];
      if (risks.length) { body += `<h2>Risks</h2>`; risks.forEach(rk => { body += `<div class="card"><strong>${rk.risk}</strong> <span class="badge">${rk.severity}</span><p>${rk.mitigation}</p></div>`; }); }
      break;
    }
    case "interview-prep": {
      if (r.framework) body += `<p><span class="badge">Framework: ${r.framework}</span></p>`;
      if (r.structuredAnswer) body += `<h2>Structured Answer</h2><p>${(r.structuredAnswer as string).replace(/\n/g, "<br>")}</p>`;
      if ((r.keyPoints as string[])?.length) body += `<h2>Key Points</h2><ul>${(r.keyPoints as string[]).map(p => `<li>${p}</li>`).join("")}</ul>`;
      if (r.exampleScenario) body += `<h2>Example Scenario</h2><p>${(r.exampleScenario as string).replace(/\n/g, "<br>")}</p>`;
      if ((r.tips as string[])?.length) body += `<h2>Tips</h2><ul>${(r.tips as string[]).map(t => `<li>${t}</li>`).join("")}</ul>`;
      break;
    }
  }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${toolResult.title}</title><style>${css}</style></head><body>${body}</body></html>`;
}

function UserStoriesView({ result, readOnly, onSaveResult }: { result: Record<string, unknown>; readOnly: boolean; onSaveResult: (r: Record<string, unknown>) => void }) {
  const stories = (result.userStories as any[]) || [];
  return (
    <div className="space-y-3">
      {stories.map((story: any, index: number) => (
        <Collapsible key={story.id || index} defaultOpen={index === 0}>
          <Card>
            <CollapsibleTrigger asChild>
              <button className="w-full p-4 flex items-start justify-between gap-4 text-left hover-elevate rounded-md" data-testid={`button-story-toggle-${index}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground">US-{String(index + 1).padStart(3, "0")}</span>
                    <PriorityBadge priority={story.priority} />
                  </div>
                  <h4 className="font-medium mt-1 line-clamp-1">{story.title}</h4>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-4">
                <Separator />
                <EditableText
                  value={story.description}
                  readOnly={readOnly}
                  onSave={(v) => {
                    const updated = [...stories];
                    updated[index] = { ...updated[index], description: v };
                    onSaveResult({ ...result, userStories: updated });
                  }}
                />
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
      ))}
    </div>
  );
}

function ProblemRefinerView({ result, readOnly, onSaveResult }: { result: Record<string, unknown>; readOnly: boolean; onSaveResult: (r: Record<string, unknown>) => void }) {
  const saveField = (key: string, value: string) => onSaveResult({ ...result, [key]: value });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Original Problem</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground italic leading-relaxed" data-testid="text-original-problem">{result.originalProblem as string}</p>
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
            <EditableText value={result.refinedStatement as string || ""} readOnly={readOnly} onSave={(v) => saveField("refinedStatement", v)} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {Boolean(result.context) && (
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-2"><Lightbulb className="h-5 w-5 text-primary" />Context</h3>
              <EditableText value={result.context as string} readOnly={readOnly} onSave={(v) => saveField("context", v)} />
            </div>
          )}
          {Boolean(result.impact) && (<><Separator /><div><h3 className="font-semibold flex items-center gap-2 mb-2"><BarChart3 className="h-5 w-5 text-primary" />Impact</h3><EditableText value={result.impact as string} readOnly={readOnly} onSave={(v) => saveField("impact", v)} /></div></>)}
          {Boolean(result.affectedUsers) && (<><Separator /><div><h3 className="font-semibold flex items-center gap-2 mb-2"><Users className="h-5 w-5 text-primary" />Affected Users</h3><EditableText value={result.affectedUsers as string} readOnly={readOnly} onSave={(v) => saveField("affectedUsers", v)} /></div></>)}
          {Boolean(result.currentSolutions) && (<><Separator /><div><h3 className="font-semibold flex items-center gap-2 mb-2"><Shield className="h-5 w-5 text-primary" />Current Solutions</h3><EditableText value={result.currentSolutions as string} readOnly={readOnly} onSave={(v) => saveField("currentSolutions", v)} /></div></>)}
          {Boolean(result.proposedApproach) && (<><Separator /><div><h3 className="font-semibold flex items-center gap-2 mb-2"><Target className="h-5 w-5 text-primary" />Proposed Approach</h3><EditableText value={result.proposedApproach as string} readOnly={readOnly} onSave={(v) => saveField("proposedApproach", v)} /></div></>)}
          {(result.successCriteria as string[])?.length > 0 && (
            <><Separator /><div>
              <h3 className="font-semibold flex items-center gap-2 mb-2"><CheckCircle2 className="h-5 w-5 text-primary" />Success Criteria</h3>
              <ul className="space-y-2">
                {(result.successCriteria as string[]).map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /><span>{c}</span>
                  </li>
                ))}
              </ul>
            </div></>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FeaturePrioritizerView({ result, readOnly }: { result: Record<string, unknown>; readOnly: boolean }) {
  const features = [...((result.features as any[]) || [])].sort((a, b) => (b.riceScore || 0) - (a.riceScore || 0));

  return (
    <div className="space-y-4">
      {features.map((feature, index) => (
        <Collapsible key={index} defaultOpen={index === 0}>
          <Card>
            <CollapsibleTrigger asChild>
              <button className="w-full p-4 flex items-start justify-between gap-4 text-left hover-elevate rounded-md" data-testid={`button-feature-toggle-${index}`}>
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
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-4">
                <Separator />
                {feature.reasoning && (<div><h5 className="text-sm font-medium mb-1">Reasoning</h5><p className="text-sm text-muted-foreground leading-relaxed">{feature.reasoning}</p></div>)}
                {feature.tradeoffs && (<div><h5 className="text-sm font-medium mb-1">Tradeoffs</h5><p className="text-sm text-muted-foreground leading-relaxed">{feature.tradeoffs}</p></div>)}
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}

      {Boolean(result.summary) && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><ClipboardList className="h-5 w-5 text-primary" />Summary</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground leading-relaxed">{result.summary as string}</p></CardContent>
        </Card>
      )}
    </div>
  );
}

function SprintPlannerView({ result, readOnly }: { result: Record<string, unknown>; readOnly: boolean }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Star className="h-5 w-5 text-primary" />Sprint Goal</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed" data-testid="text-sprint-goal">{result.sprintGoal as string}</p>
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground flex-wrap">
            {Boolean(result.duration) && <span>Duration: <strong className="text-foreground">{String(result.duration)}</strong></span>}
            {Boolean(result.capacity) && <span>Capacity: <strong className="text-foreground">{String(result.capacity)}</strong></span>}
            {Boolean(result.totalPoints) && <span>Total Points: <strong className="text-foreground">{String(result.totalPoints)}</strong></span>}
          </div>
        </CardContent>
      </Card>

      {(result.stories as any[])?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><ClipboardList className="h-5 w-5 text-primary" />Stories</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(result.stories as any[]).map((story, index) => (
                <div key={index} className="flex items-start justify-between gap-4 p-3 rounded-md border flex-wrap" data-testid={`card-story-${index}`}>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium">{story.title}</h4>
                    {story.assignmentSuggestion && <p className="text-xs text-muted-foreground mt-1">{story.assignmentSuggestion}</p>}
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

      {(result.risks as any[])?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" />Risks</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(result.risks as any[]).map((risk, index) => (
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

      {(result.recommendations as string[])?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" />Recommendations</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(result.recommendations as string[]).map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /><span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InterviewPrepView({ result, readOnly, onSaveResult }: { result: Record<string, unknown>; readOnly: boolean; onSaveResult: (r: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base" data-testid="text-question">{result.question as string}</CardTitle>
          <CardDescription className="flex items-center gap-2 flex-wrap">
            Framework:
            <Badge variant="outline" className="no-default-hover-elevate" data-testid="badge-framework">{result.framework as string}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Boolean(result.structuredAnswer) && (
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-2"><MessageSquare className="h-5 w-5 text-primary" />Structured Answer</h3>
              <EditableText value={result.structuredAnswer as string} readOnly={readOnly} onSave={(v) => onSaveResult({ ...result, structuredAnswer: v })} />
            </div>
          )}
          {(result.keyPoints as string[])?.length > 0 && (
            <><Separator /><div>
              <h3 className="font-semibold flex items-center gap-2 mb-2"><CheckCircle2 className="h-5 w-5 text-primary" />Key Points</h3>
              <ul className="space-y-2">
                {(result.keyPoints as string[]).map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /><span>{point}</span>
                  </li>
                ))}
              </ul>
            </div></>
          )}
        </CardContent>
      </Card>

      {Boolean(result.exampleScenario) && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" />Example Scenario</CardTitle></CardHeader>
          <CardContent>
            <EditableText value={result.exampleScenario as string} readOnly={readOnly} onSave={(v) => onSaveResult({ ...result, exampleScenario: v })} />
          </CardContent>
        </Card>
      )}

      {(result.followUpQuestions as string[])?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" />Follow-up Questions</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(result.followUpQuestions as string[]).map((q, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground" data-testid={`text-followup-${i}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" /><span>{q}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {Boolean(result.feedback) && (
        <Alert data-testid="alert-feedback">
          <Star className="h-4 w-4" />
          <AlertDescription><strong>Feedback:</strong> {result.feedback as string}</AlertDescription>
        </Alert>
      )}

      {(result.tips as string[])?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" />Tips</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(result.tips as string[]).map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground" data-testid={`text-tip-${i}`}>
                  <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" /><span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function ToolResultDisplay({ toolResult, onUpdate, readOnly = false }: ToolResultDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const { toast } = useToast();
  const meta = TOOL_META[toolResult.toolType] || { icon: BookOpen, label: toolResult.toolType };
  const Icon = meta.icon;

  const saveMutation = useMutation({
    mutationFn: async (updates: Partial<ToolResult>) => {
      const res = await apiRequest("PATCH", `/api/tool-results/${toolResult.id}`, updates);
      return res.json() as Promise<ToolResult>;
    },
    onSuccess: (updated) => {
      if (onUpdate) onUpdate(updated);
      queryClient.invalidateQueries({ queryKey: ["/api/tool-results"] });
      toast({ title: "Saved", description: "Changes saved successfully." });
    },
    onError: () => {
      toast({ title: "Save Failed", description: "Could not save changes.", variant: "destructive" });
    },
  });

  const shareMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/tool-results/${toolResult.id}/share`);
      return res.json() as Promise<{ shareId: string }>;
    },
    onSuccess: (data) => {
      const shareUrl = `${window.location.origin}/share/tool/${data.shareId}`;
      navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
      toast({ title: "Link Copied", description: "Shareable link copied to clipboard." });
    },
    onError: () => {
      toast({ title: "Share Failed", description: "Could not generate share link.", variant: "destructive" });
    },
  });

  const handleSaveResult = (newResult: Record<string, unknown>) => {
    saveMutation.mutate({ result: newResult } as Partial<ToolResult>);
  };

  const handleCopy = async () => {
    const text = generateToolMarkdown(toolResult);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const text = generateToolMarkdown(toolResult);
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${toolResult.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.md`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    const htmlContent = buildToolPdfHtml(toolResult);
    const printWindow = window.open("", "", "width=900,height=600");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => printWindow.print();
    }
  };

  const handleVersionRestore = (restoredResult: ToolResult) => {
    if (onUpdate) onUpdate(restoredResult);
    setShowVersionHistory(false);
  };

  const result = toolResult.result as Record<string, unknown>;

  return (
    <div className="space-y-6">
      <VersionHistoryDialog
        open={showVersionHistory}
        onOpenChange={setShowVersionHistory}
        toolResultId={toolResult.id}
        onRestore={handleVersionRestore}
      />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-tool-result-title">
            <Icon className="h-6 w-6 text-primary" />
            {toolResult.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{meta.label}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {saveMutation.isPending && (
            <Badge variant="secondary" className="shrink-0 no-default-hover-elevate">
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Saving...
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={handleCopy} data-testid="button-copy-result">
          {copied ? <><Check className="mr-2 h-4 w-4" />Copied</> : <><Copy className="mr-2 h-4 w-4" />Copy</>}
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadMarkdown} data-testid="button-download-markdown">
          <Download className="mr-2 h-4 w-4" />Markdown
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadPdf} data-testid="button-download-pdf">
          <FileDown className="mr-2 h-4 w-4" />PDF
        </Button>
        {!readOnly && (
          <>
            <Button variant="outline" size="sm" onClick={() => shareMutation.mutate()} disabled={shareMutation.isPending} data-testid="button-share-result">
              {linkCopied ? <><Check className="mr-2 h-4 w-4" />Link Copied</> : <><Link2 className="mr-2 h-4 w-4" />Share</>}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowVersionHistory(true)} data-testid="button-version-history">
              <History className="mr-2 h-4 w-4" />History
            </Button>
          </>
        )}
      </div>

      {toolResult.toolType === "user-stories" && <UserStoriesView result={result} readOnly={readOnly} onSaveResult={handleSaveResult} />}
      {toolResult.toolType === "problem-refiner" && <ProblemRefinerView result={result} readOnly={readOnly} onSaveResult={handleSaveResult} />}
      {toolResult.toolType === "feature-prioritizer" && <FeaturePrioritizerView result={result} readOnly={readOnly} />}
      {toolResult.toolType === "sprint-planner" && <SprintPlannerView result={result} readOnly={readOnly} />}
      {toolResult.toolType === "interview-prep" && <InterviewPrepView result={result} readOnly={readOnly} onSaveResult={handleSaveResult} />}

      <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" data-testid="alert-ai-disclaimer">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-800 dark:text-amber-300 text-sm">
          <strong>AI-Generated Content:</strong> This content was generated by AI and may contain inaccuracies.
          Please review and edit before sharing.
        </AlertDescription>
      </Alert>
    </div>
  );
}

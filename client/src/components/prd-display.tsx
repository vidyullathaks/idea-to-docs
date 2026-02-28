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
  Loader2,
  Download,
  FileDown,
  Link2,
  History,
  Save,
  X,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { NotionExportDialog } from "@/components/notion-export-dialog";
import type { Prd, UserStory, PrdVersion } from "@shared/schema";

interface PrdDisplayProps {
  prd: Prd;
  onUpdate?: (updates: Partial<Prd>) => void;
  readOnly?: boolean;
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
                <Button variant="outline" onClick={() => { setRewrittenContent(null); rewriteMutation.reset(); }} data-testid="button-rewrite-cancel">
                  Cancel
                </Button>
                <Button onClick={handleAccept} data-testid="button-rewrite-accept">
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

function VersionHistoryDialog({
  open,
  onOpenChange,
  prdId,
  onRestore,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prdId: number;
  onRestore: (prd: Prd) => void;
}) {
  const { data: versions = [], isLoading } = useQuery<PrdVersion[]>({
    queryKey: ["/api/prds", prdId, "versions"],
    queryFn: async () => {
      const res = await fetch(`/api/prds/${prdId}/versions`);
      if (!res.ok) throw new Error("Failed to fetch versions");
      return res.json();
    },
    enabled: open,
  });

  const { toast } = useToast();

  const restoreMutation = useMutation({
    mutationFn: async (versionId: number) => {
      const res = await apiRequest("POST", `/api/prds/${prdId}/versions/${versionId}/restore`);
      return res.json() as Promise<Prd>;
    },
    onSuccess: (prd) => {
      queryClient.invalidateQueries({ queryKey: ["/api/prds"] });
      queryClient.invalidateQueries({ queryKey: ["/api/prds", prdId, "versions"] });
      onRestore(prd);
      toast({ title: "Version Restored", description: "The PRD has been restored to the selected version." });
    },
    onError: () => {
      toast({ title: "Restore Failed", description: "Could not restore this version.", variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col" data-testid="dialog-version-history">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Version History
          </DialogTitle>
          <DialogDescription>View and restore previous versions of this PRD.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No previous versions yet. Versions are created when you edit or rewrite sections.
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
          <button className="w-full p-4 flex items-start justify-between gap-4 text-left hover-elevate rounded-md" data-testid={`button-story-toggle-${index}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-muted-foreground">US-{String(index + 1).padStart(3, '0')}</span>
                <PriorityBadge priority={story.priority} />
              </div>
              <h4 className="font-medium mt-1 line-clamp-1">{story.title}</h4>
            </div>
            {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            <Separator />
            <p className="text-sm text-muted-foreground leading-relaxed">{story.description}</p>
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

function EditableSection({ 
  icon: Icon, 
  title, 
  content,
  onSave,
  onRewrite,
  readOnly,
}: { 
  icon: React.ElementType; 
  title: string; 
  content: string;
  onSave?: (newContent: string) => void;
  onRewrite?: () => void;
  readOnly?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);

  const handleSave = () => {
    if (onSave && editValue !== content) {
      onSave(editValue);
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setEditValue(content);
    setEditing(false);
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        {title}
        {!readOnly && !editing && (
          <>
            <Button variant="ghost" size="icon" onClick={() => setEditing(true)} className="h-7 w-7" data-testid={`button-edit-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            {onRewrite && (
              <Button variant="ghost" size="icon" onClick={onRewrite} className="h-7 w-7" data-testid={`button-rewrite-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
          </>
        )}
      </h3>
      {editing ? (
        <div className="space-y-2">
          <Textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} className="min-h-[100px]" data-testid={`input-edit-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} />
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSave} data-testid={`button-save-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
              <Save className="mr-2 h-3.5 w-3.5" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-3.5 w-3.5" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
      )}
    </div>
  );
}

function EditableListSection({ 
  icon: Icon, 
  title, 
  items,
  onSave,
  onRewrite,
  readOnly,
}: { 
  icon: React.ElementType; 
  title: string; 
  items: string[] | null | undefined;
  onSave?: (newItems: string[]) => void;
  onRewrite?: () => void;
  readOnly?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState((items || []).join('\n'));

  if (!items || items.length === 0) return null;

  const handleSave = () => {
    if (onSave) {
      const newItems = editValue.split('\n').map(s => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
      onSave(newItems);
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setEditValue((items || []).join('\n'));
    setEditing(false);
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        {title}
        {!readOnly && !editing && (
          <>
            <Button variant="ghost" size="icon" onClick={() => { setEditValue(items.join('\n')); setEditing(true); }} className="h-7 w-7" data-testid={`button-edit-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            {onRewrite && (
              <Button variant="ghost" size="icon" onClick={onRewrite} className="h-7 w-7" data-testid={`button-rewrite-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
          </>
        )}
      </h3>
      {editing ? (
        <div className="space-y-2">
          <Textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} className="min-h-[120px]" placeholder="One item per line" data-testid={`input-edit-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} />
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSave} data-testid={`button-save-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
              <Save className="mr-2 h-3.5 w-3.5" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-3.5 w-3.5" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function PrdDisplay({ prd, onUpdate, readOnly = false }: PrdDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [rewriteDialog, setRewriteDialog] = useState<{
    sectionName: string;
    currentContent: string;
    fieldKey: keyof Prd;
    isArray: boolean;
  } | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showNotionExport, setShowNotionExport] = useState(false);
  const { toast } = useToast();

  const saveMutation = useMutation({
    mutationFn: async (updates: Partial<Prd>) => {
      const res = await apiRequest("PATCH", `/api/prds/${prd.id}`, updates);
      return res.json() as Promise<Prd>;
    },
    onSuccess: (updated) => {
      if (onUpdate) onUpdate(updated);
      queryClient.invalidateQueries({ queryKey: ["/api/prds"] });
      toast({ title: "Saved", description: "PRD section updated." });
    },
    onError: () => {
      toast({ title: "Save Failed", description: "Could not save changes.", variant: "destructive" });
    },
  });

  const shareMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/prds/${prd.id}/share`);
      return res.json() as Promise<{ shareId: string }>;
    },
    onSuccess: (data) => {
      const shareUrl = `${window.location.origin}/share/${data.shareId}`;
      navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
      toast({ title: "Link Copied", description: "Shareable link copied to clipboard." });
    },
    onError: () => {
      toast({ title: "Share Failed", description: "Could not generate share link.", variant: "destructive" });
    },
  });

  const handleSaveField = (fieldKey: string, value: string | string[]) => {
    saveMutation.mutate({ [fieldKey]: value } as Partial<Prd>);
  };

  const handleCopy = async () => {
    const text = generatePrdText(prd);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    try { await apiRequest("POST", "/api/analytics/export", { prdId: prd.id, exportType: 'markdown' }); } catch {}
  };

  const handleDownloadMarkdown = async () => {
    const text = generatePrdText(prd);
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${prd.title?.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'prd'}.md`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    try { await apiRequest("POST", "/api/analytics/export", { prdId: prd.id, exportType: 'markdown' }); } catch {}
  };

  const handleDownloadPdf = () => {
    const userStories = (prd.userStories as UserStory[]) || [];
    const htmlContent = buildPdfHtml(prd, userStories);
    const printWindow = window.open('', '', 'width=900,height=600');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => printWindow.print();
    }
    try { apiRequest("POST", "/api/analytics/export", { prdId: prd.id, exportType: 'pdf' }); } catch {}
  };

  const openRewrite = (sectionName: string, currentContent: string, fieldKey: keyof Prd, isArray: boolean) => {
    setRewriteDialog({ sectionName, currentContent, fieldKey, isArray });
  };

  const handleRewriteAccept = (rewrittenContent: string) => {
    if (!rewriteDialog) return;
    if (rewriteDialog.isArray) {
      const items = rewrittenContent.split('\n').map(s => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
      handleSaveField(rewriteDialog.fieldKey, items);
    } else {
      handleSaveField(rewriteDialog.fieldKey, rewrittenContent);
    }
  };

  const handleVersionRestore = (restoredPrd: Prd) => {
    if (onUpdate) onUpdate(restoredPrd);
    setShowVersionHistory(false);
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

      <VersionHistoryDialog
        open={showVersionHistory}
        onOpenChange={setShowVersionHistory}
        prdId={prd.id}
        onRestore={handleVersionRestore}
      />

      <NotionExportDialog
        open={showNotionExport}
        onOpenChange={setShowNotionExport}
        exportEndpoint={`/api/export/notion/prd/${prd.id}`}
      />

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold" data-testid="text-prd-title">
                {prd.title || "Product Requirements Document"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Generated from your product idea
              </p>
            </div>
            {saveMutation.isPending && (
              <Badge variant="secondary" className="shrink-0">
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Saving...
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleCopy} data-testid="button-copy-prd">
              {copied ? <><Check className="mr-2 h-4 w-4" />Copied</> : <><Copy className="mr-2 h-4 w-4" />Copy</>}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadMarkdown} data-testid="button-download-markdown">
              <Download className="mr-2 h-4 w-4" />Markdown
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPdf} data-testid="button-download-pdf">
              <FileDown className="mr-2 h-4 w-4" />PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowNotionExport(true)} data-testid="button-export-notion">
              <ExternalLink className="mr-2 h-4 w-4" />Notion
            </Button>
            {!readOnly && (
              <>
                <Button variant="outline" size="sm" onClick={() => shareMutation.mutate()} disabled={shareMutation.isPending} data-testid="button-share-prd">
                  {linkCopied ? <><Check className="mr-2 h-4 w-4" />Link Copied</> : <><Link2 className="mr-2 h-4 w-4" />Share</>}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowVersionHistory(true)} data-testid="button-version-history">
                  <History className="mr-2 h-4 w-4" />History
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {prd.problemStatement && (
            <EditableSection
              icon={Target}
              title="Problem Statement"
              content={prd.problemStatement}
              onSave={(v) => handleSaveField("problemStatement", v)}
              onRewrite={() => openRewrite("Problem Statement", prd.problemStatement!, "problemStatement", false)}
              readOnly={readOnly}
            />
          )}

          {prd.targetAudience && (
            <EditableSection
              icon={Users}
              title="Target Audience"
              content={prd.targetAudience}
              onSave={(v) => handleSaveField("targetAudience", v)}
              onRewrite={() => openRewrite("Target Audience", prd.targetAudience!, "targetAudience", false)}
              readOnly={readOnly}
            />
          )}

          <EditableListSection
            icon={Target}
            title="Goals & Objectives"
            items={prd.goals}
            onSave={(v) => handleSaveField("goals", v)}
            onRewrite={prd.goals?.length ? () => openRewrite("Goals & Objectives", prd.goals!.join('\n'), "goals", true) : undefined}
            readOnly={readOnly}
          />
          <EditableListSection
            icon={ListChecks}
            title="Key Features"
            items={prd.features}
            onSave={(v) => handleSaveField("features", v)}
            onRewrite={prd.features?.length ? () => openRewrite("Key Features", prd.features!.join('\n'), "features", true) : undefined}
            readOnly={readOnly}
          />
          <EditableListSection
            icon={BarChart3}
            title="Success Metrics"
            items={prd.successMetrics}
            onSave={(v) => handleSaveField("successMetrics", v)}
            onRewrite={prd.successMetrics?.length ? () => openRewrite("Success Metrics", prd.successMetrics!.join('\n'), "successMetrics", true) : undefined}
            readOnly={readOnly}
          />
          <EditableListSection
            icon={XCircle}
            title="Out of Scope"
            items={prd.outOfScope}
            onSave={(v) => handleSaveField("outOfScope", v)}
            onRewrite={prd.outOfScope?.length ? () => openRewrite("Out of Scope", prd.outOfScope!.join('\n'), "outOfScope", true) : undefined}
            readOnly={readOnly}
          />
          <EditableListSection
            icon={AlertCircle}
            title="Assumptions"
            items={prd.assumptions}
            onSave={(v) => handleSaveField("assumptions", v)}
            onRewrite={prd.assumptions?.length ? () => openRewrite("Assumptions", prd.assumptions!.join('\n'), "assumptions", true) : undefined}
            readOnly={readOnly}
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

      <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" data-testid="alert-ai-disclaimer">
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
  if (prd.problemStatement) text += `## Problem Statement\n${prd.problemStatement}\n\n`;
  if (prd.targetAudience) text += `## Target Audience\n${prd.targetAudience}\n\n`;
  if (prd.goals?.length) text += `## Goals & Objectives\n${prd.goals.map(g => `- ${g}`).join('\n')}\n\n`;
  if (prd.features?.length) text += `## Key Features\n${prd.features.map(f => `- ${f}`).join('\n')}\n\n`;
  if (prd.successMetrics?.length) text += `## Success Metrics\n${prd.successMetrics.map(m => `- ${m}`).join('\n')}\n\n`;
  if (prd.outOfScope?.length) text += `## Out of Scope\n${prd.outOfScope.map(o => `- ${o}`).join('\n')}\n\n`;
  if (prd.assumptions?.length) text += `## Assumptions\n${prd.assumptions.map(a => `- ${a}`).join('\n')}\n\n`;
  if (userStories.length > 0) {
    text += `## User Stories\n\n`;
    userStories.forEach((story, index) => {
      text += `### US-${String(index + 1).padStart(3, '0')}: ${story.title}\nPriority: ${story.priority}\n\n${story.description}\n\n**Acceptance Criteria:**\n`;
      story.acceptanceCriteria.forEach(ac => { text += `- ${ac}\n`; });
      text += '\n';
    });
  }
  return text;
}

function buildPdfHtml(prd: Prd, userStories: UserStory[]): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${prd.title || 'PRD'}</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;line-height:1.6;color:#333;background:white;padding:2rem;max-width:900px;margin:0 auto}h1{font-size:2rem;font-weight:700;margin-bottom:.5rem}h2{font-size:1.5rem;font-weight:600;margin-top:2rem;margin-bottom:1rem;border-bottom:2px solid #e5e7eb;padding-bottom:.5rem}p{margin:.5rem 0;color:#555}ul{padding-left:2rem}li{margin:.25rem 0;color:#555}.user-story{break-inside:avoid;margin-bottom:1.5rem;padding:1rem;border-left:4px solid #3b82f6;background:#f9fafb}.story-title{font-weight:600;margin-bottom:.5rem}.badge{display:inline-block;padding:.25rem .75rem;border-radius:4px;font-size:.875rem;background:#f0f0f0}@media print{body{padding:1rem}h2{page-break-after:avoid}.user-story{page-break-inside:avoid}}</style></head><body>
<h1>${prd.title || 'Product Requirements Document'}</h1>
${prd.problemStatement ? `<h2>Problem Statement</h2><p>${prd.problemStatement}</p>` : ''}
${prd.targetAudience ? `<h2>Target Audience</h2><p>${prd.targetAudience}</p>` : ''}
${prd.goals?.length ? `<h2>Goals & Objectives</h2><ul>${prd.goals.map(g => `<li>${g}</li>`).join('')}</ul>` : ''}
${prd.features?.length ? `<h2>Key Features</h2><ul>${prd.features.map(f => `<li>${f}</li>`).join('')}</ul>` : ''}
${prd.successMetrics?.length ? `<h2>Success Metrics</h2><ul>${prd.successMetrics.map(m => `<li>${m}</li>`).join('')}</ul>` : ''}
${prd.outOfScope?.length ? `<h2>Out of Scope</h2><ul>${prd.outOfScope.map(o => `<li>${o}</li>`).join('')}</ul>` : ''}
${prd.assumptions?.length ? `<h2>Assumptions</h2><ul>${prd.assumptions.map(a => `<li>${a}</li>`).join('')}</ul>` : ''}
${userStories.length > 0 ? `<h2>User Stories</h2>${userStories.map((s, i) => `<div class="user-story"><div class="story-title">US-${String(i+1).padStart(3,'0')}: ${s.title}</div><div>Priority: <span class="badge">${s.priority}</span></div><p>${s.description}</p><strong>Acceptance Criteria:</strong><ul>${s.acceptanceCriteria.map(ac => `<li>${ac}</li>`).join('')}</ul></div>`).join('')}` : ''}
</body></html>`;
}

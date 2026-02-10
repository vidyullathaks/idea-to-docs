import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Palette,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { CustomTemplate } from "@shared/schema";

export default function TemplatesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [idea, setIdea] = useState("");
  const [category, setCategory] = useState("custom");
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: templates = [], isLoading } = useQuery<CustomTemplate[]>({
    queryKey: ["/api/templates"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/templates", { name, description, idea, category });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      setShowCreate(false);
      setName("");
      setDescription("");
      setIdea("");
      setCategory("custom");
      toast({ title: "Template Created", description: "Your custom template has been saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create template.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({ title: "Template Deleted" });
    },
  });

  const handleUseTemplate = (template: CustomTemplate) => {
    navigate("/");
    setTimeout(() => {
      const event = new CustomEvent("use-template", { detail: { idea: template.idea } });
      window.dispatchEvent(event);
    }, 100);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-templates-title">
            <Palette className="h-6 w-6 text-primary" />
            Custom Templates
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Save your own product idea templates for quick reuse
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} data-testid="button-create-template">
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
              <Palette className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-lg">No custom templates yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create a template to save a reusable product idea
              </p>
            </div>
            <Button onClick={() => setShowCreate(true)} data-testid="button-create-first-template">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {templates.map((template) => (
            <Card key={template.id} className="hover-elevate" data-testid={`card-template-${template.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium" data-testid={`text-template-name-${template.id}`}>{template.name}</h3>
                      <Badge variant="secondary" className="text-xs">{template.category || "custom"}</Badge>
                    </div>
                    {template.description && (
                      <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{template.idea}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => handleUseTemplate(template)} data-testid={`button-use-template-${template.id}`}>
                      <Sparkles className="mr-2 h-3 w-3" />
                      Use
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(template.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-template-${template.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg" data-testid="dialog-create-template">
          <DialogHeader>
            <DialogTitle>Create Custom Template</DialogTitle>
            <DialogDescription>Save a product idea as a reusable template.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Template Name</label>
              <Input
                placeholder="e.g., Healthcare SaaS"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="input-template-name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description (optional)</label>
              <Input
                placeholder="Brief description of this template"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                data-testid="input-template-description"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Product Idea</label>
              <Textarea
                placeholder="Describe the product idea in detail (min 20 characters)..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                className="min-h-[120px]"
                data-testid="input-template-idea"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={name.length < 1 || idea.length < 20 || createMutation.isPending}
                data-testid="button-save-template"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Template"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

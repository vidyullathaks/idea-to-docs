import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeftRight, FileText, AlertCircle } from "lucide-react";
import type { Prd } from "@shared/schema";

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">{title}</h3>
  );
}

function TextSection({ title, value }: { title: string; value: string | null | undefined }) {
  return (
    <div className="mb-4">
      <SectionHeader title={title} />
      <p className="text-sm">{value || "Not specified"}</p>
    </div>
  );
}

function ListSection({
  title,
  items,
  otherCount,
}: {
  title: string;
  items: string[] | null | undefined;
  otherCount: number;
}) {
  const count = items?.length ?? 0;
  const diff = count - otherCount;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <SectionHeader title={title} />
        <Badge variant="secondary" data-testid={`badge-${title.toLowerCase().replace(/\s/g, "-")}-count`}>
          {count}
        </Badge>
        {diff !== 0 && (
          <Badge variant={diff > 0 ? "default" : "outline"} data-testid={`badge-${title.toLowerCase().replace(/\s/g, "-")}-diff`}>
            {diff > 0 ? `+${diff}` : diff}
          </Badge>
        )}
      </div>
      {items && items.length > 0 ? (
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li key={i} className="text-sm flex items-start gap-2">
              <span className="text-muted-foreground mt-1 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">None specified</p>
      )}
    </div>
  );
}

function PrdColumn({ prd, otherPrd }: { prd: Prd; otherPrd: Prd }) {
  const otherStoriesCount = otherPrd.userStories?.length ?? 0;
  const storiesCount = prd.userStories?.length ?? 0;
  const storiesDiff = storiesCount - otherStoriesCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 flex-wrap" data-testid={`text-prd-title-${prd.id}`}>
          <FileText className="h-5 w-5 text-primary shrink-0" />
          <span className="truncate">{prd.title || "Untitled PRD"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <TextSection title="Problem Statement" value={prd.problemStatement} />
        <Separator />
        <TextSection title="Target Audience" value={prd.targetAudience} />
        <Separator />
        <ListSection title="Goals" items={prd.goals} otherCount={otherPrd.goals?.length ?? 0} />
        <Separator />
        <ListSection title="Features" items={prd.features} otherCount={otherPrd.features?.length ?? 0} />
        <Separator />
        <ListSection title="Success Metrics" items={prd.successMetrics} otherCount={otherPrd.successMetrics?.length ?? 0} />
        <Separator />
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <SectionHeader title="User Stories" />
            <Badge variant="secondary" data-testid={`badge-user-stories-count-${prd.id}`}>
              {storiesCount}
            </Badge>
            {storiesDiff !== 0 && (
              <Badge variant={storiesDiff > 0 ? "default" : "outline"} data-testid={`badge-user-stories-diff-${prd.id}`}>
                {storiesDiff > 0 ? `+${storiesDiff}` : storiesDiff}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {storiesCount} user {storiesCount === 1 ? "story" : "stories"} defined
          </p>
        </div>
        <Separator />
        <ListSection title="Out of Scope" items={prd.outOfScope} otherCount={otherPrd.outOfScope?.length ?? 0} />
        <Separator />
        <ListSection title="Assumptions" items={prd.assumptions} otherCount={otherPrd.assumptions?.length ?? 0} />
      </CardContent>
    </Card>
  );
}

export default function ComparePrds() {
  const [leftId, setLeftId] = useState<string>("");
  const [rightId, setRightId] = useState<string>("");

  const { data: prds = [], isLoading } = useQuery<Prd[]>({
    queryKey: ["/api/prds"],
  });

  const leftPrd = prds.find((p) => p.id.toString() === leftId);
  const rightPrd = prds.find((p) => p.id.toString() === rightId);

  const handleSwap = () => {
    setLeftId(rightId);
    setRightId(leftId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center py-16">
          <p className="text-muted-foreground" data-testid="text-loading">Loading PRDs...</p>
        </div>
      </div>
    );
  }

  if (prds.length < 2) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-2xl font-bold mb-6" data-testid="text-page-title">Compare PRDs</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground text-center" data-testid="text-empty-state">
              Create at least 2 PRDs to compare them
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6" data-testid="text-page-title">Compare PRDs</h1>

      <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
        <Select value={leftId} onValueChange={setLeftId} data-testid="select-left-prd">
          <SelectTrigger className="w-full sm:flex-1" data-testid="select-trigger-left-prd">
            <SelectValue placeholder="Select first PRD" />
          </SelectTrigger>
          <SelectContent>
            {prds.map((prd) => (
              <SelectItem
                key={prd.id}
                value={prd.id.toString()}
                disabled={prd.id.toString() === rightId}
                data-testid={`select-item-left-${prd.id}`}
              >
                {prd.title || `PRD #${prd.id}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          size="icon"
          variant="outline"
          onClick={handleSwap}
          disabled={!leftId && !rightId}
          data-testid="button-swap-prds"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </Button>

        <Select value={rightId} onValueChange={setRightId} data-testid="select-right-prd">
          <SelectTrigger className="w-full sm:flex-1" data-testid="select-trigger-right-prd">
            <SelectValue placeholder="Select second PRD" />
          </SelectTrigger>
          <SelectContent>
            {prds.map((prd) => (
              <SelectItem
                key={prd.id}
                value={prd.id.toString()}
                disabled={prd.id.toString() === leftId}
                data-testid={`select-item-right-${prd.id}`}
              >
                {prd.title || `PRD #${prd.id}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {leftPrd && rightPrd ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="container-comparison">
          <PrdColumn prd={leftPrd} otherPrd={rightPrd} />
          <PrdColumn prd={rightPrd} otherPrd={leftPrd} />
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
            <ArrowLeftRight className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground text-center" data-testid="text-select-prompt">
              Select two PRDs above to compare them side by side
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

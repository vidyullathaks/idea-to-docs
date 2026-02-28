import { useQuery } from "@tanstack/react-query";
import { Cpu } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AIModel {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
  provider: string;
}

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const { data: models = [] } = useQuery<AIModel[]>({
    queryKey: ["/api/models"],
  });

  const openaiModels = models.filter((m) => m.provider === "openai");
  const anthropicModels = models.filter((m) => m.provider === "anthropic");

  return (
    <div className="flex items-center gap-2">
      <Cpu className="h-4 w-4 text-muted-foreground shrink-0" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[220px]" data-testid="select-model">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          {openaiModels.length > 0 && (
            <SelectGroup>
              <SelectLabel className="text-xs text-muted-foreground">OpenAI</SelectLabel>
              {openaiModels.map((model) => (
                <SelectItem key={model.id} value={model.id} data-testid={`option-model-${model.id}`}>
                  <span className="font-medium">{model.name}</span>
                  <span className="text-muted-foreground ml-2 text-xs">{model.description}</span>
                </SelectItem>
              ))}
            </SelectGroup>
          )}
          {anthropicModels.length > 0 && (
            <SelectGroup>
              <SelectLabel className="text-xs text-muted-foreground">Anthropic</SelectLabel>
              {anthropicModels.map((model) => (
                <SelectItem key={model.id} value={model.id} data-testid={`option-model-${model.id}`}>
                  <span className="font-medium">{model.name}</span>
                  <span className="text-muted-foreground ml-2 text-xs">{model.description}</span>
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

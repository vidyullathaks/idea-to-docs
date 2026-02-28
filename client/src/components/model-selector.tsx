import { useQuery } from "@tanstack/react-query";
import { Cpu } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AIModel {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
}

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const { data: models = [] } = useQuery<AIModel[]>({
    queryKey: ["/api/models"],
  });

  return (
    <div className="flex items-center gap-2">
      <Cpu className="h-4 w-4 text-muted-foreground shrink-0" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[200px]" data-testid="select-model">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id} data-testid={`option-model-${model.id}`}>
              <span className="font-medium">{model.name}</span>
              <span className="text-muted-foreground ml-2 text-xs">{model.description}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

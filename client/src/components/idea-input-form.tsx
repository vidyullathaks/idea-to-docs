import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles, Loader2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const formSchema = z.object({
  idea: z.string().min(20, "Please provide at least 20 characters to describe your idea"),
});

type FormData = z.infer<typeof formSchema>;

interface IdeaInputFormProps {
  onSubmit: (idea: string) => void;
  isLoading: boolean;
}

const exampleIdeas = [
  "A mobile app that helps remote teams stay connected through virtual coffee breaks",
  "An AI tool that analyzes customer support tickets to identify recurring issues",
  "A browser extension that summarizes long articles into key bullet points",
];

export function IdeaInputForm({ onSubmit, isLoading }: IdeaInputFormProps) {
  const [selectedExample, setSelectedExample] = useState<string | null>(null);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idea: "",
    },
  });

  const handleSubmit = (data: FormData) => {
    onSubmit(data.idea);
  };

  const handleExampleClick = (example: string) => {
    setSelectedExample(example);
    form.setValue("idea", example);
  };

  return (
    <Card className="border-0 bg-gradient-to-br from-card to-background">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-semibold flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-primary" />
          Describe Your Product Idea
        </CardTitle>
        <CardDescription className="text-base">
          Share your rough product concept and let AI transform it into a structured PRD with user stories and acceptance criteria.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="idea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Your Product Idea</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your product idea in detail. What problem does it solve? Who is it for? What are the key features you're envisioning?"
                      className="min-h-[180px] resize-none text-base leading-relaxed"
                      data-testid="input-idea"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              size="lg" 
              className="w-full"
              disabled={isLoading}
              data-testid="button-generate"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating PRD...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate PRD
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground font-medium">Need inspiration? Try one of these:</p>
          <div className="flex flex-col gap-2">
            {exampleIdeas.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleExampleClick(example)}
                className={`text-left text-sm p-3 rounded-md border transition-colors hover-elevate ${
                  selectedExample === example
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                }`}
                data-testid={`button-example-${index}`}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

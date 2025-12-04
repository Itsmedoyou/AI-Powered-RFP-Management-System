import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSubmit: (text: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSubmit, isLoading, placeholder }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      onSubmit(text.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative">
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Describe your procurement needs</p>
            <p className="text-xs text-muted-foreground">
              Our AI will convert your description into a structured RFP
            </p>
          </div>
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Example: I need to purchase 50 office laptops with Intel i7 processors, 16GB RAM, and 512GB SSD. Budget is around $50,000 with delivery needed within 30 days. Looking for a 2-year warranty and net-30 payment terms."}
          className="min-h-[160px] resize-none text-base leading-relaxed"
          disabled={isLoading}
          data-testid="input-nl-requirements"
        />

        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">Enter</kbd> to submit
          </p>
          <Button
            onClick={handleSubmit}
            disabled={!text.trim() || isLoading}
            className="gap-2"
            data-testid="button-generate-rfp"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Generate RFP
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

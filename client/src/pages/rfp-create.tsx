import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { ChatInput } from "@/components/chat-input";
import { RfpFormView } from "@/components/rfp-form-view";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertRfp, Rfp } from "@/lib/types";

export default function RfpCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [parsedRfp, setParsedRfp] = useState<Partial<InsertRfp> | null>(null);

  const generateMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", "/api/rfps/from-nl", { text });
      return response as { rfp: InsertRfp };
    },
    onSuccess: (data) => {
      setParsedRfp(data.rfp);
      toast({
        title: "RFP Generated",
        description: "Review and edit the extracted information below.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate RFP from your description.",
        variant: "destructive",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: InsertRfp) => {
      const response = await apiRequest("POST", "/api/rfps", data);
      return response as Rfp;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/rfps"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "RFP Created",
        description: "Your RFP has been saved successfully.",
      });
      setLocation(`/rfp/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save the RFP.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = (text: string) => {
    generateMutation.mutate(text);
  };

  const handleSave = (data: InsertRfp) => {
    saveMutation.mutate(data);
  };

  const handleReset = () => {
    setParsedRfp(null);
  };

  return (
    <div className="px-8 py-6 space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Create RFP</h1>
          <p className="text-muted-foreground mt-1">
            Describe your requirements in natural language
          </p>
        </div>
        {parsedRfp && (
          <Button variant="outline" onClick={handleReset} data-testid="button-start-over">
            Start Over
          </Button>
        )}
      </div>

      {!parsedRfp ? (
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSubmit={handleGenerate}
            isLoading={generateMutation.isPending}
            placeholder="Example: I need to purchase 50 office laptops with Intel i7 processors, 16GB RAM, and 512GB SSD. Budget is around $50,000 with delivery needed within 30 days. Looking for a 2-year warranty and net-30 payment terms."
          />

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-3">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Be Specific</h3>
              <p className="text-sm text-muted-foreground">
                Include quantities, specifications, budget, and timeline for best results.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-3">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Add Requirements</h3>
              <p className="text-sm text-muted-foreground">
                Mention warranty needs, payment terms, and delivery expectations.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-3">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Review & Edit</h3>
              <p className="text-sm text-muted-foreground">
                AI extracts a structured RFP that you can review and modify.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <RfpFormView
            initialData={parsedRfp}
            onSave={handleSave}
            isSaving={saveMutation.isPending}
          />
        </div>
      )}
    </div>
  );
}

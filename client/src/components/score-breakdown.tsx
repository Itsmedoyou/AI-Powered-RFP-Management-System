import { Progress } from "@/components/ui/progress";
import type { ProposalScore } from "@/lib/types";

interface ScoreBreakdownProps {
  score: ProposalScore;
}

const scoreLabels = {
  priceScore: { label: "Price", weight: "40%" },
  deliveryScore: { label: "Delivery", weight: "20%" },
  warrantyScore: { label: "Warranty", weight: "15%" },
  completenessScore: { label: "Completeness", weight: "15%" },
  vendorRatingScore: { label: "Vendor Rating", weight: "10%" },
};

export function ScoreBreakdown({ score }: ScoreBreakdownProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold">{score.totalScore.toFixed(1)}</span>
        <span className="text-sm text-muted-foreground">/ 100</span>
      </div>

      <div className="space-y-2">
        {Object.entries(scoreLabels).map(([key, { label, weight }]) => {
          const value = score[key as keyof typeof scoreLabels];
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {label} ({weight})
                </span>
                <span className="font-medium">{value.toFixed(1)}</span>
              </div>
              <Progress value={value} className="h-1.5" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

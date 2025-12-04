import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import {
  ArrowLeft,
  Sparkles,
  Trophy,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScoreBreakdown } from "@/components/score-breakdown";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { Rfp, Proposal, ComparisonResult } from "@/lib/types";

export default function Comparison() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const { data: rfp, isLoading: rfpLoading } = useQuery<Rfp>({
    queryKey: ["/api/rfps", params.id],
  });

  const { data: proposals, isLoading: proposalsLoading } = useQuery<Proposal[]>({
    queryKey: ["/api/rfps", params.id, "proposals"],
  });

  const { data: comparison, isLoading: comparisonLoading } = useQuery<ComparisonResult>({
    queryKey: ["/api/rfps", params.id, "comparison"],
    enabled: !!proposals && proposals.length > 1,
  });

  const isLoading = rfpLoading || proposalsLoading || comparisonLoading;

  if (isLoading) {
    return (
      <div className="px-8 py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <div className="flex-1">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!rfp) {
    return (
      <div className="px-8 py-6">
        <EmptyState
          icon={AlertCircle}
          title="RFP Not Found"
          description="The RFP you're looking for doesn't exist."
          action={{
            label: "Back to RFPs",
            onClick: () => setLocation("/rfps"),
          }}
        />
      </div>
    );
  }

  if (!proposals || proposals.length < 2) {
    return (
      <div className="px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation(`/rfp/${params.id}`)}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Compare Proposals</h1>
            <p className="text-muted-foreground">{rfp.title}</p>
          </div>
        </div>
        <EmptyState
          icon={AlertCircle}
          title="Not Enough Proposals"
          description="You need at least 2 proposals to compare. Wait for more vendor responses."
          action={{
            label: "Back to RFP",
            onClick: () => setLocation(`/rfp/${params.id}`),
          }}
        />
      </div>
    );
  }

  const recommendedProposal = proposals.find(
    (p) => p.vendorId === comparison?.recommendedVendorId
  );

  const getScoreForProposal = (proposalId: string) => {
    return comparison?.scores.find((s) => s.proposalId === proposalId);
  };

  return (
    <div className="px-8 py-6 space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation(`/rfp/${params.id}`)}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold">Compare Proposals</h1>
          <p className="text-muted-foreground mt-1">{rfp.title}</p>
        </div>
      </div>

      {comparison && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">AI Recommendation</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Based on price, delivery, warranty, and completeness
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold text-lg">
                {recommendedProposal?.vendorName || "Unknown Vendor"}
              </span>
              <Badge className="bg-primary text-primary-foreground">
                Recommended
              </Badge>
            </div>
            <p className="text-muted-foreground">{comparison.reason}</p>
            <div className="p-4 rounded-lg bg-background">
              <p className="font-medium mb-2">Summary</p>
              <p className="text-sm text-muted-foreground">{comparison.summary}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proposals.map((proposal) => {
          const score = getScoreForProposal(proposal.id);
          const isRecommended = proposal.vendorId === comparison?.recommendedVendorId;

          return (
            <Card
              key={proposal.id}
              className={isRecommended ? "ring-2 ring-primary" : ""}
              data-testid={`comparison-card-${proposal.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{proposal.vendorName}</CardTitle>
                    <p className="text-2xl font-bold mt-1">
                      ${proposal.totalPrice.toLocaleString()}
                    </p>
                  </div>
                  {isRecommended && (
                    <Trophy className="h-6 w-6 text-yellow-500 shrink-0" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Items</p>
                    <p className="font-medium">{proposal.lineItems.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment</p>
                    <p className="font-medium">{proposal.paymentTerms || "N/A"}</p>
                  </div>
                </div>

                {score && <ScoreBreakdown score={score} />}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background">Vendor</TableHead>
                  <TableHead className="text-right">Total Price</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead>Payment Terms</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((proposal) => {
                  const score = getScoreForProposal(proposal.id);
                  const isRecommended = proposal.vendorId === comparison?.recommendedVendorId;

                  return (
                    <TableRow
                      key={proposal.id}
                      className={isRecommended ? "bg-primary/5" : ""}
                    >
                      <TableCell className="sticky left-0 bg-inherit font-medium">
                        <div className="flex items-center gap-2">
                          {proposal.vendorName}
                          {isRecommended && (
                            <Badge className="bg-primary text-primary-foreground text-xs">
                              Best
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ${proposal.totalPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {proposal.lineItems.length}
                      </TableCell>
                      <TableCell>{proposal.paymentTerms || "-"}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {score?.totalScore.toFixed(1) || "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {comparison?.scores && comparison.scores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Score Breakdown by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background">Vendor</TableHead>
                    <TableHead className="text-right">Price (40%)</TableHead>
                    <TableHead className="text-right">Delivery (20%)</TableHead>
                    <TableHead className="text-right">Warranty (15%)</TableHead>
                    <TableHead className="text-right">Completeness (15%)</TableHead>
                    <TableHead className="text-right">Rating (10%)</TableHead>
                    <TableHead className="text-right font-bold">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparison.scores.map((score) => {
                    const isRecommended = proposals.find(p => p.id === score.proposalId)?.vendorId === comparison.recommendedVendorId;

                    return (
                      <TableRow
                        key={score.proposalId}
                        className={isRecommended ? "bg-primary/5" : ""}
                      >
                        <TableCell className="sticky left-0 bg-inherit font-medium">
                          {score.vendorName}
                        </TableCell>
                        <TableCell className="text-right">{score.priceScore.toFixed(1)}</TableCell>
                        <TableCell className="text-right">{score.deliveryScore.toFixed(1)}</TableCell>
                        <TableCell className="text-right">{score.warrantyScore.toFixed(1)}</TableCell>
                        <TableCell className="text-right">{score.completenessScore.toFixed(1)}</TableCell>
                        <TableCell className="text-right">{score.vendorRatingScore.toFixed(1)}</TableCell>
                        <TableCell className="text-right font-bold">{score.totalScore.toFixed(1)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

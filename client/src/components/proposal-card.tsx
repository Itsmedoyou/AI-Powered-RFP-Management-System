import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, Download, FileText, DollarSign, Clock } from "lucide-react";
import type { Proposal } from "@/lib/types";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface ProposalCardProps {
  proposal: Proposal;
  isRecommended?: boolean;
  score?: number;
}

export function ProposalCard({ proposal, isRecommended, score }: ProposalCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card 
      className={`transition-all ${isRecommended ? "ring-2 ring-primary" : ""}`}
      data-testid={`proposal-card-${proposal.id}`}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-semibold text-lg">{proposal.vendorName}</h3>
                {isRecommended && (
                  <Badge className="bg-primary text-primary-foreground">
                    Recommended
                  </Badge>
                )}
                {score !== undefined && (
                  <Badge variant="outline">
                    Score: {score.toFixed(1)}/100
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Received {formatDistanceToNow(new Date(proposal.receivedAt), { addSuffix: true })}
              </p>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" data-testid={`button-expand-proposal-${proposal.id}`}>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="font-semibold text-foreground">
                ${proposal.totalPrice.toLocaleString()}
              </span>
            </div>
            {proposal.paymentTerms && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{proposal.paymentTerms}</span>
              </div>
            )}
            {proposal.attachments.length > 0 && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{proposal.attachments.length} attachment{proposal.attachments.length !== 1 ? "s" : ""}</span>
              </div>
            )}
          </div>

          <CollapsibleContent className="mt-4">
            <div className="space-y-4">
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Warranty</TableHead>
                      <TableHead className="text-right">Delivery</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proposal.lineItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.itemName}</TableCell>
                        <TableCell className="text-right">{item.qty}</TableCell>
                        <TableCell className="text-right">${item.unitPrice.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${item.totalPrice.toLocaleString()}</TableCell>
                        <TableCell>{item.warranty || "-"}</TableCell>
                        <TableCell className="text-right">
                          {item.deliveryDays ? `${item.deliveryDays} days` : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {proposal.notes && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium mb-1">Notes</p>
                  <p className="text-sm text-muted-foreground">{proposal.notes}</p>
                </div>
              )}

              {proposal.attachments.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Attachments</p>
                  <div className="flex flex-wrap gap-2">
                    {proposal.attachments.map((att, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        asChild
                        className="gap-2"
                      >
                        <a href={att.url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-3.5 w-3.5" />
                          {att.filename}
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}

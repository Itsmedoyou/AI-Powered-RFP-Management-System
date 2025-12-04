import { Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Calendar, Users, DollarSign } from "lucide-react";
import type { Rfp } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface RfpCardProps {
  rfp: Rfp;
}

export function RfpCard({ rfp }: RfpCardProps) {
  const formattedDate = formatDistanceToNow(new Date(rfp.createdAt), { addSuffix: true });

  return (
    <Link href={`/rfp/${rfp.id}`}>
      <Card className="hover-elevate cursor-pointer transition-all" data-testid={`rfp-card-${rfp.id}`}>
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate" data-testid={`rfp-title-${rfp.id}`}>
              {rfp.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {rfp.items.length} item{rfp.items.length !== 1 ? "s" : ""}
            </p>
          </div>
          <StatusBadge status={rfp.status} />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
            {rfp.sentVendorIds.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                <span>{rfp.sentVendorIds.length} vendor{rfp.sentVendorIds.length !== 1 ? "s" : ""}</span>
              </div>
            )}
            {rfp.totalBudget && (
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" />
                <span>{rfp.currency} {rfp.totalBudget.toLocaleString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

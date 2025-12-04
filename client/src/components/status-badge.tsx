import { Badge } from "@/components/ui/badge";
import type { RfpStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: RfpStatus;
  className?: string;
}

const statusConfig: Record<RfpStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Draft", variant: "secondary" },
  sent: { label: "Sent", variant: "default" },
  received: { label: "Received", variant: "outline" },
  compared: { label: "Compared", variant: "default" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant={config.variant} 
      className={className}
      data-testid={`status-badge-${status}`}
    >
      {config.label}
    </Badge>
  );
}

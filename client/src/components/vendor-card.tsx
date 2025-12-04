import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Mail, Edit, Trash2 } from "lucide-react";
import type { Vendor } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface VendorCardProps {
  vendor: Vendor;
  onEdit?: (vendor: Vendor) => void;
  onDelete?: (vendor: Vendor) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (vendor: Vendor) => void;
}

export function VendorCard({ 
  vendor, 
  onEdit, 
  onDelete,
  selectable,
  selected,
  onSelect,
}: VendorCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
      />
    ));
  };

  return (
    <Card 
      className={`hover-elevate transition-all ${selectable ? "cursor-pointer" : ""} ${selected ? "ring-2 ring-primary" : ""}`}
      onClick={() => selectable && onSelect?.(vendor)}
      data-testid={`vendor-card-${vendor.id}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                {vendor.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold truncate" data-testid={`vendor-name-${vendor.id}`}>
                  {vendor.name}
                </h3>
                <p className="text-sm text-muted-foreground truncate">{vendor.contactPerson}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1">
              {renderStars(vendor.rating)}
              <span className="ml-2 text-sm text-muted-foreground">({vendor.rating}/5)</span>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate">{vendor.email}</span>
            </div>

            {vendor.capabilities.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {vendor.capabilities.slice(0, 3).map((cap) => (
                  <Badge key={cap} variant="secondary" className="text-xs">
                    {cap}
                  </Badge>
                ))}
                {vendor.capabilities.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{vendor.capabilities.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {vendor.lastContactedAt && (
              <p className="mt-3 text-xs text-muted-foreground">
                Last contacted {formatDistanceToNow(new Date(vendor.lastContactedAt), { addSuffix: true })}
              </p>
            )}
          </div>

          {(onEdit || onDelete) && !selectable && (
            <div className="flex flex-col gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(vendor);
                  }}
                  data-testid={`button-edit-vendor-${vendor.id}`}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(vendor);
                  }}
                  data-testid={`button-delete-vendor-${vendor.id}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

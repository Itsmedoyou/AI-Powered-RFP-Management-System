import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VendorCard } from "@/components/vendor-card";
import { Search, Loader2, Send } from "lucide-react";
import type { Vendor } from "@/lib/types";

interface VendorSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendors: Vendor[];
  isLoading?: boolean;
  onSend: (vendorIds: string[]) => void;
  isSending?: boolean;
}

export function VendorSelector({
  open,
  onOpenChange,
  vendors,
  isLoading,
  onSend,
  isSending,
}: VendorSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase()) ||
      v.capabilities.some((c) =>
        c.toLowerCase().includes(search.toLowerCase())
      )
  );

  const toggleVendor = (vendor: Vendor) => {
    setSelectedIds((prev) =>
      prev.includes(vendor.id)
        ? prev.filter((id) => id !== vendor.id)
        : [...prev, vendor.id]
    );
  };

  const handleSend = () => {
    onSend(selectedIds);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Vendors to Send RFP</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendors..."
            className="pl-10"
            data-testid="input-search-vendors"
          />
        </div>

        <div className="flex-1 overflow-y-auto mt-4 space-y-3 min-h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <p>No vendors found</p>
              {search && (
                <p className="text-sm">Try a different search term</p>
              )}
            </div>
          ) : (
            filteredVendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                selectable
                selected={selectedIds.includes(vendor.id)}
                onSelect={toggleVendor}
              />
            ))
          )}
        </div>

        <DialogFooter className="gap-3 sm:gap-0">
          <p className="text-sm text-muted-foreground mr-auto">
            {selectedIds.length} vendor{selectedIds.length !== 1 ? "s" : ""} selected
          </p>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-send"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={selectedIds.length === 0 || isSending}
            className="gap-2"
            data-testid="button-send-rfp"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send RFP
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

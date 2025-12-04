import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, FileText, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RfpCard } from "@/components/rfp-card";
import { RfpCardSkeleton } from "@/components/loading-skeleton";
import { EmptyState } from "@/components/empty-state";
import type { Rfp, RfpStatus } from "@/lib/types";

export default function RfpList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RfpStatus | "all">("all");

  const { data: rfps, isLoading } = useQuery<Rfp[]>({
    queryKey: ["/api/rfps"],
  });

  const filteredRfps = rfps?.filter((rfp) => {
    const matchesSearch = rfp.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || rfp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="px-8 py-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">RFPs</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all your RFPs
          </p>
        </div>
        <Link href="/rfp/create">
          <Button className="gap-2" data-testid="button-create-rfp">
            <Plus className="h-4 w-4" />
            Create RFP
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search RFPs..."
            className="pl-10"
            data-testid="input-search-rfps"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as RfpStatus | "all")}
        >
          <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="compared">Compared</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RfpCardSkeleton />
          <RfpCardSkeleton />
          <RfpCardSkeleton />
          <RfpCardSkeleton />
          <RfpCardSkeleton />
          <RfpCardSkeleton />
        </div>
      ) : !filteredRfps || filteredRfps.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={search || statusFilter !== "all" ? "No RFPs found" : "No RFPs yet"}
          description={
            search || statusFilter !== "all"
              ? "Try different search criteria or filters."
              : "Create your first RFP to start automating your procurement process."
          }
          action={
            !search && statusFilter === "all"
              ? {
                  label: "Create RFP",
                  onClick: () => window.location.href = "/rfp/create",
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRfps.map((rfp) => (
            <RfpCard key={rfp.id} rfp={rfp} />
          ))}
        </div>
      )}
    </div>
  );
}

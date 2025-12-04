import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams, Link } from "wouter";
import {
  ArrowLeft,
  Send,
  BarChart3,
  FileText,
  Users,
  Inbox,
  DollarSign,
  Clock,
  Calendar,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { ProposalCard } from "@/components/proposal-card";
import { VendorSelector } from "@/components/vendor-selector";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Rfp, Vendor, Proposal } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

export default function RfpDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [vendorSelectorOpen, setVendorSelectorOpen] = useState(false);

  const { data: rfp, isLoading: rfpLoading } = useQuery<Rfp>({
    queryKey: ["/api/rfps", params.id],
  });

  const { data: vendors, isLoading: vendorsLoading } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
  });

  const { data: proposals, isLoading: proposalsLoading } = useQuery<Proposal[]>({
    queryKey: ["/api/rfps", params.id, "proposals"],
  });

  const sendMutation = useMutation({
    mutationFn: async (vendorIds: string[]) => {
      await apiRequest("POST", `/api/rfps/${params.id}/send`, { vendorIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rfps", params.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setVendorSelectorOpen(false);
      toast({
        title: "RFP Sent",
        description: "The RFP has been sent to the selected vendors.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Send RFP",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sentVendors = vendors?.filter((v) => rfp?.sentVendorIds.includes(v.id)) || [];

  if (rfpLoading) {
    return (
      <div className="px-8 py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <div className="flex-1">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!rfp) {
    return (
      <div className="px-8 py-6">
        <EmptyState
          icon={FileText}
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

  return (
    <div className="px-8 py-6 space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/rfps")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold truncate" data-testid="text-rfp-title">
              {rfp.title}
            </h1>
            <StatusBadge status={rfp.status} />
          </div>
          <p className="text-muted-foreground mt-1">
            Created {formatDistanceToNow(new Date(rfp.createdAt), { addSuffix: true })}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {(rfp.status === "received" || proposals?.length) && proposals && proposals.length > 1 && (
            <Link href={`/rfp/${rfp.id}/compare`}>
              <Button variant="outline" className="gap-2" data-testid="button-compare">
                <BarChart3 className="h-4 w-4" />
                Compare Proposals
              </Button>
            </Link>
          )}
          <Button
            className="gap-2"
            onClick={() => setVendorSelectorOpen(true)}
            data-testid="button-send-to-vendors"
          >
            <Send className="h-4 w-4" />
            Send to Vendors
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details" className="gap-2" data-testid="tab-details">
            <FileText className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="vendors" className="gap-2" data-testid="tab-vendors">
            <Users className="h-4 w-4" />
            Sent Vendors ({sentVendors.length})
          </TabsTrigger>
          <TabsTrigger value="proposals" className="gap-2" data-testid="tab-proposals">
            <Inbox className="h-4 w-4" />
            Proposals ({proposals?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rfp.totalBudget && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="text-lg font-semibold">
                        {rfp.currency} {rfp.totalBudget.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {rfp.deliveryDays && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Delivery</p>
                      <p className="text-lg font-semibold">{rfp.deliveryDays} days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {rfp.paymentTerms && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment</p>
                      <p className="text-lg font-semibold">{rfp.paymentTerms}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {rfp.warranty && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Warranty</p>
                      <p className="text-lg font-semibold">{rfp.warranty}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Specifications</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rfp.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">{item.qty}</TableCell>
                        <TableCell className="text-muted-foreground">{item.specs}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {(rfp.mandatoryCriteria.length > 0 || rfp.optionalCriteria.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rfp.mandatoryCriteria.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Mandatory Criteria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {rfp.mandatoryCriteria.map((criterion, index) => (
                        <Badge key={index} variant="secondary">
                          {criterion}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              {rfp.optionalCriteria.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Optional Criteria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {rfp.optionalCriteria.map((criterion, index) => (
                        <Badge key={index} variant="outline">
                          {criterion}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {rfp.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{rfp.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="vendors">
          {vendorsLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : sentVendors.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No vendors yet"
              description="Send this RFP to vendors to start receiving proposals."
              action={{
                label: "Send to Vendors",
                onClick: () => setVendorSelectorOpen(true),
              }}
            />
          ) : (
            <div className="space-y-4">
              {sentVendors.map((vendor) => (
                <Card key={vendor.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                        {vendor.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{vendor.name}</p>
                        <p className="text-sm text-muted-foreground">{vendor.email}</p>
                      </div>
                      <Badge variant="outline">Sent</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="proposals">
          {proposalsLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !proposals || proposals.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No proposals yet"
              description="Proposals will appear here when vendors respond to your RFP."
            />
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <ProposalCard key={proposal.id} proposal={proposal} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <VendorSelector
        open={vendorSelectorOpen}
        onOpenChange={setVendorSelectorOpen}
        vendors={vendors || []}
        isLoading={vendorsLoading}
        onSend={(vendorIds) => sendMutation.mutate(vendorIds)}
        isSending={sendMutation.isPending}
      />
    </div>
  );
}

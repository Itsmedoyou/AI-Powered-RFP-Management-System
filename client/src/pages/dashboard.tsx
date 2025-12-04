import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { FileText, Users, Inbox, CheckCircle, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { RfpCard } from "@/components/rfp-card";
import { StatCardSkeleton, RfpCardSkeleton } from "@/components/loading-skeleton";
import { EmptyState } from "@/components/empty-state";
import type { DashboardStats, Rfp } from "@/lib/types";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentRfps, isLoading: rfpsLoading } = useQuery<Rfp[]>({
    queryKey: ["/api/rfps", "recent"],
  });

  return (
    <div className="px-8 py-6 space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your procurement activities
          </p>
        </div>
        <Link href="/rfp/create">
          <Button className="gap-2" data-testid="button-create-rfp">
            <Plus className="h-4 w-4" />
            Create RFP
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total RFPs"
              value={stats?.totalRfps ?? 0}
              icon={FileText}
              description="All time"
            />
            <StatCard
              title="Active RFPs"
              value={stats?.activeRfps ?? 0}
              icon={Inbox}
              description="Awaiting responses"
            />
            <StatCard
              title="Vendors"
              value={stats?.totalVendors ?? 0}
              icon={Users}
              description="Registered"
            />
            <StatCard
              title="Proposals"
              value={stats?.proposalsReceived ?? 0}
              icon={CheckCircle}
              description="Received"
            />
          </>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="text-xl">Recent RFPs</CardTitle>
          <Link href="/rfps">
            <Button variant="ghost" size="sm" className="gap-1.5" data-testid="button-view-all-rfps">
              View all
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {rfpsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <RfpCardSkeleton />
              <RfpCardSkeleton />
              <RfpCardSkeleton />
            </div>
          ) : !recentRfps || recentRfps.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No RFPs yet"
              description="Create your first RFP to start automating your procurement process."
              action={{
                label: "Create RFP",
                onClick: () => window.location.href = "/rfp/create",
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentRfps.slice(0, 6).map((rfp) => (
                <RfpCard key={rfp.id} rfp={rfp} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/rfp/create" className="block">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover-elevate cursor-pointer transition-all">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Create New RFP</p>
                  <p className="text-sm text-muted-foreground">
                    Use AI to convert your requirements into structured RFPs
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/vendors" className="block">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover-elevate cursor-pointer transition-all">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Manage Vendors</p>
                  <p className="text-sm text-muted-foreground">
                    Add, edit, or remove vendors from your database
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Describe Your Needs</p>
                  <p className="text-sm text-muted-foreground">
                    Write your requirements in plain language
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">AI Extracts RFP</p>
                  <p className="text-sm text-muted-foreground">
                    Our AI converts text into a structured RFP document
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Send to Vendors</p>
                  <p className="text-sm text-muted-foreground">
                    Email RFPs to selected vendors with one click
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  4
                </div>
                <div>
                  <p className="font-medium">Compare & Decide</p>
                  <p className="text-sm text-muted-foreground">
                    AI parses responses and recommends the best vendor
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

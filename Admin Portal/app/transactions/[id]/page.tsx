"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle, Clock, XCircle, TruckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-provider";
import { useToast } from "@/hooks/use-toast";

interface RestockRequest {
  id: string;
  states: string;
  dateOfRequest: string;
  productId: string;
  productName: string;
  vendorSupplierId: string;
  quantity: number;
  urgency: string;
  shortNote: string;
  stockCategory: string;
  description: string;
  requestedBy?: string;
  requested?: { date: string; user: string };
  underReview?: { date: string; user: string };
  approved?: { date: string; user: string };
}

interface AuthUser {
  getIdToken: () => Promise<string>;
  email?: string;
  name?: string;
  uid?: string;
}

export default function TransactionDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuth() as { user: AuthUser | null };
  const { toast } = useToast();
  const [transaction, setTransaction] = useState<RestockRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id, user]);

  const fetchData = async () => {
    if (!user || !id) return;

    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`http://localhost:4000/api/restock-requests/${id}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch restock request");
      const data = await response.json();
      setTransaction(data);
    } catch (error) {
      console.error("Error fetching restock request:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateState = async (state: string) => {
    if (!user || !transaction) return;

    const username = user.email?.split("@")[0] || user.name || user.uid || "Unknown User";

    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`http://localhost:4000/api/restock-requests/${id}/state`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ state, user: username }),
      });

      if (!response.ok) throw new Error("Failed to update state");
      await fetchData(); // Refresh data after update
      toast({
        title: "Success",
        description: `Request marked as ${state} successfully.`,
      });
    } catch (error) {
      console.error("Error updating state:", error);
      toast({
        title: "Error",
        description: "Failed to update request state.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading transaction details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!transaction) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <h2 className="text-2xl font-bold">Transaction not found</h2>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Transactions
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Status icon component
  function StatusIcon({ status }: { status: string }) {
    switch (status.toLowerCase()) {
      case "requested":
      case "under review":
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "shipped":
      case "delivered":
        return <TruckIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Request {transaction.id}</h1>
          <Badge
            variant="outline"
            className={cn(
              "ml-auto font-medium text-sm px-3 py-1",
              transaction.states.toLowerCase() === "approved" && "bg-green-100 text-green-800",
              (transaction.states.toLowerCase() === "pending" || transaction.states.toLowerCase() === "under review") &&
                "bg-yellow-100 text-yellow-800",
              transaction.states.toLowerCase() === "rejected" && "bg-red-100 text-red-800",
              transaction.states.toLowerCase() === "shipped" && "bg-blue-100 text-blue-800",
              transaction.states.toLowerCase() === "delivered" && "bg-purple-100 text-purple-800",
            )}
          >
            {transaction.states}
          </Badge>
        </div>

        {/* Transaction details */}
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Product</p>
                <p className="font-medium">{transaction.productName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                <p className="font-medium">{transaction.quantity}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Requested By</p>
                <p className="font-medium">{transaction.requestedBy || "Unknown"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="font-medium">{new Date(transaction.dateOfRequest).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vendor/Supplier</p>
                <p className="font-medium">{transaction.vendorSupplierId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Urgency</p>
                <p className="font-medium">{transaction.urgency}</p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground">Short Note</p>
              <p className="text-sm">{transaction.shortNote}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-sm">{transaction.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Request Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Request Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="mb-8 flex gap-4">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <StatusIcon status="requested" />
                  {(transaction.underReview || transaction.approved) && (
                    <div className="absolute top-10 left-1/2 h-full w-px -translate-x-1/2 bg-border" />
                  )}
                </div>
                <div className="flex flex-col">
                  <p className="font-medium">Requested</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      {transaction.requested
                        ? new Date(transaction.requested.date).toLocaleString()
                        : "Not yet requested"}
                    </p>
                    <span className="text-sm text-muted-foreground">•</span>
                    <p className="text-sm text-muted-foreground">{transaction.requested?.user || "Unknown"}</p>
                  </div>
                </div>
              </div>
              <div className="mb-8 flex gap-4">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <StatusIcon status="under review" />
                  {transaction.approved && (
                    <div className="absolute top-10 left-1/2 h-full w-px -translate-x-1/2 bg-border" />
                  )}
                </div>
                <div className="flex flex-col">
                  <p className="font-medium">Under Review</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      {transaction.underReview
                        ? new Date(transaction.underReview.date).toLocaleString()
                        : "Not yet reviewed"}
                    </p>
                    <span className="text-sm text-muted-foreground">•</span>
                    <p className="text-sm text-muted-foreground">{transaction.underReview?.user || "Unknown"}</p>
                  </div>
                  {!transaction.underReview && (
                    <Button variant="outline" size="sm" onClick={() => updateState("underReview")} className="mt-2">
                      Mark Under Review
                    </Button>
                  )}
                </div>
              </div>
              <div className="mb-8 flex gap-4">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <StatusIcon status="approved" />
                </div>
                <div className="flex flex-col">
                  <p className="font-medium">Approved</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      {transaction.approved
                        ? new Date(transaction.approved.date).toLocaleString()
                        : "Not yet approved"}
                    </p>
                    <span className="text-sm text-muted-foreground">•</span>
                    <p className="text-sm text-muted-foreground">{transaction.approved?.user || "Unknown"}</p>
                  </div>
                  {!transaction.approved && (
                    <Button variant="outline" size="sm" onClick={() => updateState("approved")} className="mt-2">
                      Mark Approved
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
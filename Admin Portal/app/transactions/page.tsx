"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-provider";

interface RestockRequest {
  id: string;
  states: string;
  dateOfRequest: string;
  productName: string;
  quantity: number;
  urgency: string;
  vendorSupplierId: string;
  requestedBy?: string;
  requested?: { date: string; user: string };
  underReview?: { date: string; user: string };
  approved?: { date: string; user: string };
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [restockRequests, setRestockRequests] = useState<RestockRequest[]>([]);
  const [newRequest, setNewRequest] = useState({
    productName: "",
    quantity: "",
    urgency: "Normal",
    notes: "",
    vendorSupplierId: "",
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const idToken = await user.getIdToken();
      const response = await fetch("http://localhost:4000/api/restock-requests", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch restock requests");
      const data = await response.json();
      setRestockRequests(data);
    } catch (error) {
      console.error("Error fetching restock requests:", error);
      toast({
        title: "Error",
        description: "Failed to load restock requests.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitRequest = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit requests.",
        variant: "destructive",
      });
      return;
    }

    if (!newRequest.productName || !newRequest.quantity || !newRequest.vendorSupplierId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const response = await fetch("http://localhost:4000/api/restock-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          productName: newRequest.productName,
          quantity: parseInt(newRequest.quantity),
          urgency: newRequest.urgency,
          shortNote: newRequest.notes,
          vendorSupplierId: newRequest.vendorSupplierId,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit request");
      toast({
        title: "Request Submitted",
        description: `Your request for ${newRequest.productName} has been submitted successfully.`,
      });

      setNewRequest({
        productName: "",
        quantity: "",
        urgency: "Normal",
        notes: "",
        vendorSupplierId: "",
      });
      setIsDialogOpen(false);
      await fetchData(); // Refresh data after submission
    } catch (error) {
      console.error("Error submitting request:", error);
      toast({
        title: "Error",
        description: "Failed to submit restock request.",
        variant: "destructive",
      });
    }
  };

  const filteredTransactions = restockRequests.filter((request) => {
    const matchesSearch =
      request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.requestedBy || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || request.states.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Status badge component
  function StatusBadge({ status }: { status: string }) {
    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case "approved":
          return "bg-green-100 text-green-800 hover:bg-green-100";
        case "pending":
        case "requested":
        case "under review":
          return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
        case "rejected":
          return "bg-red-100 text-red-800 hover:bg-red-100";
        case "shipped":
          return "bg-blue-100 text-blue-800 hover:bg-blue-100";
        case "delivered":
          return "bg-purple-100 text-purple-800 hover:bg-purple-100";
        default:
          return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      }
    };

    return (
      <Badge variant="outline" className={cn("font-medium", getStatusColor(status))}>
        {status}
      </Badge>
    );
  }

  // Severity badge component
  function SeverityBadge({ severity }: { severity: string }) {
    const getSeverityColor = (severity: string) => {
      switch (severity.toLowerCase()) {
        case "urgent":
          return "bg-red-100 text-red-800 hover:bg-red-100";
        case "high":
          return "bg-orange-100 text-orange-800 hover:bg-orange-100";
        case "normal":
          return "bg-blue-100 text-blue-800 hover:bg-blue-100";
        case "low":
          return "bg-green-100 text-green-800 hover:bg-green-100";
        default:
          return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      }
    };

    return (
      <Badge variant="outline" className={cn("font-medium", getSeverityColor(severity))}>
        {severity}
      </Badge>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Restock Requests</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Restock Request</DialogTitle>
                <DialogDescription>Fill in the details to submit a new restock request.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="productName" className="text-right">
                    Product*
                  </Label>
                  <Input
                    id="productName"
                    value={newRequest.productName}
                    onChange={(e) => setNewRequest({ ...newRequest, productName: e.target.value })}
                    className="col-span-3"
                    placeholder="Enter product name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">
                    Quantity*
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newRequest.quantity}
                    onChange={(e) => setNewRequest({ ...newRequest, quantity: e.target.value })}
                    className="col-span-3"
                    placeholder="Enter quantity"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="vendorSupplierId" className="text-right">
                    Vendor/Supplier*
                  </Label>
                  <Select
                    value={newRequest.vendorSupplierId}
                    onValueChange={(value) => setNewRequest({ ...newRequest, vendorSupplierId: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select vendor/supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUP-001">Office Supplies Co.</SelectItem>
                      <SelectItem value="SUP-002">Lighting Solutions Inc.</SelectItem>
                      <SelectItem value="SUP-003">Tech Supplies Ltd.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="urgency" className="text-right">
                    Urgency
                  </Label>
                  <Select
                    value={newRequest.urgency}
                    onValueChange={(value) => setNewRequest({ ...newRequest, urgency: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={newRequest.notes}
                    onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })}
                    className="col-span-3"
                    placeholder="Add any additional notes"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitRequest}>Submit Request</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search requests..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="under review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transactions table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      <Link href={`/transactions/${request.id}`} className="text-primary hover:underline">
                        {request.id}
                      </Link>
                    </TableCell>
                    <TableCell>{request.productName}</TableCell>
                    <TableCell>{request.quantity}</TableCell>
                    <TableCell>
                      <StatusBadge status={request.states} />
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={request.urgency} />
                    </TableCell>
                    <TableCell>{request.requestedBy || "Unknown"}</TableCell>
                    <TableCell>{new Date(request.dateOfRequest).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
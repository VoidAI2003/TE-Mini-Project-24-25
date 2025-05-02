"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, BarChart } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-provider";

// Interface for sales report data
interface SalesReport {
  id: string;
  retailerId: string;
  retailerName: string;
  product: string;
  quantity: number;
  amount: number;
  dateTime: string;
}

interface NewReport {
  retailerId: string;
  product: string;
  quantity: string;
  amount: string;
}

export default function SalesReportsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [timePeriod, setTimePeriod] = useState("week");
  const [salesReports, setSalesReports] = useState<SalesReport[]>([]);
  const [isNewReportDialogOpen, setIsNewReportDialogOpen] = useState(false);
  const [isCumulativeReportDialogOpen, setIsCumulativeReportDialogOpen] = useState(false);
  const [newReport, setNewReport] = useState<NewReport>({
    retailerId: "",
    product: "",
    quantity: "",
    amount: "",
  });

  // Fetch sales reports from backend
  const fetchData = async () => {
    if (!user) return;

    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`http://localhost:4000/api/sales-reports?period=${timePeriod}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch sales reports");
      const data = await response.json();
      setSalesReports(data);
    } catch (error) {
      console.error("Error fetching sales reports:", error);
      toast({
        title: "Error",
        description: "Failed to load sales reports.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, toast, timePeriod]);

  // Filter reports based on search query
  const filteredReports = salesReports.filter((report) =>
    report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.retailerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.retailerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.product.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate cumulative report based on time period
  const generateCumulativeReport = () => {
    const totalAmount = salesReports.reduce((total, report) => total + report.amount, 0);
    const productSummary = salesReports.reduce((acc, report) => {
      if (!acc[report.product]) {
        acc[report.product] = { quantity: 0, amount: 0 };
      }
      acc[report.product].quantity += report.quantity;
      acc[report.product].amount += report.amount;
      return acc;
    }, {} as Record<string, { quantity: number; amount: number }>);

    return { totalAmount, productSummary };
  };

  const handleSubmitReport = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit reports.",
        variant: "destructive",
      });
      return;
    }

    if (!newReport.retailerId || !newReport.product || !newReport.quantity || !newReport.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const response = await fetch("http://localhost:4000/api/sales-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          retailerId: newReport.retailerId,
          itemId: `ITM-${String(Math.floor(Math.random() * 7) + 1).padStart(3, "0")}`, // Random itemId for demo
          noOfUnitsSold: parseInt(newReport.quantity),
          sales: parseFloat(newReport.amount),
          date: new Date().toISOString(),
          categoryOfItem: newReport.product.split(" ")[0], // Simplified category
          season: getSeason(new Date()),
        }),
      });

      if (!response.ok) throw new Error("Failed to submit report");
      toast({
        title: "Report Submitted",
        description: `Sales report for ${newReport.product} has been submitted successfully.`,
      });

      setNewReport({
        retailerId: "",
        product: "",
        quantity: "",
        amount: "",
      });
      setIsNewReportDialogOpen(false);
      await fetchData(); // Refresh data after successful submission
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description: "Failed to submit sales report.",
        variant: "destructive",
      });
    }
  };

  // Helper function to determine season
  const getSeason = (date: Date) => {
    const month = date.getMonth() + 1;
    if (month >= 3 && month <= 5) return "Spring";
    if (month >= 6 && month <= 8) return "Summer";
    if (month >= 9 && month <= 11) return "Fall";
    return "Winter";
  };

  const cumulativeReport = generateCumulativeReport();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Sales Reports</h1>
          <div className="flex gap-2">
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-32">
                <SelectValue>{timePeriod === "week" ? "This Week" : timePeriod}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isCumulativeReportDialogOpen} onOpenChange={setIsCumulativeReportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <BarChart className="mr-2 h-4 w-4" />
                  Cumulative Report
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Cumulative Sales Report</DialogTitle>
                  <DialogDescription>
                    Sales summary for {timePeriod === "day" ? "Today" : timePeriod === "week" ? "This Week" : timePeriod === "month" ? "This Month" : timePeriod === "quarter" ? "This Quarter" : "This Year"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Total Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">${cumulativeReport.totalAmount.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity Sold</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(cumulativeReport.productSummary).map(([product, data]) => (
                          <TableRow key={product}>
                            <TableCell className="font-medium">{product}</TableCell>
                            <TableCell>{data.quantity}</TableCell>
                            <TableCell className="text-right">${data.amount.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isNewReportDialogOpen} onOpenChange={setIsNewReportDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Report
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Sales Report</DialogTitle>
                  <DialogDescription>Fill in the details to submit a new sales report.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="retailerId" className="text-right">Retailer*</Label>
                    <Select
                      value={newReport.retailerId}
                      onValueChange={(value) => setNewReport({ ...newReport, retailerId: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select retailer" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          { id: "RT-001", name: "City Electronics" },
                          { id: "RT-002", name: "Office Depot" },
                          { id: "RT-003", name: "Tech World" },
                          { id: "RT-004", name: "Furniture Plus" },
                        ].map((retailer) => (
                          <SelectItem key={retailer.id} value={retailer.id}>
                            {retailer.name} ({retailer.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="product" className="text-right">Product*</Label>
                    <Select
                      value={newReport.product}
                      onValueChange={(value) => setNewReport({ ...newReport, product: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          { id: "ITM-001", name: "Office Chairs" },
                          { id: "ITM-002", name: "Desk Lamps" },
                          { id: "ITM-003", name: "Monitors" },
                          { id: "ITM-004", name: "Keyboards" },
                          { id: "ITM-005", name: "Desk Organizers" },
                          { id: "ITM-006", name: "Whiteboards" },
                          { id: "ITM-007", name: "Filing Cabinets" },
                        ].map((product) => (
                          <SelectItem key={product.id} value={product.name}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity" className="text-right">Quantity*</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newReport.quantity}
                      onChange={(e) => setNewReport({ ...newReport, quantity: e.target.value })}
                      className="col-span-3"
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">Amount ($)*</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={newReport.amount}
                      onChange={(e) => setNewReport({ ...newReport, amount: e.target.value })}
                      className="col-span-3"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewReportDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmitReport}>Submit Report</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64 mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search reports..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Reports table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report ID</TableHead>
                <TableHead>Retailer ID</TableHead>
                <TableHead>Retailer Name</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date & Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.id}</TableCell>
                    <TableCell>{report.retailerId}</TableCell>
                    <TableCell>{report.retailerName}</TableCell>
                    <TableCell>{report.product}</TableCell>
                    <TableCell>{report.quantity}</TableCell>
                    <TableCell>${report.amount.toFixed(2)}</TableCell>
                    <TableCell>{format(new Date(report.dateTime), "MMM dd, yyyy HH:mm")}</TableCell>
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
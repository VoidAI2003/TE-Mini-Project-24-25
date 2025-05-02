"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Calendar,
  Download,
  ChevronRight,
  BarChart3,
} from "lucide-react";

export default function OrderHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "all",
  });

  // Mock data for demonstration
  const orders = [
    {
      id: "ORD001",
      date: "2024-03-20",
      supplier: "Tech Solutions Inc.",
      total: 2500.0,
      status: "Processing",
      items: 5,
      category: "Electronics",
      paymentStatus: "Paid",
    },
    {
      id: "ORD002",
      date: "2024-03-19",
      supplier: "Global Supplies Co.",
      total: 1800.0,
      status: "Shipped",
      items: 3,
      category: "Office Supplies",
      paymentStatus: "Pending",
    },
    {
      id: "ORD003",
      date: "2024-03-18",
      supplier: "Office Depot",
      total: 950.0,
      status: "Delivered",
      items: 2,
      category: "Furniture",
      paymentStatus: "Paid",
    },
    {
      id: "ORD004",
      date: "2024-03-17",
      supplier: "Tech Solutions Inc.",
      total: 3200.0,
      status: "Processing",
      items: 8,
      category: "Electronics",
      paymentStatus: "Paid",
    },
    {
      id: "ORD005",
      date: "2024-03-16",
      supplier: "Global Supplies Co.",
      total: 1500.0,
      status: "Shipped",
      items: 4,
      category: "Office Supplies",
      paymentStatus: "Pending",
    },
  ];

  const stats = {
    totalOrders: orders.length,
    totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
    averageOrderValue:
      orders.reduce((sum, order) => sum + order.total, 0) / orders.length,
    processingOrders: orders.filter((order) => order.status === "Processing")
      .length,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Processing":
        return "text-yellow-500 bg-yellow-50";
      case "Shipped":
        return "text-blue-500 bg-blue-50";
      case "Delivered":
        return "text-green-500 bg-green-50";
      case "Cancelled":
        return "text-red-500 bg-red-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Processing":
        return <Package className="h-4 w-4" />;
      case "Shipped":
        return <Truck className="h-4 w-4" />;
      case "Delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "Cancelled":
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Order History</h1>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Orders
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">
                  ₹{stats.totalSpent.toFixed(2)}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Average Order Value
                </p>
                <p className="text-2xl font-bold">
                  ${stats.averageOrderValue.toFixed(2)}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Package className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Processing Orders
                </p>
                <p className="text-2xl font-bold">{stats.processingOrders}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders by ID, supplier, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Date Range
              </Button>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Order #{order.id}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{order.date}</p>
                </div>
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusIcon(order.status)}
                  <span className="font-medium">{order.status}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Supplier</p>
                  <p className="font-medium">{order.supplier}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{order.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Items</p>
                  <p className="font-medium">{order.items}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-medium">₹{order.total.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Payment Status
                  </p>
                  <p
                    className={`font-medium ${
                      order.paymentStatus === "Paid"
                        ? "text-green-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {order.paymentStatus}
                  </p>
                </div>
                <Button variant="outline">View Details</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

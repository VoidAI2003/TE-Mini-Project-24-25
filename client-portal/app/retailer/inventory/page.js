"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Search, Filter } from "lucide-react";

export default function InventoryManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    stockLevel: "all",
  });

  // Mock data for demonstration
  const inventory = [
    {
      id: 1,
      name: "Product A",
      category: "Electronics",
      currentStock: 15,
      minimumStock: 20,
      maximumStock: 100,
      supplier: "Tech Solutions Inc.",
      lastRestocked: "2024-03-20",
      status: "low",
    },
    {
      id: 2,
      name: "Product B",
      category: "Office Supplies",
      currentStock: 45,
      minimumStock: 10,
      maximumStock: 50,
      supplier: "Global Supplies Co.",
      lastRestocked: "2024-03-22",
      status: "good",
    },
    // Add more mock inventory items as needed
  ];

  const alerts = [
    {
      type: "warning",
      title: "Low Stock Alert",
      description: "5 items are running low on stock and need to be reordered",
    },
    {
      type: "info",
      title: "Stock Level Insights",
      description: "3 items have exceeded their maximum stock levels",
    },
  ];

  const getStockStatus = (item) => {
    const percentage = (item.currentStock / item.maximumStock) * 100;
    if (item.currentStock <= item.minimumStock) return "low";
    if (percentage >= 90) return "high";
    return "good";
  };

  const getStockColor = (status) => {
    switch (status) {
      case "low":
        return "bg-red-500";
      case "high":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>

      {/* Alerts Section */}
      <div className="space-y-4 mb-6">
        {alerts.map((alert, index) => (
          <Alert key={index} variant={alert.type}>
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.description}</AlertDescription>
          </Alert>
        ))}
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory.map((item) => {
          const status = getStockStatus(item);
          const stockPercentage = (item.currentStock / item.maximumStock) * 100;

          return (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{item.name}</CardTitle>
                  <div
                    className={`h-2 w-2 rounded-full ${getStockColor(status)}`}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{item.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Current Stock
                    </p>
                    <p className="font-medium">{item.currentStock} units</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stock Level</p>
                    <Progress value={stockPercentage} className="h-2" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Supplier</p>
                    <p className="font-medium">{item.supplier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Last Restocked
                    </p>
                    <p className="font-medium">{item.lastRestocked}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      View Details
                    </Button>
                    <Button className="flex-1">Reorder</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

export default function BrowseSuppliers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    rating: "all",
    location: "all",
  });

  // Mock data for demonstration
  const suppliers = [
    {
      id: 1,
      name: "Tech Solutions Inc.",
      category: "Electronics",
      rating: 4.8,
      location: "New York",
      description: "Leading supplier of electronic components and gadgets.",
      products: 1200,
      responseTime: "24h",
    },
    {
      id: 2,
      name: "Global Supplies Co.",
      category: "Office Supplies",
      rating: 4.5,
      location: "Chicago",
      description: "Comprehensive office supplies and equipment.",
      products: 800,
      responseTime: "48h",
    },
    // Add more mock suppliers as needed
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Browse Suppliers</h1>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
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

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier) => (
          <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">{supplier.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {supplier.description}
                </p>
                <div className="flex justify-between text-sm">
                  <span>Category: {supplier.category}</span>
                  <span>Rating: {supplier.rating}/5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Location: {supplier.location}</span>
                  <span>Products: {supplier.products}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Response Time: {supplier.responseTime}
                </div>
                <Button className="w-full mt-4">View Details</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

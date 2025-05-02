"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, AlertTriangle } from "lucide-react";
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
import { useAuth } from "@/lib/auth-provider";

// Define interfaces for the data
interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
  supplier: string;
  quantity: number;
  reorderPoint: number;
  category: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

export default function InventoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newItem, setNewItem] = useState({
    name: "",
    supplier: "",
    quantity: "",
    reorderPoint: "",
    category: "",
  });

  // Fetch data from backend on mount
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const idToken = await user.getIdToken();

        // Fetch inventory items
        const itemsResponse = await fetch("http://localhost:4000/api/inventory-items", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!itemsResponse.ok) throw new Error("Failed to fetch inventory items");
        const itemsData = await itemsResponse.json();
        setInventoryItems(itemsData);

        // Fetch suppliers from user_details (typeOfUser: "suppliers")
        const suppliersResponse = await fetch("http://localhost:4000/api/suppliers", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!suppliersResponse.ok) throw new Error("Failed to fetch suppliers");
        const suppliersData = await suppliersResponse.json();
        setSuppliers(suppliersData);

        // Fetch categories
        const categoriesResponse = await fetch("http://localhost:4000/api/categories", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!categoriesResponse.ok) throw new Error("Failed to fetch categories");
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load inventory data.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [user, toast]);

  // Filter inventory based on search query and category filter
  const filteredItems = inventoryItems.filter((item: InventoryItem) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add items.",
        variant: "destructive",
      });
      return;
    }

    if (!newItem.name || !newItem.supplier || !newItem.quantity || !newItem.reorderPoint || !newItem.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const response = await fetch("http://localhost:4000/api/inventory-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) throw new Error("Failed to add item");

      const addedItem: InventoryItem = await response.json();
      setInventoryItems((prev: InventoryItem[]) => [...prev, addedItem]);
      toast({
        title: "Item Added",
        description: `${newItem.name} has been added to inventory successfully.`,
      });

      setNewItem({ name: "", supplier: "", quantity: "", reorderPoint: "", category: "" });
      setIsAddItemDialogOpen(false);
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Error",
        description: "Failed to add item to inventory.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Inventory</h1>
          <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
                <DialogDescription>Fill in the details to add a new item to inventory.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Item Name*</Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="col-span-3"
                    placeholder="Enter item name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="supplier" className="text-right">Supplier*</Label>
                  <Select
                    value={newItem.supplier}
                    onValueChange={(value) => setNewItem({ ...newItem, supplier: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier: Supplier) => (
                        <SelectItem key={supplier.id} value={supplier.name}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Category*</Label>
                  <Select
                    value={newItem.category}
                    onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category: Category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
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
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    className="col-span-3"
                    placeholder="Enter quantity"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reorderPoint" className="text-right">Reorder Point*</Label>
                  <Input
                    id="reorderPoint"
                    type="number"
                    value={newItem.reorderPoint}
                    onChange={(e) => setNewItem({ ...newItem, reorderPoint: e.target.value })}
                    className="col-span-3"
                    placeholder="Enter reorder point"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddItem}>Add Item</Button>
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
              placeholder="Search inventory..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category: Category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Inventory table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item: InventoryItem) => (<TableRow key={item.itemId}><TableCell className="font-medium">{item.itemId}</TableCell><TableCell>{item.name}</TableCell><TableCell>{item.supplier}</TableCell><TableCell>{item.category}</TableCell><TableCell>{item.quantity}</TableCell><TableCell>{item.quantity <= item.reorderPoint ? (<div className="flex items-center"><AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" /><span className="text-yellow-600">Low Stock</span></div>) : (<Badge variant="outline" className="bg-green-100 text-green-800">In Stock</Badge>)}</TableCell></TableRow>))
              ) : (<TableRow><TableCell colSpan={6} className="h-24 text-center">No results found.</TableCell></TableRow>)}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
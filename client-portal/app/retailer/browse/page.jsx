"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Search,
  Filter,
  ChevronDown,
  ShoppingCart,
  Building,
  DollarSign,
  Truck,
  Grid,
  List,
  Clock,
  AlertCircle,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

export default function BrowseItemsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);

        // Create a base query
        let itemsQuery = collection(db, "items");

        // Apply filters if selected
        if (selectedCategory !== "all") {
          itemsQuery = query(
            itemsQuery,
            where("category", "==", selectedCategory)
          );
        }
        if (selectedSupplier !== "all") {
          itemsQuery = query(
            itemsQuery,
            where("supplierId", "==", selectedSupplier)
          );
        }

        // Set up real-time listener
        const unsubscribe = onSnapshot(
          itemsQuery,
          (snapshot) => {
            const itemsData = [];
            const uniqueCategories = new Set();
            const uniqueSuppliers = new Set();

            snapshot.forEach((doc) => {
              const item = {
                id: doc.id,
                ...doc.data(),
                // Ensure all required fields have default values
                name: doc.data().name || "Unnamed Item",
                description:
                  doc.data().description || "No description available",
                price: doc.data().price || 0,
                stock: doc.data().stock || 0,
                category: doc.data().category || "Uncategorized",
                supplier: doc.data().supplier || "Unknown Supplier",
                image: doc.data().image || null,
                deliveryTime: doc.data().deliveryTime || "Standard",
                status: doc.data().status || "In Stock",
                createdAt: doc.data().createdAt || new Date().toISOString(),
                updatedAt: doc.data().updatedAt || new Date().toISOString(),
              };
              itemsData.push(item);
              uniqueCategories.add(item.category);
              uniqueSuppliers.add(item.supplier);
            });

            setItems(itemsData);
            setCategories(Array.from(uniqueCategories).sort());
            setSuppliers(Array.from(uniqueSuppliers).sort());
          },
          (error) => {
            console.error("Error in real-time listener:", error);
            setError(
              "Failed to load items in real-time. Please refresh the page."
            );
          }
        );

        return () => unsubscribe();
      } catch (err) {
        console.error("Error fetching items:", err);
        setError("Failed to load items. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [selectedCategory, selectedSupplier]);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleOrder = async (item) => {
    try {
      // Check if item is in stock
      if (item.stock <= 0) {
        setError("This item is currently out of stock");
        return;
      }

      // Check if item status is not "In Stock"
      if (item.status !== "In Stock") {
        setError(`This item is currently ${item.status.toLowerCase()}`);
        return;
      }

      // Navigate to order page with item details
      router.push(`/retailer/orders/new?item=${item.id}`);
    } catch (err) {
      console.error("Error handling order:", err);
      setError("Failed to process order. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center bg-white rounded-lg p-8 border border-gray-200">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              No items found matching your criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedSupplier("all");
              }}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Simple Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Browse Items</h1>
          <div className="flex border border-gray-200 rounded-lg bg-white">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${
                viewMode === "grid" ? "bg-blue-500 text-white" : "text-gray-600"
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${
                viewMode === "list" ? "bg-blue-500 text-white" : "text-gray-600"
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Simple Search and Filters */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg"
          >
            <option value="all">All Suppliers</option>
            {suppliers.map((supplier) => (
              <option key={supplier} value={supplier}>
                {supplier}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Items Grid/List */}
      <div className="max-w-7xl mx-auto">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col h-full"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Building className="w-4 h-4" />
                    <span>{item.supplier}</span>
                  </div>
                  <h3 className="font-medium text-lg mb-2 line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 h-16 overflow-y-auto">
                    {item.description}
                  </p>
                  <div className="flex gap-3 mb-4">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      {item.stock}
                    </span>
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {item.deliveryTime}
                    </span>
                  </div>
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-xl font-semibold">
                      ₹{item.price.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleOrder(item)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 divide-y">
            {filteredItems.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Building className="w-4 h-4" />
                      <span>{item.supplier}</span>
                    </div>
                    <h3 className="font-medium mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 h-16 overflow-y-auto">
                      {item.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold mb-2">
                      ₹{item.price.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleOrder(item)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

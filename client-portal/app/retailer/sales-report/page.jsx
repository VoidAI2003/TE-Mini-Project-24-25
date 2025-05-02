"use client";
import { useState, useEffect } from "react";
import {
  Download,
  Calendar,
  Search,
  Filter,
  ChevronDown,
  Plus,
  X,
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
} from "firebase/firestore";

export default function SalesReport() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    itemId: "",
    categoryOfItem: "",
    date: new Date().toISOString().split("T")[0],
    noOfUnitsSold: "",
    reportId: "",
    retailerId: "",
    sales: "",
    season: "",
  });
  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Predefined seasons
  const seasons = ["Spring", "Summer", "Fall", "Winter"];

  useEffect(() => {
    setMounted(true);
    fetchSalesData();
    const retailerId =
      localStorage.getItem("retailerId") ||
      sessionStorage.getItem("retailerId");
    if (retailerId) {
      setFormData((prev) => ({ ...prev, retailerId }));
    }
  }, []);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const salesRef = collection(db, "sales_report");
      let q = query(salesRef, orderBy("date", "desc"));

      // Apply date range filter if specified
      if (dateRange.from && dateRange.to) {
        q = query(
          q,
          where("date", ">=", dateRange.from),
          where("date", "<=", dateRange.to)
        );
      }

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSalesData(data);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      toast.error("Failed to load sales data");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });

    const sortedData = [...salesData].sort((a, b) => {
      if (a[key] < b[key]) return direction === "ascending" ? -1 : 1;
      if (a[key] > b[key]) return direction === "ascending" ? 1 : -1;
      return 0;
    });
    setSalesData(sortedData);
  };

  const filteredData = salesData.filter(
    (item) =>
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.itemId.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = () => {
    // Convert data to CSV
    const headers = [
      "Item ID",
      "Category",
      "Units Sold",
      "Sales",
      "Date",
      "Season",
    ];
    const csvData = [
      headers.join(","),
      ...filteredData.map((item) =>
        [
          item.itemId,
          item.categoryOfItem,
          item.noOfUnitsSold,
          item.sales,
          item.date,
          item.season,
        ].join(",")
      ),
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "sales-report.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.itemId ||
      !formData.categoryOfItem ||
      !formData.date ||
      !formData.noOfUnitsSold ||
      !formData.sales ||
      !formData.season
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (
      isNaN(formData.noOfUnitsSold) ||
      parseInt(formData.noOfUnitsSold) <= 0
    ) {
      toast.error("Please enter a valid number of units");
      return;
    }

    if (isNaN(formData.sales) || parseFloat(formData.sales) <= 0) {
      toast.error("Please enter a valid sales amount");
      return;
    }

    try {
      const salesRef = collection(db, "sales_report");

      // Get all existing sales reports to determine the next report ID
      const reportsSnapshot = await getDocs(salesRef);
      const reportCount = reportsSnapshot.size + 1;
      const reportId = `RE-${reportCount.toString().padStart(3, "0")}`;

      const newSale = {
        ...formData,
        reportId,
        noOfUnitsSold: parseInt(formData.noOfUnitsSold),
        sales: parseFloat(formData.sales),
        createdAt: new Date().toISOString(),
      };

      await addDoc(salesRef, newSale);
      setIsModalOpen(false);
      setFormData({
        itemId: "",
        categoryOfItem: "",
        date: new Date().toISOString().split("T")[0],
        noOfUnitsSold: "",
        reportId: "",
        retailerId: formData.retailerId,
        sales: "",
        season: "",
      });
      toast.success("Sale added successfully!");
      fetchSalesData();
    } catch (error) {
      console.error("Error adding sale:", error);
      toast.error("Failed to add sale");
    }
  };

  const formatDate = (dateString) => {
    if (!mounted) return dateString;
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Sales Report</h1>
          <p className="text-gray-600 mt-2 text-lg">
            Track and analyze your sales performance
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Sale
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm mb-8 border border-gray-100">
        <div className="p-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID or Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Calendar className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) =>
                  setDateRange({ ...dateRange, from: e.target.value })
                }
                className="pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="relative">
              <Calendar className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) =>
                  setDateRange({ ...dateRange, to: e.target.value })
                }
                className="pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Report
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add New Sale</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item ID
                </label>
                <input
                  type="text"
                  value={formData.itemId}
                  onChange={(e) =>
                    setFormData({ ...formData, itemId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.categoryOfItem}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryOfItem: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Units Sold
                </label>
                <input
                  type="number"
                  value={formData.noOfUnitsSold}
                  onChange={(e) =>
                    setFormData({ ...formData, noOfUnitsSold: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sales Amount
                </label>
                <input
                  type="number"
                  value={formData.sales}
                  onChange={(e) =>
                    setFormData({ ...formData, sales: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Season
                </label>
                <select
                  value={formData.season}
                  onChange={(e) =>
                    setFormData({ ...formData, season: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a season</option>
                  {seasons.map((season) => (
                    <option key={season} value={season}>
                      {season}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors mt-6"
              >
                Add Sale
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Units Sold
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Season
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600">
                      {item.reportId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.itemId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.categoryOfItem}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.noOfUnitsSold}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.sales.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {formatDate(item.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{item.season}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

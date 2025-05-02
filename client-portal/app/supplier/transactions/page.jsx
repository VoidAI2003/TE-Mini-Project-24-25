"use client";
import { useState, useEffect } from "react";
import {
  Download,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function TransactionsHistory() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [transactionsData, setTransactionsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchTransactions();
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      console.log("Fetching transactions...");
      const requestsRef = collection(db, "restock_requests");
      console.log("Querying restock_requests collection");

      // First, let's check all documents in the collection
      const allDocs = await getDocs(requestsRef);
      console.log("Total documents in collection:", allDocs.size);
      allDocs.forEach((doc) => {
        const data = doc.data();
        console.log(`Document ${doc.id}:`, {
          status: data.states,
          date: data.dateOfRequest,
          supplier: data.supplierId,
          retailer: data.retailerId,
          product: data.productName
        });
      });

      // Now let's apply our query
      const q = query(
        requestsRef,
        where("states", "in", ["Processing", "Shipped", "Confirmed"])
      );
      console.log("Applying query with statuses:", ["Processing", "Shipped", "Confirmed"]);

      const querySnapshot = await getDocs(q);
      console.log("Query snapshot size:", querySnapshot.size);

      if (querySnapshot.empty) {
        console.log("No documents matched the query");
      } else {
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log("Matched document:", {
            id: doc.id,
            status: data.states,
            date: data.dateOfRequest
          });
        });
      }

      const transactions = await Promise.all(
        querySnapshot.docs.map(async (doc, index) => {
          const data = doc.data();
          console.log("Processing transaction:", {
            id: doc.id,
            status: data.states,
            date: data.dateOfRequest
          });

          // Generate sequential transaction ID
          const transactionId = `TRX-${String(index + 1).padStart(3, '0')}`;

          // Get confirmed date from orders collection or rejection date from requests
          let confirmedDate = "Not confirmed yet";
          let status = data.states || "Pending";

          if (status === "Rejected") {
            confirmedDate = data.updatedAt
              ? new Date(data.updatedAt).toISOString().split("T")[0]
              : "Rejected";
          } else {
            // Check status history for acceptance date
            if (data.statusHistory && Array.isArray(data.statusHistory)) {
              const acceptanceEntry = data.statusHistory.find(
                entry => entry.states === "Processing"
              );
              if (acceptanceEntry && acceptanceEntry.timestamp) {
                confirmedDate = new Date(acceptanceEntry.timestamp).toISOString().split("T")[0];
              }
            }

            // Check orders collection for confirmation
            const ordersRef = collection(db, "orders");
            const orderQuery = query(
              ordersRef,
              where("requestId", "==", doc.id)
            );
            const orderSnapshot = await getDocs(orderQuery);

            if (!orderSnapshot.empty) {
              const orderData = orderSnapshot.docs[0].data();
              console.log("Found order for request", doc.id, ":", {
                createdAt: orderData.createdAt,
                status: orderData.status
              });
              if (orderData.createdAt) {
                confirmedDate = orderData.createdAt.split("T")[0];
                status = "Confirmed";
              }
            }
          }

          return {
            id: doc.id,
            transactionId: transactionId,
            transactionDate: data.dateOfRequest ? new Date(data.dateOfRequest).toISOString().split("T")[0] : "No date",
            confirmedDate: confirmedDate,
            status: status,
            senderId: data.supplierId || "Unknown Supplier",
            receiverId: data.retailerId || "Unknown Retailer",
            item: data.productName || "Unknown Item",
            category: data.category || "Uncategorized",
            quantity: data.quantity || 0,
            total: data.price * data.quantity || 0,
            urgency: data.urgency || "Normal",
          };
        })
      );

      // Filter out null values (pending orders)
      const filteredTransactions = transactions.filter(
        (transaction) => transaction !== null
      );
      console.log("Processed transactions:", filteredTransactions);
      setTransactionsData(filteredTransactions);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });

    const sortedData = [...transactionsData].sort((a, b) => {
      if (a[key] < b[key]) return direction === "ascending" ? -1 : 1;
      if (a[key] > b[key]) return direction === "ascending" ? 1 : -1;
      return 0;
    });
    setTransactionsData(sortedData);
  };

  const filteredData = transactionsData.filter((item) => {
    // Text search filter
    const textMatch =
      item.transactionId.toLowerCase().includes(search.toLowerCase()) ||
      item.item.toLowerCase().includes(search.toLowerCase()) ||
      item.receiverId.toLowerCase().includes(search.toLowerCase());

    // Date range filter
    let dateMatch = true;
    if (dateRange.from || dateRange.to) {
      const itemDate = new Date(item.transactionDate);

      if (dateRange.from) {
        const fromDate = new Date(dateRange.from);
        dateMatch = itemDate >= fromDate;
      }

      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setDate(toDate.getDate() + 1); // Include the end date
        dateMatch = dateMatch && itemDate < toDate;
      }
    }

    return textMatch && dateMatch;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, dateRange]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-50";
      case "Processing":
        return "bg-blue-50";
      case "Shipped":
        return "bg-green-50";
      case "Rejected":
        return "bg-red-50";
      case "Accepted":
        return "bg-purple-50";
      default:
        return "bg-gray-50";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "Processing":
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case "Shipped":
        return <Truck className="w-5 h-5 text-green-500" />;
      case "Rejected":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "Accepted":
        return <CheckCircle className="w-5 h-5 text-purple-500" />;
      default:
        return null;
    }
  };

  const handleDownload = () => {
    const headers = [
      "Transaction ID",
      "Sender ID",
      "Receiver ID",
      "Item",
      "Category",
      "Quantity",
      "Request Date",
      "Status Date",
      "Status",
    ];
    const csvData = [
      headers.join(","),
      ...filteredData.map((item) =>
        [
          item.transactionId,
          item.senderId,
          item.receiverId,
          item.item,
          item.category,
          item.quantity,
          item.transactionDate,
          item.confirmedDate,
          item.status,
        ].join(",")
      ),
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "transactions-history.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatDate = (dateString) => {
    if (
      !mounted ||
      !dateString ||
      dateString === "Not confirmed yet" ||
      dateString === "Not rejected"
    )
      return dateString;
    if (dateString.includes("T")) {
      dateString = dateString.split("T")[0];
    }
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!mounted || loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Transactions History</h1>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sender ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receiver ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accepted Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.transactionId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.senderId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.receiverId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.item}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.quantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.transactionDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.confirmedDate}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading transactions...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && currentItems.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No transactions found</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Transactions History</h1>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sender ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Receiver ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Request Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Accepted Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {item.transactionId}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.senderId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.receiverId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.item}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.quantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.transactionDate}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.confirmedDate}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && currentItems.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No transactions found</p>
        </div>
      )}
    </div>
  );
}

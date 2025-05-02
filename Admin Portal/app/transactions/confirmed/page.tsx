"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface Transaction {
  orderId: string;
  transactionId?: string;
  senderId: string;
  receiverId: string;
  itemId: string;
  itemName: string;
  quantity: string;
  category: string;
  transactionDate?: string;
  confirmedByAllDate?: string;
  inTransitDate?: string;
  deliveredDate?: string;
  status: string;
}

function StatusBadge({ status }: { status: string }) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "accepted by all":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100"
      case "in transit":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "delivered":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <Badge variant="outline" className={cn("font-medium", getStatusColor(status))}>
      {status}
    </Badge>
  )
}

export default function ConfirmedTransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTx, setNewTx] = useState({
    itemName: "",
    quantity: "",
    category: "",
    itemId: "",
    senderId: "",
    receiverId: "",
    status: "Confirmed"
  })
  const { toast } = useToast && useToast() || { toast: () => {} }

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem("idToken")
        if (!token) {
          router.push("/login") // Redirect to login if no token
          return
        }

        const response = await fetch("http://localhost:4000/api/user-transactions", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()
        console.log("API Response:", data) // Debug log

        // Ensure data is an array; if not, set to empty array
        if (!Array.isArray(data)) {
          console.warn("API response is not an array:", data)
          setTransactions([])
        } else {
          setTransactions(data)
        }
      } catch (error: unknown) {
        console.error("Error fetching transactions:", error)
        setError((error instanceof Error ? error.message : "Failed to fetch transactions"))
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [router])

  const filteredTransactions = Array.isArray(transactions)
    ? transactions.filter((transaction) => {
        const matchesSearch =
          transaction.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transaction.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transaction.senderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transaction.receiverId.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === "all" || transaction.status.toLowerCase() === statusFilter.toLowerCase()

        return matchesSearch && matchesStatus
      })
    : []

  const handleAddTransaction = async () => {
    try {
      const token = localStorage.getItem("idToken")
      const response = await fetch("http://localhost:4000/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: Date.now(), // or a better unique id
          itemId: newTx.itemId,
          itemName: newTx.itemName,
          quantity: parseInt(newTx.quantity),
          category: newTx.category,
          senderId: newTx.senderId,
          receiverId: newTx.receiverId,
          status: newTx.status
        })
      })
      if (!response.ok) throw new Error("Failed to add transaction")
      setIsDialogOpen(false)
      setNewTx({ itemName: "", quantity: "", category: "", itemId: "", senderId: "", receiverId: "", status: "Confirmed" })
      toast && toast({ title: "Transaction Added", description: "The transaction was added successfully." })
      // Refresh transactions
      const fetchTransactions = async () => {
        setLoading(true)
        setError(null)
        try {
          const token = localStorage.getItem("idToken")
          if (!token) {
            router.push("/login")
            return
          }
          const response = await fetch("http://localhost:4000/api/user-transactions", {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
          const data = await response.json()
          setTransactions(Array.isArray(data) ? data : [])
        } catch (error) {
          setError((error instanceof Error ? error.message : "Failed to fetch transactions"))
        } finally {
          setLoading(false)
        }
      }
      fetchTransactions()
    } catch (error) {
      toast && toast({ title: "Error", description: "Failed to add transaction.", variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading transactions...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <h2 className="text-2xl font-bold">Error</h2>
          <p className="text-red-500">{error}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Confirmed Transactions</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
                <DialogDescription>Fill in all fields to add a new transaction.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="itemName" className="text-right">Product Name*</Label>
                  <Input id="itemName" value={newTx.itemName} onChange={e => setNewTx({ ...newTx, itemName: e.target.value })} className="col-span-3" placeholder="Enter product name" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">Quantity*</Label>
                  <Input id="quantity" type="number" value={newTx.quantity} onChange={e => setNewTx({ ...newTx, quantity: e.target.value })} className="col-span-3" placeholder="Enter quantity" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Category*</Label>
                  <Input id="category" value={newTx.category} onChange={e => setNewTx({ ...newTx, category: e.target.value })} className="col-span-3" placeholder="Enter category" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="itemId" className="text-right">Item ID*</Label>
                  <Input id="itemId" value={newTx.itemId} onChange={e => setNewTx({ ...newTx, itemId: e.target.value })} className="col-span-3" placeholder="Enter item ID" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="senderId" className="text-right">Sender ID*</Label>
                  <Input id="senderId" value={newTx.senderId} onChange={e => setNewTx({ ...newTx, senderId: e.target.value })} className="col-span-3" placeholder="Enter sender address" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="receiverId" className="text-right">Receiver ID*</Label>
                  <Input id="receiverId" value={newTx.receiverId} onChange={e => setNewTx({ ...newTx, receiverId: e.target.value })} className="col-span-3" placeholder="Enter receiver address" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">Status*</Label>
                  <Select value={newTx.status} onValueChange={val => setNewTx({ ...newTx, status: val })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Confirmed">Confirmed</SelectItem>
                      <SelectItem value="Accepted by All">Accepted by All</SelectItem>
                      <SelectItem value="In Transit">In Transit</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddTransaction}>Add Transaction</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search transactions..."
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
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="accepted by all">Accepted by All</SelectItem>
              <SelectItem value="in transit">In Transit</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>Receiver</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.transactionId || transaction.orderId}>
                    <TableCell className="font-medium">
                      <Link href={`/transactions/confirmed/${transaction.transactionId || transaction.orderId}`} className="text-primary hover:underline">
                        {transaction.transactionId || transaction.orderId}
                      </Link>
                    </TableCell>
                    <TableCell>{transaction.itemName}</TableCell>
                    <TableCell>{transaction.quantity}</TableCell>
                    <TableCell>
                      <StatusBadge status={transaction.status || "Confirmed"} />
                    </TableCell>
                    <TableCell>{transaction.senderId}</TableCell>
                    <TableCell>{transaction.receiverId}</TableCell>
                    <TableCell>{transaction.transactionDate?.split("T")[0]}</TableCell>
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
  )
}
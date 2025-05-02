"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CheckCircle, Clock, TruckIcon, Package } from "lucide-react"
import { cn } from "@/lib/utils"

interface Transaction {
  transactionId: string;
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

interface TimelineEvent {
  status: string;
  date?: string;
  user: string;
}

function StatusIcon({ status }: { status: string }) {
  switch (status.toLowerCase()) {
    case "confirmed":
      return <CheckCircle className="h-5 w-5 text-blue-500" />
    case "accepted by all":
      return <CheckCircle className="h-5 w-5 text-indigo-500" />
    case "in transit":
      return <TruckIcon className="h-5 w-5 text-yellow-500" />
    case "delivered":
      return <Package className="h-5 w-5 text-green-500" />
    default:
      return <Clock className="h-5 w-5 text-gray-500" />
  }
}

export default function ConfirmedTransactionDetailsPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransaction = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("idToken")
        const response = await fetch(`http://localhost:4000/api/transactions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        setTransaction(data)
      } catch (error) {
        console.error("Error fetching transaction:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchTransaction()
    }
  }, [id])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading transaction details...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!transaction) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <h2 className="text-2xl font-bold">Transaction not found</h2>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Transactions
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const timeline: TimelineEvent[] = [
    { status: "Confirmed", date: transaction.transactionDate, user: "Admin" },
    ...(transaction.confirmedByAllDate ? [{ status: "Accepted by All", date: transaction.confirmedByAllDate, user: "Vendor" }] : []),
    ...(transaction.inTransitDate ? [{ status: "In Transit", date: transaction.inTransitDate, user: "Shipping" }] : []),
    ...(transaction.deliveredDate ? [{ status: "Delivered", date: transaction.deliveredDate, user: "Delivery" }] : []),
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Transaction {transaction.transactionId}</h1>
          <Badge
            variant="outline"
            className={cn(
              "ml-auto font-medium text-sm px-3 py-1",
              (transaction.status || "Confirmed").toLowerCase() === "confirmed" && "bg-blue-100 text-blue-800",
              (transaction.status || "Confirmed").toLowerCase() === "accepted by all" && "bg-indigo-100 text-indigo-800",
              (transaction.status || "Confirmed").toLowerCase() === "in transit" && "bg-yellow-100 text-yellow-800",
              (transaction.status || "Confirmed").toLowerCase() === "delivered" && "bg-green-100 text-green-800",
            )}
          >
            {transaction.status}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Product</p>
                <p className="font-medium">{transaction.itemName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                <p className="font-medium">{transaction.quantity}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <p className="font-medium">{transaction.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transaction Date</p>
                <p className="font-medium">{transaction.transactionDate?.split("T")[0]}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sender</p>
                <p className="font-medium">{transaction.senderId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receiver</p>
                <p className="font-medium">{transaction.receiverId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confirmed by All</p>
                <p className="font-medium">{transaction.confirmedByAllDate?.split("T")[0] || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Transit</p>
                <p className="font-medium">{transaction.inTransitDate?.split("T")[0] || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                <p className="font-medium">{transaction.deliveredDate?.split("T")[0] || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {timeline.map((event, index) => (
                <div key={index} className="mb-8 flex gap-4">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <StatusIcon status={event.status} />
                    {index < timeline.length - 1 && (
                      <div className="absolute top-10 left-1/2 h-full w-px -translate-x-1/2 bg-border" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <p className="font-medium">{event.status}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        {event.date ? new Date(event.date).toLocaleString() : "N/A"}
                      </p>
                      <span className="text-sm text-muted-foreground">•</span>
                      <p className="text-sm text-muted-foreground">{event.user}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
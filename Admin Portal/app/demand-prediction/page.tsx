"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

// Mock inventory items with current month sales and predicted next month sales
const inventoryItems = [
  {
    id: "ITM-001",
    name: "Office Chairs",
    currentSales: 120,
    predictedSales: 135,
    trend: "up",
    confidence: "high",
  },
  {
    id: "ITM-002",
    name: "Desk Lamps",
    currentSales: 85,
    predictedSales: 90,
    trend: "up",
    confidence: "medium",
  },
  {
    id: "ITM-003",
    name: "Monitors",
    currentSales: 50,
    predictedSales: 65,
    trend: "up",
    confidence: "high",
  },
  {
    id: "ITM-004",
    name: "Keyboards",
    currentSales: 95,
    predictedSales: 90,
    trend: "down",
    confidence: "medium",
  },
  {
    id: "ITM-005",
    name: "Desk Organizers",
    currentSales: 200,
    predictedSales: 180,
    trend: "down",
    confidence: "high",
  },
  {
    id: "ITM-006",
    name: "Whiteboards",
    currentSales: 30,
    predictedSales: 45,
    trend: "up",
    confidence: "medium",
  },
  {
    id: "ITM-007",
    name: "Filing Cabinets",
    currentSales: 25,
    predictedSales: 20,
    trend: "down",
    confidence: "low",
  },
]

// Confidence badge component
function ConfidenceBadge({ confidence }: { confidence: string }) {
  const getConfidenceColor = (confidence: string) => {
    switch (confidence.toLowerCase()) {
      case "high":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "medium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "low":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <Badge variant="outline" className={cn("font-medium", getConfidenceColor(confidence))}>
      {confidence}
    </Badge>
  )
}

export default function DemandPredictionPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [predictions, setPredictions] = useState(inventoryItems)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const { toast } = useToast()

  const runPrediction = async () => {
    setIsLoading(true)

    try {
      // Simulate API call to AI prediction service
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In a real app, this would be the result from the AI API
      // For this mock, we'll just use the existing data with slight variations
      const newPredictions = inventoryItems.map((item) => ({
        ...item,
        predictedSales: Math.floor(item.currentSales * (0.9 + Math.random() * 0.3)),
        trend: Math.random() > 0.5 ? "up" : "down",
        confidence: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
      }))

      setPredictions(newPredictions)
      setLastUpdated(new Date())

      toast({
        title: "Prediction Complete",
        description: "Demand predictions have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Prediction Failed",
        description: "There was an error running the demand prediction.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate summary statistics
  const totalCurrentSales = predictions.reduce((sum, item) => sum + item.currentSales, 0)
  const totalPredictedSales = predictions.reduce((sum, item) => sum + item.predictedSales, 0)
  const percentChange = ((totalPredictedSales - totalCurrentSales) / totalCurrentSales) * 100

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Demand Prediction</h1>
          <Button onClick={runPrediction} disabled={isLoading}>
            <Sparkles className="mr-2 h-4 w-4" />
            {isLoading ? "Running Prediction..." : "Predict Next Month's Demand"}
          </Button>
        </div>

        {lastUpdated && <p className="text-sm text-muted-foreground">Last updated: {lastUpdated.toLocaleString()}</p>}

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Current Month Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCurrentSales} units</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Predicted Next Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPredictedSales} units</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Projected Change</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="text-2xl font-bold">{percentChange.toFixed(1)}%</div>
                {percentChange >= 0 ? (
                  <TrendingUp className="ml-2 h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="ml-2 h-4 w-4 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Predictions table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item ID</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Current Month Sales</TableHead>
                <TableHead>Predicted Next Month</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {predictions.map((item) => {
                const change = ((item.predictedSales - item.currentSales) / item.currentSales) * 100

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.currentSales} units</TableCell>
                    <TableCell>{item.predictedSales} units</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className={change >= 0 ? "text-green-600" : "text-red-600"}>{change.toFixed(1)}%</span>
                        {change >= 0 ? (
                          <TrendingUp className="ml-2 h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="ml-2 h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ConfidenceBadge confidence={item.confidence} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  )
}


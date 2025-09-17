"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, DollarSign, FileText, TrendingUp, Calendar } from "lucide-react"

interface BillingRecord {
  id: string
  patientName: string
  service: string
  amount: number
  status: "pending" | "paid" | "overdue" | "cancelled"
  date: string
  insuranceStatus: "covered" | "partial" | "denied" | "pending"
}

// Mock billing data
const mockBillingData: BillingRecord[] = [
  {
    id: "bill-1",
    patientName: "John Smith",
    service: "Annual Checkup",
    amount: 250.0,
    status: "paid",
    date: "2024-01-15",
    insuranceStatus: "covered",
  },
  {
    id: "bill-2",
    patientName: "Sarah Johnson",
    service: "Blood Work",
    amount: 180.0,
    status: "pending",
    date: "2024-01-16",
    insuranceStatus: "pending",
  },
  {
    id: "bill-3",
    patientName: "Michael Brown",
    service: "X-Ray",
    amount: 320.0,
    status: "overdue",
    date: "2024-01-10",
    insuranceStatus: "partial",
  },
  {
    id: "bill-4",
    patientName: "Emily Davis",
    service: "Consultation",
    amount: 150.0,
    status: "paid",
    date: "2024-01-12",
    insuranceStatus: "covered",
  },
  {
    id: "bill-5",
    patientName: "Robert Wilson",
    service: "Physical Therapy",
    amount: 120.0,
    status: "pending",
    date: "2024-01-18",
    insuranceStatus: "covered",
  },
]

export default function BillingPage() {
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>(mockBillingData)
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(false)

  const filteredRecords =
    statusFilter === "all" ? billingRecords : billingRecords.filter((record) => record.status === statusFilter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "pending":
        return "secondary"
      case "overdue":
        return "destructive"
      case "cancelled":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getInsuranceStatusColor = (status: string) => {
    switch (status) {
      case "covered":
        return "default"
      case "partial":
        return "secondary"
      case "denied":
        return "destructive"
      case "pending":
        return "outline"
      default:
        return "secondary"
    }
  }

  const totalRevenue = billingRecords
    .filter((record) => record.status === "paid")
    .reduce((sum, record) => sum + record.amount, 0)

  const pendingAmount = billingRecords
    .filter((record) => record.status === "pending")
    .reduce((sum, record) => sum + record.amount, 0)

  const overdueAmount = billingRecords
    .filter((record) => record.status === "overdue")
    .reduce((sum, record) => sum + record.amount, 0)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Billing & Revenue</h2>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {billingRecords.filter((r) => r.status === "pending").length} invoices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${overdueAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {billingRecords.filter((r) => r.status === "overdue").length} overdue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingRecords.length}</div>
            <p className="text-xs text-muted-foreground">Total transactions</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Insurance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{record.patientName}</TableCell>
                  <TableCell>{record.service}</TableCell>
                  <TableCell className="font-mono">${record.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(record.status)}>{record.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getInsuranceStatusColor(record.insuranceStatus)}>{record.insuranceStatus}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                      {record.status === "pending" && (
                        <Button size="sm" variant="outline">
                          Send Reminder
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

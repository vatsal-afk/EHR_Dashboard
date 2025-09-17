"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, TestTube } from "lucide-react"

interface DiagnosticReport {
  id: string
  code?: string
  status?: string
  effectiveDate?: string
  issued?: string
  patient?: {
    id: string
    name: string
  }
}

interface Patient {
  id: string
  name: string
}

export default function DiagnosticReportsPage() {
  const [reports, setReports] = useState<DiagnosticReport[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState("all")

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/patients")
      const patientsData = await response.json()

      const allReports: DiagnosticReport[] = []
      patientsData.forEach((patient: any) => {
        if (patient.diagnosticReports) {
          patient.diagnosticReports.forEach((report: any) => {
            allReports.push({
              ...report,
              patient: { id: patient.id, name: patient.name },
            })
          })
        }
      })

      const filteredReports =
        selectedPatient === "all" ? allReports : allReports.filter((r) => r.patient?.id === selectedPatient)

      setReports(filteredReports)
    } catch (error) {
      console.error("Failed to fetch diagnostic reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const response = await fetch("/api/patients")
      const data = await response.json()
      setPatients(data)
    } catch (error) {
      console.error("Failed to fetch patients:", error)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    fetchReports()
  }, [selectedPatient])

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "final":
        return "default"
      case "preliminary":
        return "secondary"
      case "amended":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">Loading...</div>
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Diagnostic Reports</h2>
      </div>

      <div className="flex items-center space-x-4">
        <Select value={selectedPatient} onValueChange={setSelectedPatient}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Patients</SelectItem>
            {patients.map((patient) => (
              <SelectItem key={patient.id} value={patient.id}>
                {patient.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground">All diagnostic reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Final Reports</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.filter((r) => r.status === "final").length}</div>
            <p className="text-xs text-muted-foreground">Completed reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {reports.filter((r) => r.status === "preliminary").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Lab Results & Reports</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Report Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issued</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    {report.effectiveDate ? new Date(report.effectiveDate).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell className="font-medium">{report.patient?.name}</TableCell>
                  <TableCell>{report.code}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(report.status)}>{report.status}</Badge>
                  </TableCell>
                  <TableCell>{report.issued ? new Date(report.issued).toLocaleDateString() : "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

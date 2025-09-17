"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Activity, FileText, RefreshCw } from "lucide-react"
import { format, isSameDay, parseISO, formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// This is the combined render function that was provided previously.
const renderCellContent = (value: any, field: string) => {
  if (value === null || value === undefined) return "N/A"

  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return value.map((item) => item.display || item.text || item.code || JSON.stringify(item)).join(", ")
    }
    if (value.coding) {
      const firstCoding = value.coding[0]
      return value.text || firstCoding?.display || firstCoding?.code || "N/A"
    }
    if (value.value !== undefined) return `${value.value} ${value.unit || ""}`.trim()
    if (value.display) return value.display
    if (value.text) return value.text
    return JSON.stringify(value)
  }

  if (field.toLowerCase().includes("date") || field.toLowerCase().includes("time")) {
    const d = new Date(value)
    if (!isNaN(d.getTime())) return d.toLocaleString()
  }

  return String(value)
}


export default function DashboardPage() {
  const [stats, setStats] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [fhirReports, setFhirReports] = useState<any[]>([])
  const [fhirObservations, setFhirObservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        const [patientsRes, appointmentsRes, reportsRes, encountersRes, fhirReportsRes, fhirObsRes] =
          await Promise.all([
            fetch("/api/patients"),
            fetch("/api/appointments"),
            fetch("/api/diagnosticreports"),
            fetch("/api/encounters"),
            fetch("https://hapi.fhir.org/baseR4/DiagnosticReport?_count=5"),
            fetch("https://hapi.fhir.org/baseR4/Observation?_count=5"),
          ])

        const [patients, appointmentsData, reports, encounters, fhirReportsJson, fhirObsJson] = await Promise.all([
          patientsRes.json(),
          appointmentsRes.json(),
          reportsRes.json(),
          encountersRes.json(),
          fhirReportsRes.json(),
          fhirObsRes.json(),
        ])

        setStats([
          {
            title: "Total Patients",
            value: Array.isArray(patients) ? patients.length.toString() : "0",
            description: "All registered patients",
            icon: Users,
          },
          {
            title: "Appointments Today",
            value: Array.isArray(appointmentsData)
              ? appointmentsData.filter((a: any) => a.start && isSameDay(parseISO(a.start), new Date())).length.toString()
              : "0",
            description: "Today's booked appointments",
            icon: Calendar,
          },
          {
            title: "Active Cases",
            value: Array.isArray(encounters) ? encounters.length.toString() : "0",
            description: "Ongoing encounters",
            icon: Activity,
          },
          {
            title: "Reports Generated",
            value: Array.isArray(reports) ? reports.length.toString() : "0",
            description: "Total diagnostic reports",
            icon: FileText,
          },
        ])

        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : [])
        setRecentActivity(Array.isArray(reports) ? reports.slice(0, 5) : [])

        if (fhirReportsJson?.entry) {
          setFhirReports(fhirReportsJson.entry.map((e: any) => e.resource))
        }
        if (fhirObsJson?.entry) {
          setFhirObservations(fhirObsJson.entry.map((e: any) => e.resource))
        }
      } catch (err) {
        console.error("Dashboard fetch error", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [refreshTrigger])

  const fhirReportFields = ["id", "status", "code", "subject", "issued"]
  const fhirObservationFields = ["id", "status", "code", "subject", "valueQuantity", "effectiveDateTime"]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Button onClick={() => setRefreshTrigger((prev) => prev + 1)}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Diagnostic Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Diagnostic Reports (FHIR API)</CardTitle>
          <CardDescription>Latest diagnostic reports</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading reports...</p>
          ) : fhirReports.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {fhirReportFields.map((field) => (
                      <TableHead key={field}>{field}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fhirReports.map((report, idx) => (
                    <TableRow key={idx}>
                      {fhirReportFields.map((field) => (
                        <TableCell key={field}>{renderCellContent(report[field], field)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p>No diagnostic reports found.</p>
          )}
        </CardContent>
      </Card>

      {/* Observations */}
      <Card>
        <CardHeader>
          <CardTitle>Observations (FHIR API)</CardTitle>
          <CardDescription>Latest clinical observations</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading observations...</p>
          ) : fhirObservations.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {fhirObservationFields.map((field) => (
                      <TableHead key={field}>{field}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fhirObservations.map((obs, idx) => (
                    <TableRow key={idx}>
                      {fhirObservationFields.map((field) => (
                        <TableCell key={field}>{renderCellContent(obs[field], field)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p>No observations found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
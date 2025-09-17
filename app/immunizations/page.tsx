"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, UserCheck } from "lucide-react"

interface Immunization {
  id: string
  vaccine?: string
  status?: string
  primarySource?: boolean
  patient?: {
    id: string
    name: string
  }
}

interface Patient {
  id: string
  name: string
}

export default function ImmunizationsPage() {
  const [immunizations, setImmunizations] = useState<Immunization[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState("all")

  const fetchImmunizations = async () => {
    try {
      const response = await fetch("/api/patients")
      const patientsData = await response.json()

      const allImmunizations: Immunization[] = []
      patientsData.forEach((patient: any) => {
        if (patient.immunizations) {
          patient.immunizations.forEach((immunization: any) => {
            allImmunizations.push({
              ...immunization,
              patient: { id: patient.id, name: patient.name },
            })
          })
        }
      })

      const filteredImmunizations =
        selectedPatient === "all" ? allImmunizations : allImmunizations.filter((i) => i.patient?.id === selectedPatient)

      setImmunizations(filteredImmunizations)
    } catch (error) {
      console.error("Failed to fetch immunizations:", error)
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
    fetchImmunizations()
  }, [selectedPatient])

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "not-done":
        return "destructive"
      case "entered-in-error":
        return "outline"
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
        <h2 className="text-3xl font-bold tracking-tight">Immunization Records</h2>
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
            <CardTitle className="text-sm font-medium">Total Immunizations</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{immunizations.length}</div>
            <p className="text-xs text-muted-foreground">All immunization records</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {immunizations.filter((i) => i.status === "completed").length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully administered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Primary Source</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {immunizations.filter((i) => i.primarySource).length}
            </div>
            <p className="text-xs text-muted-foreground">Verified records</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Vaccination History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Vaccine</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {immunizations.map((immunization) => (
                <TableRow key={immunization.id}>
                  <TableCell className="font-medium">{immunization.patient?.name}</TableCell>
                  <TableCell>{immunization.vaccine}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(immunization.status)}>{immunization.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={immunization.primarySource ? "default" : "secondary"}>
                      {immunization.primarySource ? "Primary" : "Secondary"}
                    </Badge>
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

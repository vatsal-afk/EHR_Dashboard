"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle } from "lucide-react"

interface Allergy {
  id: string
  code?: string
  status?: string
  criticality?: string
  patient?: {
    id: string
    name: string
  }
}

interface Patient {
  id: string
  name: string
}

export default function AllergiesPage() {
  const [allergies, setAllergies] = useState<Allergy[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState("all")

  const fetchAllergies = async () => {
    try {
      const response = await fetch("/api/patients")
      const patientsData = await response.json()

      const allAllergies: Allergy[] = []
      patientsData.forEach((patient: any) => {
        if (patient.allergies) {
          patient.allergies.forEach((allergy: any) => {
            allAllergies.push({
              ...allergy,
              patient: { id: patient.id, name: patient.name },
            })
          })
        }
      })

      const filteredAllergies =
        selectedPatient === "all" ? allAllergies : allAllergies.filter((a) => a.patient?.id === selectedPatient)

      setAllergies(filteredAllergies)
    } catch (error) {
      console.error("Failed to fetch allergies:", error)
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
    fetchAllergies()
  }, [selectedPatient])

  const getCriticalityColor = (criticality?: string) => {
    switch (criticality) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
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
        <h2 className="text-3xl font-bold tracking-tight">Allergy Management</h2>
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
            <CardTitle className="text-sm font-medium">High Risk Allergies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {allergies.filter((a) => a.criticality === "high").length}
            </div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Allergies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allergies.filter((a) => a.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">Currently monitored</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Allergies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allergies.length}</div>
            <p className="text-xs text-muted-foreground">All recorded allergies</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Patient Allergies</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Allergy</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criticality</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allergies.map((allergy) => (
                <TableRow key={allergy.id}>
                  <TableCell className="font-medium">{allergy.patient?.name}</TableCell>
                  <TableCell>{allergy.code}</TableCell>
                  <TableCell>
                    <Badge variant={allergy.status === "active" ? "default" : "secondary"}>{allergy.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getCriticalityColor(allergy.criticality)}>{allergy.criticality}</Badge>
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

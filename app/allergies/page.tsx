"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { AlertTriangle, Search } from "lucide-react"

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

export default function AllergiesPage() {
  const [allergies, setAllergies] = useState<Allergy[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchAllergies = async () => {
    setLoading(true)
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

      const filteredAllergies = allAllergies.filter(
        (allergy) =>
          allergy.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          allergy.patient?.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )

      setAllergies(filteredAllergies)
    } catch (error) {
      console.error("Failed to fetch allergies:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAllergies()
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

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
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
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
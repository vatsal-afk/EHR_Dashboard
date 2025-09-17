"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PatientForm } from "@/components/patient-form"
import { Search, Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

interface Patient {
  id: string
  name: string
  gender?: string
  birthDate?: string
  allergies: Array<{ id: string; code?: string; criticality?: string }>
  conditions: Array<{ id: string; code?: string }>
  medications: Array<{ id: string; code?: string }>
  appointments: Array<{ id: string; status?: string }>
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchPatients = async () => {
    try {
      const response = await fetch(`/api/patients?search=${searchTerm}`)
      const data = await response.json()
      setPatients(data)
    } catch (error) {
      console.error("Failed to fetch patients:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [searchTerm])

  const handleDelete = async (patientId: string) => {
    if (confirm("Are you sure you want to delete this patient?")) {
      try {
        await fetch(`/api/patients/${patientId}`, { method: "DELETE" })
        fetchPatients()
      } catch (error) {
        console.error("Failed to delete patient:", error)
      }
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return "N/A"
    const today = new Date()
    const birth = new Date(birthDate)
    const age = today.getFullYear() - birth.getFullYear()
    return age
  }

  if (loading) {
    return <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">Loading...</div>
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Patient Management</h2>
        <PatientForm onPatientCreated={fetchPatients} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patients</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Allergies</TableHead>
                <TableHead>Conditions</TableHead>
                <TableHead>Medications</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={`/generic-placeholder-graphic.png?height=40&width=40`} />
                        <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-muted-foreground">{patient.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{calculateAge(patient.birthDate)}</TableCell>
                  <TableCell className="capitalize">{patient.gender || "N/A"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {patient.allergies.slice(0, 2).map((allergy) => (
                        <Badge key={allergy.id} variant={allergy.criticality === "high" ? "destructive" : "secondary"}>
                          {allergy.code}
                        </Badge>
                      ))}
                      {patient.allergies.length > 2 && <Badge variant="outline">+{patient.allergies.length - 2}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {patient.conditions.slice(0, 2).map((condition) => (
                        <Badge key={condition.id} variant="outline">
                          {condition.code}
                        </Badge>
                      ))}
                      {patient.conditions.length > 2 && (
                        <Badge variant="outline">+{patient.conditions.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{patient.medications.length}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={patient.appointments.some((a) => a.status === "scheduled") ? "default" : "secondary"}
                    >
                      {patient.appointments.some((a) => a.status === "scheduled") ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Link href={`/patients/${patient.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(patient.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

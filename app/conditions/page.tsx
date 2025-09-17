"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart } from "lucide-react"

interface Condition {
  id: string
  code?: string
  patient?: {
    id: string
    name: string
  }
}

interface Patient {
  id: string
  name: string
}

export default function ConditionsPage() {
  const [conditions, setConditions] = useState<Condition[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState("all")

  const fetchConditions = async () => {
    try {
      const response = await fetch("/api/patients")
      const patientsData = await response.json()

      const allConditions: Condition[] = []
      patientsData.forEach((patient: any) => {
        if (patient.conditions) {
          patient.conditions.forEach((condition: any) => {
            allConditions.push({
              ...condition,
              patient: { id: patient.id, name: patient.name },
            })
          })
        }
      })

      const filteredConditions =
        selectedPatient === "all" ? allConditions : allConditions.filter((c) => c.patient?.id === selectedPatient)

      setConditions(filteredConditions)
    } catch (error) {
      console.error("Failed to fetch conditions:", error)
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
    fetchConditions()
  }, [selectedPatient])

  if (loading) {
    return <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">Loading...</div>
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Medical Conditions</h2>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5" />
            <span>Active Medical Conditions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Condition</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conditions.map((condition) => (
                <TableRow key={condition.id}>
                  <TableCell className="font-medium">{condition.patient?.name}</TableCell>
                  <TableCell>{condition.code}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

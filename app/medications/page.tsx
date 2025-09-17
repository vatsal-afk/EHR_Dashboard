"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Pill, Plus, AlertTriangle, Search } from "lucide-react"

interface Medication {
  id: string
  code?: string
  status?: string
  patient?: {
    id: string
    name: string
  }
}

interface Patient {
  id: string
  name: string
}

const commonMedications = [
  "Lisinopril 10mg",
  "Metformin 500mg",
  "Atorvastatin 20mg",
  "Amlodipine 5mg",
  "Omeprazole 20mg",
  "Levothyroxine 50mcg",
  "Albuterol Inhaler",
  "Ibuprofen 400mg",
  "Acetaminophen 500mg",
  "Aspirin 81mg",
]

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [allMedications, setAllMedications] = useState<Medication[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchMedications = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/medications")
      const data = await response.json()
      if (Array.isArray(data)) {
        setAllMedications(data)
        setMedications(data)
      } else {
        setAllMedications([])
        setMedications([])
      }
    } catch (error) {
      console.error("Failed to fetch medications:", error)
      setAllMedications([])
      setMedications([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const response = await fetch("/api/patients")
      const data = await response.json()
      if (Array.isArray(data)) {
        setPatients(data)
      } else {
        setPatients([])
      }
    } catch (error) {
      console.error("Failed to fetch patients:", error)
      setPatients([])
    }
  }

  useEffect(() => {
    fetchPatients()
    fetchMedications()
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (allMedications) {
        const filtered = allMedications.filter((medication) =>
          medication.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          medication.patient?.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          medication.code?.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        setMedications(filtered)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, allMedications])

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      case "discontinued":
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
        <h2 className="text-3xl font-bold tracking-tight">Medication Management</h2>
        <MedicationForm patients={patients} onMedicationCreated={fetchMedications} />
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
            <CardTitle className="text-sm font-medium">Active Medications</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allMedications.filter((m) => m.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">Currently prescribed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discontinued</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allMedications.filter((m) => m.status === "discontinued").length}</div>
            <p className="text-xs text-muted-foreground">No longer prescribed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Medications</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allMedications.length}</div>
            <p className="text-xs text-muted-foreground">All time records</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Pill className="h-5 w-5" />
            <span>Medication List</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Medication</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medications.length > 0 ? (
                medications.map((medication) => (
                  <TableRow key={medication.id}>
                    <TableCell className="font-medium">{medication.patient?.name}</TableCell>
                    <TableCell>{medication.code}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(medication.status)}>{medication.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No matching medications found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function MedicationForm({ patients, onMedicationCreated }: { patients: Patient[]; onMedicationCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    patientId: "",
    code: "",
    status: "active",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({
          patientId: "",
          code: "",
          status: "active",
        })
        setOpen(false)
        onMedicationCreated()
      }
    } catch (error) {
      console.error("Failed to create medication:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Medication
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Prescribe New Medication</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="patient">Patient</Label>
            <Select
              value={formData.patientId}
              onValueChange={(value) => setFormData({ ...formData, patientId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="code">Medication</Label>
            <Select value={formData.code} onValueChange={(value) => setFormData({ ...formData, code: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select medication" />
              </SelectTrigger>
              <SelectContent>
                {commonMedications.map((med) => (
                  <SelectItem key={med} value={med}>
                    {med}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Prescribing..." : "Prescribe Medication"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
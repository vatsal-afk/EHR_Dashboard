"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Activity, Plus, TrendingUp, TrendingDown, Minus, Search } from "lucide-react"

interface Observation {
  id: string
  code?: string
  value?: string
  date?: string
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

const vitalSigns = [
  "Blood Pressure",
  "Heart Rate",
  "Temperature",
  "Respiratory Rate",
  "Oxygen Saturation",
  "Weight",
  "Height",
  "BMI",
]

export default function ObservationsPage() {
  const [observations, setObservations] = useState<Observation[]>([])
  const [allObservations, setAllObservations] = useState<Observation[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchObservations = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/observations")
      const data = await response.json()
      if (Array.isArray(data)) {
        setAllObservations(data)
        setObservations(data)
      } else {
        setAllObservations([])
        setObservations([])
      }
    } catch (error) {
      console.error("Failed to fetch observations:", error)
      setAllObservations([])
      setObservations([])
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
    fetchObservations()
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (allObservations) {
        const filtered = allObservations.filter((observation) =>
          observation.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          observation.patient?.id?.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        setObservations(filtered)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, allObservations])

  const getValueTrend = (value?: string) => {
    if (!value) return null
    const numValue = Number.parseFloat(value)
    if (isNaN(numValue)) return null

    if (value.includes("/")) {
      const [systolic] = value.split("/").map((v) => Number.parseInt(v))
      if (systolic > 140) return "high"
      if (systolic < 90) return "low"
      return "normal"
    }

    return "normal"
  }

  const getTrendIcon = (trend: string | null) => {
    switch (trend) {
      case "high":
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case "low":
        return <TrendingDown className="h-4 w-4 text-blue-500" />
      case "normal":
        return <Minus className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  if (loading) {
    return <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">Loading...</div>
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Clinical Observations</h2>
        <ObservationForm patients={patients} onObservationCreated={fetchObservations} />
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Vital Signs & Observations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Observation</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {observations.length > 0 ? (
                observations.map((observation) => {
                  const trend = getValueTrend(observation.value)
                  return (
                    <TableRow key={observation.id}>
                      <TableCell>{observation.date ? new Date(observation.date).toLocaleDateString() : "N/A"}</TableCell>
                      <TableCell className="font-medium">{observation.patient?.name}</TableCell>
                      <TableCell>{observation.code}</TableCell>
                      <TableCell className="font-mono">{observation.value}</TableCell>
                      <TableCell>
                        <Badge variant={observation.status === "final" ? "default" : "secondary"}>
                          {observation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{getTrendIcon(trend)}</TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No matching observations found.
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

function ObservationForm({
  patients,
  onObservationCreated,
}: { patients: Patient[]; onObservationCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    patientId: "",
    code: "",
    value: "",
    date: new Date().toISOString().split("T")[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/observations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          date: new Date(formData.date).toISOString(),
        }),
      })

      if (response.ok) {
        setFormData({
          patientId: "",
          code: "",
          value: "",
          date: new Date().toISOString().split("T")[0],
        })
        setOpen(false)
        onObservationCreated()
      }
    } catch (error) {
      console.error("Failed to create observation:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Observation
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record New Observation</DialogTitle>
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
            <Label htmlFor="code">Observation Type</Label>
            <Select value={formData.code} onValueChange={(value) => setFormData({ ...formData, code: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select observation type" />
              </SelectTrigger>
              <SelectContent>
                {vitalSigns.map((vital) => (
                  <SelectItem key={vital} value={vital}>
                    {vital}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="e.g., 120/80, 98.6°F, 72 bpm"
              required
            />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Recording..." : "Record Observation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
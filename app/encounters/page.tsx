"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileText, Plus, Calendar } from "lucide-react"

interface Encounter {
  id: string
  status?: string
  class?: string
  subject?: string
  start?: string
  end?: string
  patient?: {
    id: string
    name: string
  }
}

interface Patient {
  id: string
  name: string
}

const encounterTypes = ["inpatient", "outpatient", "ambulatory", "emergency", "home", "field", "daytime", "virtual"]

export default function EncountersPage() {
  const [encounters, setEncounters] = useState<Encounter[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState("all")

  const fetchEncounters = async () => {
    try {
      const patientParam = selectedPatient === "all" ? "" : selectedPatient
      const response = await fetch(`/api/encounters?patientId=${patientParam}`)
      const data = await response.json()
      setEncounters(data)
    } catch (error) {
      console.error("Failed to fetch encounters:", error)
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
    fetchEncounters()
  }, [selectedPatient])

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "finished":
        return "default"
      case "in-progress":
        return "secondary"
      case "cancelled":
        return "destructive"
      case "planned":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getEncounterTypeColor = (type?: string) => {
    switch (type) {
      case "emergency":
        return "destructive"
      case "inpatient":
        return "default"
      case "outpatient":
        return "secondary"
      case "virtual":
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
        <h2 className="text-3xl font-bold tracking-tight">Patient Encounters</h2>
        <EncounterForm patients={patients} onEncounterCreated={fetchEncounters} />
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

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Encounters</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{encounters.length}</div>
            <p className="text-xs text-muted-foreground">All patient encounters</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{encounters.filter((e) => e.status === "in-progress").length}</div>
            <p className="text-xs text-muted-foreground">Active encounters</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{encounters.filter((e) => e.status === "finished").length}</div>
            <p className="text-xs text-muted-foreground">Finished encounters</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emergency</CardTitle>
            <FileText className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {encounters.filter((e) => e.class === "emergency").length}
            </div>
            <p className="text-xs text-muted-foreground">Emergency visits</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Encounter History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {encounters.map((encounter) => {
                const duration =
                  encounter.start && encounter.end
                    ? Math.round(
                        (new Date(encounter.end).getTime() - new Date(encounter.start).getTime()) / (1000 * 60),
                      )
                    : null

                return (
                  <TableRow key={encounter.id}>
                    <TableCell>{encounter.start ? new Date(encounter.start).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell className="font-medium">{encounter.patient?.name}</TableCell>
                    <TableCell>
                      <Badge variant={getEncounterTypeColor(encounter.class)}>{encounter.class}</Badge>
                    </TableCell>
                    <TableCell>{encounter.subject}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(encounter.status)}>{encounter.status}</Badge>
                    </TableCell>
                    <TableCell>{duration ? `${duration} min` : "N/A"}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function EncounterForm({ patients, onEncounterCreated }: { patients: Patient[]; onEncounterCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    patientId: "",
    status: "planned",
    class: "outpatient",
    subject: "",
    start: "",
    end: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/encounters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          start: formData.start ? new Date(formData.start).toISOString() : null,
          end: formData.end ? new Date(formData.end).toISOString() : null,
        }),
      })

      if (response.ok) {
        setFormData({
          patientId: "",
          status: "planned",
          class: "outpatient",
          subject: "",
          start: "",
          end: "",
        })
        setOpen(false)
        onEncounterCreated()
      }
    } catch (error) {
      console.error("Failed to create encounter:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Encounter
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Encounter</DialogTitle>
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
            <Label htmlFor="class">Encounter Type</Label>
            <Select value={formData.class} onValueChange={(value) => setFormData({ ...formData, class: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {encounterTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="subject">Subject/Reason</Label>
            <Textarea
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Reason for encounter"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="start">Start Date/Time</Label>
              <Input
                id="start"
                type="datetime-local"
                value={formData.start}
                onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="end">End Date/Time</Label>
              <Input
                id="end"
                type="datetime-local"
                value={formData.end}
                onChange={(e) => setFormData({ ...formData, end: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="finished">Finished</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Encounter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

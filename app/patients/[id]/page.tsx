"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Plus, Calendar, Activity, Pill, AlertTriangle } from "lucide-react"

interface PatientDetails {
  id: string
  name: string
  gender?: string
  birthDate?: string
  allergies: Array<{ id: string; code?: string; status?: string; criticality?: string }>
  conditions: Array<{ id: string; code?: string }>
  medications: Array<{ id: string; code?: string; status?: string }>
  appointments: Array<{ id: string; status?: string; description?: string; start?: string; provider?: string }>
  observations: Array<{ id: string; code?: string; value?: string; date?: string }>
  diagnosticReports: Array<{ id: string; code?: string; status?: string; effectiveDate?: string }>
}

export default function PatientDetailPage() {
  const params = useParams()
  const [patient, setPatient] = useState<PatientDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({ name: "", gender: "", birthDate: "" })

  const fetchPatient = async () => {
    try {
      const response = await fetch(`/api/patients/${params.id}`)
      const data = await response.json()
      setPatient(data)
      setEditData({ name: data.name, gender: data.gender || "", birthDate: data.birthDate || "" })
    } catch (error) {
      console.error("Failed to fetch patient:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatient()
  }, [params.id])

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/patients/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      })

      if (response.ok) {
        setEditMode(false)
        fetchPatient()
      }
    } catch (error) {
      console.error("Failed to update patient:", error)
    }
  }

  const addAllergy = async (allergyData: { code: string; status: string; criticality: string }) => {
    try {
      await fetch("/api/allergies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...allergyData, patientId: params.id }),
      })
      fetchPatient()
    } catch (error) {
      console.error("Failed to add allergy:", error)
    }
  }

  const addCondition = async (conditionData: { code: string }) => {
    try {
      await fetch("/api/conditions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...conditionData, patientId: params.id }),
      })
      fetchPatient()
    } catch (error) {
      console.error("Failed to add condition:", error)
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

  if (!patient) {
    return <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">Patient not found</div>
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Patient Details</h2>
        <Button onClick={() => setEditMode(!editMode)}>
          <Edit className="mr-2 h-4 w-4" />
          {editMode ? "Cancel" : "Edit Patient"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={`/placeholder_64px.png?height=64&width=64`} />
              <AvatarFallback className="text-lg">{getInitials(patient.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {editMode ? (
                <div className="space-y-2">
                  <Input
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="text-2xl font-bold"
                  />
                  <div className="flex space-x-2">
                    <Select
                      value={editData.gender}
                      onValueChange={(value) => setEditData({ ...editData, gender: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      value={editData.birthDate}
                      onChange={(e) => setEditData({ ...editData, birthDate: e.target.value })}
                      className="w-40"
                    />
                    <Button onClick={handleSave}>Save</Button>
                  </div>
                </div>
              ) : (
                <>
                  <CardTitle className="text-2xl">{patient.name}</CardTitle>
                  <div className="flex items-center space-x-4 text-muted-foreground">
                    <span>Age: {calculateAge(patient.birthDate)}</span>
                    <span>Gender: {patient.gender || "N/A"}</span>
                    <span>ID: {patient.id}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="allergies">Allergies</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Allergies</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patient.allergies.length}</div>
                <p className="text-xs text-muted-foreground">
                  {patient.allergies.filter((a) => a.criticality === "high").length} high risk
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conditions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patient.conditions.length}</div>
                <p className="text-xs text-muted-foreground">Active conditions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Medications</CardTitle>
                <Pill className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patient.medications.length}</div>
                <p className="text-xs text-muted-foreground">Current medications</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patient.appointments.length}</div>
                <p className="text-xs text-muted-foreground">Total appointments</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="allergies">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Allergies</CardTitle>
                <AllergyForm onAllergyAdded={addAllergy} />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Allergy</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criticality</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.allergies.map((allergy) => (
                    <TableRow key={allergy.id}>
                      <TableCell className="font-medium">{allergy.code}</TableCell>
                      <TableCell>
                        <Badge variant={allergy.status === "active" ? "default" : "secondary"}>{allergy.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={allergy.criticality === "high" ? "destructive" : "secondary"}>
                          {allergy.criticality}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conditions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Medical Conditions</CardTitle>
                <ConditionForm onConditionAdded={addCondition} />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Condition</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.conditions.map((condition) => (
                    <TableRow key={condition.id}>
                      <TableCell className="font-medium">{condition.code}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications">
          <Card>
            <CardHeader>
              <CardTitle>Current Medications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medication</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.medications.map((medication) => (
                    <TableRow key={medication.id}>
                      <TableCell className="font-medium">{medication.code}</TableCell>
                      <TableCell>
                        <Badge variant={medication.status === "active" ? "default" : "secondary"}>
                          {medication.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Appointment History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        {appointment.start ? new Date(appointment.start).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>{appointment.description}</TableCell>
                      <TableCell>{appointment.provider}</TableCell>
                      <TableCell>
                        <Badge variant={appointment.status === "scheduled" ? "default" : "secondary"}>
                          {appointment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.diagnosticReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.code}</TableCell>
                      <TableCell>
                        {report.effectiveDate ? new Date(report.effectiveDate).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={report.status === "final" ? "default" : "secondary"}>{report.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AllergyForm({ onAllergyAdded }: { onAllergyAdded: (data: any) => void }) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({ code: "", status: "active", criticality: "medium" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAllergyAdded(formData)
    setFormData({ code: "", status: "active", criticality: "medium" })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Allergy
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Allergy</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="code">Allergy</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g., Penicillin, Peanuts"
              required
            />
          </div>
          <div>
            <Label htmlFor="criticality">Criticality</Label>
            <Select
              value={formData.criticality}
              onValueChange={(value) => setFormData({ ...formData, criticality: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Allergy</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ConditionForm({ onConditionAdded }: { onConditionAdded: (data: any) => void }) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({ code: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConditionAdded(formData)
    setFormData({ code: "" })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Condition
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Condition</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="code">Medical Condition</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g., Hypertension, Diabetes"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Condition</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

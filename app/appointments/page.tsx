"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppointmentForm } from "@/components/appointment-form"
import { Calendar, Clock, User, MapPin, Trash2, CheckCircle, XCircle } from "lucide-react"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from "date-fns"

interface Appointment {
  id: string
  status?: string
  description?: string
  start?: string
  end?: string
  provider?: string
  patient?: {
    id: string
    name: string
  }
}

const providers = ["All Providers", "Dr. Anderson", "Dr. Smith", "Dr. Johnson", "Dr. Williams", "Dr. Brown"]

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedProvider, setSelectedProvider] = useState("All Providers")
  const [view, setView] = useState<"day" | "week" | "list">("day")

  const fetchAppointments = async () => {
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      const providerParam = selectedProvider === "All Providers" ? "" : selectedProvider
      const response = await fetch(`/api/appointments?date=${dateStr}&provider=${providerParam}`)
      const data = await response.json()
      setAppointments(data)
    } catch (error) {
      console.error("Failed to fetch appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [selectedDate, selectedProvider])

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      await fetch(`/api/appointments/${appointmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      fetchAppointments()
    } catch (error) {
      console.error("Failed to update appointment:", error)
    }
  }

  const handleDelete = async (appointmentId: string) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      try {
        await fetch(`/api/appointments/${appointmentId}`, { method: "DELETE" })
        fetchAppointments()
      } catch (error) {
        console.error("Failed to delete appointment:", error)
      }
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "scheduled":
        return "default"
      case "completed":
        return "secondary"
      case "cancelled":
        return "destructive"
      case "no-show":
        return "outline"
      default:
        return "secondary"
    }
  }

  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedDate),
    end: endOfWeek(selectedDate),
  })

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter((apt) => apt.start && isSameDay(parseISO(apt.start), day))
  }

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0")
    return `${hour}:00`
  })

  if (loading) {
    return <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">Loading...</div>
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Appointment Scheduling</h2>
        <AppointmentForm onAppointmentCreated={fetchAppointments} selectedDate={format(selectedDate, "yyyy-MM-dd")} />
      </div>

      <div className="flex items-center space-x-4">
        <Input
          type="date"
          value={format(selectedDate, "yyyy-MM-dd")}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="w-40"
        />
        <Select value={selectedProvider} onValueChange={setSelectedProvider}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {providers.map((provider) => (
              <SelectItem key={provider} value={provider}>
                {provider}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex space-x-1">
          <Button variant={view === "day" ? "default" : "outline"} size="sm" onClick={() => setView("day")}>
            Day
          </Button>
          <Button variant={view === "week" ? "default" : "outline"} size="sm" onClick={() => setView("week")}>
            Week
          </Button>
          <Button variant={view === "list" ? "default" : "outline"} size="sm" onClick={() => setView("list")}>
            List
          </Button>
        </div>
      </div>

      {view === "day" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {appointments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No appointments scheduled for this day</p>
              ) : (
                appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col items-center">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {appointment.start ? format(parseISO(appointment.start), "HH:mm") : "N/A"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{appointment.patient?.name}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{appointment.provider}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{appointment.description}</p>
                      </div>
                      <Badge variant={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      {appointment.status === "scheduled" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(appointment.id, "completed")}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(appointment.id, "cancelled")}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(appointment.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {view === "week" && (
        <Card>
          <CardHeader>
            <CardTitle>
              Week of {format(startOfWeek(selectedDate), "MMMM d")} - {format(endOfWeek(selectedDate), "MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              {weekDays.map((day) => {
                const dayAppointments = getAppointmentsForDay(day)
                return (
                  <div key={day.toISOString()} className="border rounded-lg p-3">
                    <div className="font-medium text-center mb-2">{format(day, "EEE d")}</div>
                    <div className="space-y-1">
                      {dayAppointments.map((appointment) => (
                        <div key={appointment.id} className="text-xs p-2 bg-primary/10 rounded">
                          <div className="font-medium">
                            {appointment.start ? format(parseISO(appointment.start), "HH:mm") : "N/A"}
                          </div>
                          <div className="truncate">{appointment.patient?.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {view === "list" && (
        <Card>
          <CardHeader>
            <CardTitle>Appointments List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{appointment.start ? format(parseISO(appointment.start), "HH:mm") : "N/A"}</TableCell>
                    <TableCell className="font-medium">{appointment.patient?.name}</TableCell>
                    <TableCell>{appointment.provider}</TableCell>
                    <TableCell>{appointment.description}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {appointment.status === "scheduled" && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStatusUpdate(appointment.id, "completed")}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStatusUpdate(appointment.id, "cancelled")}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(appointment.id)}
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
      )}
    </div>
  )
}

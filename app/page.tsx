"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Activity, FileText } from "lucide-react"
import { format, isSameDay, parseISO, formatDistanceToNow } from "date-fns"

interface Patient {
  id: string
  name: string
  conditions: Array<{ id: string }>
  diagnosticReports: Array<{ id: string }>
}

interface Appointment {
  id: string
  status: string
  description: string
  start: string
  provider: string
  patient: { name: string }
}

interface RecentActivity {
  id: string
  type: string
  patientName: string
  timeAgo: string
  color: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState([
    {
      title: "Total Patients",
      value: "...",
      description: "...",
      icon: Users,
    },
    {
      title: "Appointments Today",
      value: "...",
      description: "...",
      icon: Calendar,
    },
    {
      title: "Active Cases",
      value: "...",
      description: "...",
      icon: Activity,
    },
    {
      title: "Reports Generated",
      value: "...",
      description: "...",
      icon: FileText,
    },
  ])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [patientsResponse, appointmentsResponse, reportsResponse, encountersResponse] = await Promise.all([
          fetch("/api/patients"),
          fetch(`/api/appointments`),
          fetch("/api/diagnostic-reports?patientId=all"),
          fetch("/api/encounters"),
        ])

        const [patientsData, allAppointmentsData, reportsData, encountersData] = await Promise.all([
          patientsResponse.json(),
          appointmentsResponse.json(),
          reportsResponse.json(),
          encountersResponse.json(),
        ])

        const totalPatients = patientsData.length
        let activeCases = 0
        patientsData.forEach((patient: any) => {
          activeCases += patient.conditions.length
        })

        const today = new Date()
        const appointmentsToday = allAppointmentsData.filter((apt: any) =>
          apt.start ? isSameDay(parseISO(apt.start), today) : false,
        )

        setStats([
          {
            title: "Total Patients",
            value: totalPatients.toString(),
            description: "All registered patients",
            icon: Users,
          },
          {
            title: "Appointments Today",
            value: appointmentsToday.length.toString(),
            description: `${appointmentsToday.filter((a: any) => a.status === "scheduled").length} pending confirmations`,
            icon: Calendar,
          },
          {
            title: "Active Cases",
            value: activeCases.toString(),
            description: "Total medical conditions across patients",
            icon: Activity,
          },
          {
            title: "Reports Generated",
            value: reportsData.length.toString(),
            description: "Total diagnostic reports",
            icon: FileText,
          },
        ])

        setAppointments(appointmentsToday)

        const allActivities = [
          ...patientsData.map((p: any) => ({
            id: p.id,
            type: "New patient registered",
            patientName: p.name,
            time: new Date(), // Using current time as a placeholder since createdAt is not in the model
            color: "bg-blue-500",
          })),
          ...encountersData.map((e: any) => ({
            id: e.id,
            type: `Encounter status: ${e.status}`,
            patientName: e.patient?.name,
            time: e.start,
            color: e.status === "finished" ? "bg-green-500" : "bg-orange-500",
          })),
          ...reportsData.map((r: any) => ({
            id: r.id,
            type: "Lab results available",
            patientName: r.patient?.name,
            time: r.issued,
            color: "bg-orange-500",
          })),
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

        setRecentActivity(
          allActivities.slice(0, 5).map((activity) => ({
            ...activity,
            timeAgo: formatDistanceToNow(new Date(activity.time), { addSuffix: true }),
          })),
        )
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest patient interactions and system updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${activity.color}`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.patientName} - {activity.timeAgo}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-muted-foreground">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Upcoming appointments and tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {appointment.start ? format(new Date(appointment.start), "h:mm a") : "N/A"} -{" "}
                        {appointment.patient.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{appointment.description}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">{appointment.provider}</div>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-muted-foreground">No appointments scheduled for today</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
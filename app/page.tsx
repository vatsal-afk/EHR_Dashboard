import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Activity, FileText } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Patients",
      value: "1,234",
      description: "+20.1% from last month",
      icon: Users,
    },
    {
      title: "Appointments Today",
      value: "23",
      description: "4 pending confirmations",
      icon: Calendar,
    },
    {
      title: "Active Cases",
      value: "89",
      description: "+12% from last week",
      icon: Activity,
    },
    {
      title: "Reports Generated",
      value: "156",
      description: "+8% from last month",
      icon: FileText,
    },
  ]

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
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New patient registered</p>
                  <p className="text-xs text-muted-foreground">Sarah Johnson - 2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Appointment completed</p>
                  <p className="text-xs text-muted-foreground">John Smith - 15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Lab results available</p>
                  <p className="text-xs text-muted-foreground">Michael Brown - 1 hour ago</p>
                </div>
              </div>
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">9:00 AM - John Smith</p>
                  <p className="text-xs text-muted-foreground">Annual Checkup</p>
                </div>
                <div className="text-xs text-muted-foreground">Room 101</div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">10:30 AM - Emily Davis</p>
                  <p className="text-xs text-muted-foreground">Follow-up</p>
                </div>
                <div className="text-xs text-muted-foreground">Room 102</div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">2:00 PM - Robert Wilson</p>
                  <p className="text-xs text-muted-foreground">Consultation</p>
                </div>
                <div className="text-xs text-muted-foreground">Room 103</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Activity, FileText, RefreshCw, Search } from "lucide-react"
import { format, isSameDay, parseISO, formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const renderCellContent = (value: any, field: string) => {
  if (value === null || value === undefined) return "N/A"

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {

    if (field.toLowerCase().includes("date") || field.toLowerCase().includes("time")) {
      const d = new Date(value as string | number)
      if (!isNaN(d.getTime())) {
        return format(d, 'MMM dd, yyyy HH:mm')
      }
    }
    return String(value)
  }

  if (typeof value === "object") {
    if (Array.isArray(value)) {
      if (value.length === 0) return "N/A"
      
      if (field === "name") {
        return value.map(name => {
          const given = Array.isArray(name.given) ? name.given.join(" ") : ""
          const family = name.family || ""
          const prefix = Array.isArray(name.prefix) ? name.prefix.join(" ") + " " : ""
          const suffix = Array.isArray(name.suffix) ? " " + name.suffix.join(" ") : ""
          return `${prefix}${given} ${family}${suffix}`.trim()
        }).join(" / ")
      }
      
      if (field === "telecom") {
        return value.map(contact => {
          const system = contact.system ? `${contact.system}: ` : ""
          const val = contact.value || ""
          const use = contact.use ? ` (${contact.use})` : ""
          return `${system}${val}${use}`
        }).join(" | ")
      }
      
      if (field === "address") {
        return value.map(addr => {
          const line = Array.isArray(addr.line) ? addr.line.join(", ") : ""
          const city = addr.city || ""
          const state = addr.state || ""
          const postal = addr.postalCode || ""
          const country = addr.country || ""
          const parts = [line, city, state, postal, country].filter(Boolean)
          return parts.join(", ")
        }).join(" | ")
      }
      
      if (field === "qualification") {
        return value.map(qual => {
          if (qual.code?.text) return qual.code.text
          if (qual.code?.coding?.[0]?.display) return qual.code.coding[0].display
          return "Qualification"
        }).join(", ")
      }
      
      if (field === "participant") {
        return value.map(p => {
          if (p.actor?.display) return p.actor.display
          if (p.type?.[0]?.text) return p.type[0].text
          return "Participant"
        }).join(", ")
      }
      
      return value.map(item => {
        if (item.display) return item.display
        if (item.text) return item.text
        if (item.code) return item.code
        if (item.start && item.end) return `${format(new Date(item.start), 'MMM dd, yyyy')} - ${format(new Date(item.end), 'MMM dd, yyyy')}`
        return typeof item === 'string' ? item : 'Item'
      }).join(", ")
    }
    
    if (value.family || value.given) {
      const given = Array.isArray(value.given) ? value.given.join(" ") : ""
      const family = value.family || ""
      const prefix = Array.isArray(value.prefix) ? value.prefix.join(" ") + " " : ""
      const suffix = Array.isArray(value.suffix) ? " " + value.suffix.join(" ") : ""
      return `${prefix}${given} ${family}${suffix}`.trim()
    }
    
    if (value.coding || value.text) {
      if (value.text) return value.text
      if (value.coding && value.coding[0]) {
        const firstCoding = value.coding[0]
        return firstCoding.display || firstCoding.code || "N/A"
      }
      return "N/A"
    }
    
    if (value.value !== undefined) {
      const unit = value.unit || value.code || ""
      return `${value.value} ${unit}`.trim()
    }
    
    if (value.reference) {
      return value.display || value.reference
    }
    
    if (value.start || value.end) {
      const start = value.start ? format(new Date(value.start), 'MMM dd, yyyy HH:mm') : "?"
      const end = value.end ? format(new Date(value.end), 'MMM dd, yyyy HH:mm') : "ongoing"
      return `${start} - ${end}`
    }
    
    if (value.system && value.value) {
      const use = value.use ? ` (${value.use})` : ""
      return `${value.system}: ${value.value}${use}`
    }
    
    if (value.line || value.city || value.state) {
      const line = Array.isArray(value.line) ? value.line.join(", ") : ""
      const city = value.city || ""
      const state = value.state || ""
      const postal = value.postalCode || ""
      const country = value.country || ""
      const parts = [line, city, state, postal, country].filter(Boolean)
      return parts.join(", ")
    }
    
    if (value.system || value.code) {
      return value.display || value.code || "N/A"
    }
    
    if (value.display) return value.display
    if (value.text) return value.text
    if (value.value) return String(value.value)
    
    const keys = Object.keys(value)
    if (keys.length === 1) {
      return String(value[keys[0]])
    }
    
    return "Complex Object"
  }

  return String(value)
}

const API_ENDPOINTS = {
  patients: "https://hapi.fhir.org/baseR4/Patient",
  observations: "https://hapi.fhir.org/baseR4/Observation", 
  allergies: "https://hapi.fhir.org/baseR4/AllergyIntolerance",
  appointments: "https://hapi.fhir.org/baseR4/Appointment",
  conditions: "https://hapi.fhir.org/baseR4/Condition",
  encounters: "https://hapi.fhir.org/baseR4/Encounter",
  immunizations: "https://hapi.fhir.org/baseR4/Immunization",
  medications: "https://hapi.fhir.org/baseR4/MedicationRequest",
  practitioners: "https://hapi.fhir.org/baseR4/Practitioner",
  procedures: "https://hapi.fhir.org/baseR4/Procedure"
}

const FIELD_CONFIGS = {
  patients: ["id", "name", "gender", "birthDate", "telecom", "address"],
  observations: ["id", "status", "code", "subject", "valueQuantity", "effectiveDateTime"],
  allergies: ["id", "patient", "code", "clinicalStatus", "verificationStatus", "recordedDate"],
  appointments: ["id", "status", "serviceType", "start", "end", "participant"],
  conditions: ["id", "patient", "code", "clinicalStatus", "verificationStatus", "recordedDate"],
  encounters: ["id", "status", "class", "type", "subject", "period"],
  immunizations: ["id", "status", "vaccineCode", "patient", "occurrenceDateTime"],
  medications: ["id", "status", "medicationCodeableConcept", "subject", "authoredOn"],
  practitioners: ["id", "name", "telecom", "address", "gender", "qualification"],
  procedures: ["id", "status", "code", "subject", "performedDateTime"]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any[]>([])
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("patients")
  const [searchQuery, setSearchQuery] = useState("")
  const [tableData, setTableData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const fetchStats = async () => {
    try {
      const statsPromises = Object.entries(API_ENDPOINTS).map(async ([key, url]) => {
        const response = await fetch(`${url}?_count=1`)
        const data = await response.json()
        return {
          endpoint: key,
          total: data.total || 0
        }
      })
      
      const statsResults = await Promise.all(statsPromises)
      
      const statsCards = [
        {
          title: "Total Patients",
          value: statsResults.find(s => s.endpoint === 'patients')?.total?.toString() || "0",
          description: "All registered patients",
          icon: Users,
        },
        {
          title: "Active Appointments", 
          value: statsResults.find(s => s.endpoint === 'appointments')?.total?.toString() || "0",
          description: "Total appointments",
          icon: Calendar,
        },
        {
          title: "Clinical Observations",
          value: statsResults.find(s => s.endpoint === 'observations')?.total?.toString() || "0",
          description: "Recorded observations",
          icon: Activity,
        },
        {
          title: "Medical Procedures",
          value: statsResults.find(s => s.endpoint === 'procedures')?.total?.toString() || "0",
          description: "Total procedures",
          icon: FileText,
        },
      ]
      
      setStats(statsCards)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const fetchTableData = async () => {
    setLoading(true)
    try {
      let url = API_ENDPOINTS[selectedEndpoint as keyof typeof API_ENDPOINTS]
      
      if (selectedEndpoint === 'patients' && searchQuery.trim()) {
        url += `?name=${encodeURIComponent(searchQuery.trim())}&_count=20`
      } else {
        url += "?_count=20"
      }

      const response = await fetch(url)
      const data = await response.json()
      
      if (data.entry && Array.isArray(data.entry)) {
        setTableData(data.entry.map((entry: any) => entry.resource))
      } else {
        setTableData([])
      }
    } catch (error) {
      console.error(`Error fetching ${selectedEndpoint}:`, error)
      setTableData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [refreshTrigger])

  useEffect(() => {
    fetchTableData()
  }, [selectedEndpoint, searchQuery, refreshTrigger])

  const handleSearch = () => {
    fetchTableData()
  }

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const currentFields = FIELD_CONFIGS[selectedEndpoint as keyof typeof FIELD_CONFIGS] || []

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">FHIR Dashboard</h2>
        <Button onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats cards */}
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

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Data Explorer</CardTitle>
          <CardDescription>Browse and search FHIR resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select resource type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patients">Patients</SelectItem>
                <SelectItem value="observations">Observations</SelectItem>
                <SelectItem value="allergies">Allergies</SelectItem>
                <SelectItem value="appointments">Appointments</SelectItem>
                <SelectItem value="conditions">Conditions</SelectItem>
                <SelectItem value="encounters">Encounters</SelectItem>
                <SelectItem value="immunizations">Immunizations</SelectItem>
                <SelectItem value="medications">Medications</SelectItem>
                <SelectItem value="practitioners">Practitioners</SelectItem>
                <SelectItem value="procedures">Procedures</SelectItem>
              </SelectContent>
            </Select>
            
            {selectedEndpoint === 'patients' && (
              <div className="flex gap-2 flex-1">
                <Input
                  placeholder="Search patients by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="capitalize">{selectedEndpoint}</CardTitle>
          <CardDescription>
            {loading ? "Loading..." : `Showing ${tableData.length} ${selectedEndpoint}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Loading {selectedEndpoint}...</span>
            </div>
          ) : tableData.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {currentFields.map((field) => (
                      <TableHead key={field} className="capitalize">
                        {field.replace(/([A-Z])/g, ' $1').trim()}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((item, idx) => (
                    <TableRow key={item.id || idx}>
                      {currentFields.map((field) => (
                        <TableCell key={field} className="max-w-sm text-sm">
                          <div className="truncate" title={renderCellContent(item[field], field)}>
                            {renderCellContent(item[field], field)}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No {selectedEndpoint} found.</p>
              {selectedEndpoint === 'patients' && searchQuery && (
                <p className="text-sm mt-2">Try a different search term or clear the search.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
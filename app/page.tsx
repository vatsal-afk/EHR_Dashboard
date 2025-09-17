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
  patients: `${process.env.NEXT_PUBLIC_FHIR_BASE_URL}/Patient`,
  observations: `${process.env.NEXT_PUBLIC_FHIR_BASE_URL}/Observation`, 
  allergies: `${process.env.NEXT_PUBLIC_FHIR_BASE_URL}/AllergyIntolerance`,
  appointments: `${process.env.NEXT_PUBLIC_FHIR_BASE_URL}/Appointment`,
  conditions: `${process.env.NEXT_PUBLIC_FHIR_BASE_URL}/Condition`,
  encounters: `${process.env.NEXT_PUBLIC_FHIR_BASE_URL}/Encounter`,
  immunizations: `${process.env.NEXT_PUBLIC_FHIR_BASE_URL}/Immunization`,
  medications: `${process.env.NEXT_PUBLIC_FHIR_BASE_URL}/MedicationRequest`,
  practitioners: `${process.env.NEXT_PUBLIC_FHIR_BASE_URL}/Practitioner`,
  procedures: `${process.env.NEXT_PUBLIC_FHIR_BASE_URL}/Procedure`
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Healthcare Dashboard</h1>
              <p className="mt-2 text-blue-100 text-lg">Comprehensive FHIR Data Management System</p>
            </div>
            <Button 
              onClick={handleRefresh}
              className="bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm transition-all duration-200"
              size="lg"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Refresh Data
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const gradients = [
              "from-emerald-500 to-teal-600",
              "from-blue-500 to-cyan-600", 
              "from-purple-500 to-pink-600",
              "from-orange-500 to-red-600"
            ]
            return (
              <Card key={stat.title} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index]} opacity-10`}></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${gradients[index]}`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-t-lg border-b">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Search className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Resource Explorer</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">
                  Browse and search healthcare resources across the FHIR ecosystem
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
                <SelectTrigger className="w-full sm:w-[220px] border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm hover:border-blue-300 transition-colors">
                  <SelectValue placeholder="Select resource type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-0 shadow-xl">
                  <SelectItem value="patients" className="rounded-lg">👥 Patients</SelectItem>
                  <SelectItem value="observations" className="rounded-lg">📊 Observations</SelectItem>
                  <SelectItem value="allergies" className="rounded-lg">⚠️ Allergies</SelectItem>
                  <SelectItem value="appointments" className="rounded-lg">📅 Appointments</SelectItem>
                  <SelectItem value="conditions" className="rounded-lg">🏥 Conditions</SelectItem>
                  <SelectItem value="encounters" className="rounded-lg">👨‍⚕️ Encounters</SelectItem>
                  <SelectItem value="immunizations" className="rounded-lg">💉 Immunizations</SelectItem>
                  <SelectItem value="medications" className="rounded-lg">💊 Medications</SelectItem>
                  <SelectItem value="practitioners" className="rounded-lg">👨‍⚕️ Practitioners</SelectItem>
                  <SelectItem value="procedures" className="rounded-lg">🔬 Procedures</SelectItem>
                </SelectContent>
              </Select>
              
              {selectedEndpoint === 'patients' && (
                <div className="flex gap-3 flex-1">
                  <Input
                    placeholder="Search patients by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm hover:border-blue-300 focus:border-blue-500 transition-colors"
                  />
                  <Button 
                    onClick={handleSearch} 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl shadow-sm px-6"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-t-lg border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold capitalize">{selectedEndpoint} Records</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    {loading ? "Loading healthcare data..." : `Displaying ${tableData.length} ${selectedEndpoint} records`}
                  </CardDescription>
                </div>
              </div>
              {!loading && tableData.length > 0 && (
                <div className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
                  {tableData.length} records found
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-blue-200 dark:border-blue-800"></div>
                  <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                </div>
                <span className="mt-4 text-slate-600 dark:text-slate-300 font-medium">Loading {selectedEndpoint}...</span>
                <span className="text-sm text-slate-400 mt-1">Fetching data from FHIR server</span>
              </div>
            ) : tableData.length > 0 ? (
              <div className="overflow-hidden rounded-b-lg">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-700/50 border-b-2">
                        {currentFields.map((field, index) => (
                          <TableHead key={field} className={`font-semibold text-slate-700 dark:text-slate-200 py-4 ${index === 0 ? 'pl-6' : ''}`}>
                            {field.replace(/([A-Z])/g, ' $1').trim()}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableData.map((item, idx) => (
                        <TableRow 
                          key={item.id || idx} 
                          className="hover:bg-blue-50/50 dark:hover:bg-slate-700/30 transition-colors duration-150 border-b border-slate-100 dark:border-slate-700"
                        >
                          {currentFields.map((field, fieldIndex) => (
                            <TableCell key={field} className={`py-4 text-sm ${fieldIndex === 0 ? 'pl-6 font-medium' : ''}`}>
                              <div 
                                className="truncate max-w-xs text-slate-700 dark:text-slate-200" 
                                title={renderCellContent(item[field], field)}
                              >
                                {renderCellContent(item[field], field)}
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-2xl flex items-center justify-center">
                  <FileText className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  No {selectedEndpoint} found
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  {selectedEndpoint === 'patients' && searchQuery 
                    ? "Try adjusting your search criteria or clear the search field." 
                    : `No ${selectedEndpoint} records are currently available.`
                  }
                </p>
                {selectedEndpoint === 'patients' && searchQuery && (
                  <Button 
                    onClick={() => setSearchQuery("")} 
                    variant="outline" 
                    className="rounded-xl"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
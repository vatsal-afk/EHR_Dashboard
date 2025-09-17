"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserCheck, Plus, Stethoscope } from "lucide-react"

interface Practitioner {
  id: string
  name?: string
  identifiers?: string
}

export default function PractitionersPage() {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPractitioners = async () => {
    try {
      const response = await fetch("/api/practitioners")
      const data = await response.json()
      setPractitioners(data)
    } catch (error) {
      console.error("Failed to fetch practitioners:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPractitioners()
  }, [])

  const getInitials = (name?: string) => {
    if (!name) return "DR"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (loading) {
    return <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">Loading...</div>
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Healthcare Practitioners</h2>
        <PractitionerForm onPractitionerCreated={fetchPractitioners} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Practitioners</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{practitioners.length}</div>
            <p className="text-xs text-muted-foreground">Active healthcare providers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doctors</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{practitioners.filter((p) => p.name?.includes("Dr.")).length}</div>
            <p className="text-xs text-muted-foreground">Licensed physicians</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Specialists</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(practitioners.length * 0.6)}</div>
            <p className="text-xs text-muted-foreground">Specialized care providers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5" />
            <span>Practitioner Directory</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Practitioner</TableHead>
                <TableHead>License ID</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {practitioners.map((practitioner) => (
                <TableRow key={practitioner.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={`/ceholder-svg-key-prac.jpg?key=prac&height=40&width=40`} />
                        <AvatarFallback>{getInitials(practitioner.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{practitioner.name}</div>
                        <div className="text-sm text-muted-foreground">{practitioner.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{practitioner.identifiers}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function PractitionerForm({ onPractitionerCreated }: { onPractitionerCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    identifiers: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/practitioners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ name: "", identifiers: "" })
        setOpen(false)
        onPractitionerCreated()
      }
    } catch (error) {
      console.error("Failed to create practitioner:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Practitioner
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Practitioner</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Dr. John Smith"
              required
            />
          </div>
          <div>
            <Label htmlFor="identifiers">License ID</Label>
            <Input
              id="identifiers"
              value={formData.identifiers}
              onChange={(e) => setFormData({ ...formData, identifiers: e.target.value })}
              placeholder="MD-001"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Practitioner"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

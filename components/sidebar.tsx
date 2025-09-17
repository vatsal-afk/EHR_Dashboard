"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Users,
  Calendar,
  FileText,
  Activity,
  Pill,
  TestTube,
  Stethoscope,
  UserCheck,
  ClipboardList,
  CreditCard,
  Menu,
  Home,
  AlertTriangle,
  Heart,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: "Patients",
    href: "/patients",
    icon: Users,
  },
  {
    name: "Appointments",
    href: "/appointments",
    icon: Calendar,
  },
  {
    name: "Clinical",
    icon: Stethoscope,
    children: [
      { name: "Observations", href: "/observations", icon: Activity },
      { name: "Conditions", href: "/conditions", icon: Heart },
      { name: "Allergies", href: "/allergies", icon: AlertTriangle },
      { name: "Medications", href: "/medications", icon: Pill },
      { name: "Procedures", href: "/procedures", icon: ClipboardList },
    ],
  },
  {
    name: "Reports & Tests",
    icon: TestTube,
    children: [
      { name: "Diagnostic Reports", href: "/diagnostic-reports", icon: FileText },
      { name: "Immunizations", href: "/immunizations", icon: UserCheck },
    ],
  },
  {
    name: "Encounters",
    href: "/encounters",
    icon: FileText,
  },
  {
    name: "Practitioners",
    href: "/practitioners",
    icon: UserCheck,
  },
  {
    name: "Billing",
    href: "/billing",
    icon: CreditCard,
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<string[]>(["Clinical", "Reports & Tests"])

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) =>
      prev.includes(groupName) ? prev.filter((name) => name !== groupName) : [...prev, groupName],
    )
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">EHR Dashboard</h2>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 py-4">
          {navigation.map((item) => {
            if (item.children) {
              const isOpen = openGroups.includes(item.name)
              return (
                <div key={item.name}>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => toggleGroup(item.name)}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                  {isOpen && (
                    <div className="ml-6 space-y-1">
                      {item.children.map((child) => (
                        <Link key={child.href} href={child.href}>
                          <Button
                            variant={pathname === child.href ? "secondary" : "ghost"}
                            className="w-full justify-start text-sm"
                          >
                            <child.icon className="mr-2 h-3 w-3" />
                            {child.name}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link key={item.href} href={item.href}>
                <Button variant={pathname === item.href ? "secondary" : "ghost"} className="w-full justify-start">
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn("hidden border-r bg-muted/40 md:block", className)}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden bg-transparent">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}

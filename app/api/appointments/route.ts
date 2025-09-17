import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const provider = searchParams.get("provider")

    const appointments = await prisma.appointment.findMany({
      where: {
        ...(date && {
          start: {
            gte: `${date}T00:00:00Z`,
            lt: `${date}T23:59:59Z`,
          },
        }),
        ...(provider && { provider }),
      },
      include: {
        patient: true,
      },
      orderBy: { start: "asc" },
    })

    return NextResponse.json(appointments)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { patientId, provider, description, start, end } = body

    const appointment = await prisma.appointment.create({
      data: {
        id: `appt-${Date.now()}`,
        patientId,
        provider,
        description,
        start,
        end,
        status: "scheduled",
      },
      include: {
        patient: true,
      },
    })

    return NextResponse.json(appointment)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 })
  }
}

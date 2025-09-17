import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    const patients = await prisma.patient.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { id: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      include: {
        allergies: true,
        conditions: true,
        medications: true,
        appointments: true,
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(patients)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, gender, birthDate } = body

    const patient = await prisma.patient.create({
      data: {
        id: `patient-${Date.now()}`,
        name,
        gender,
        birthDate,
      },
      include: {
        allergies: true,
        conditions: true,
        medications: true,
        appointments: true,
      },
    })

    return NextResponse.json(patient)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 })
  }
}

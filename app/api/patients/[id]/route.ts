import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        allergies: true,
        conditions: true,
        medications: true,
        appointments: true,
        observations: true,
        diagnosticReports: true,
        procedures: true,
        immunizations: true,
        encounters: true,
      },
    })

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    return NextResponse.json(patient)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch patient" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, gender, birthDate } = body

    const patient = await prisma.patient.update({
      where: { id: params.id },
      data: { name, gender, birthDate },
      include: {
        allergies: true,
        conditions: true,
        medications: true,
        appointments: true,
      },
    })

    return NextResponse.json(patient)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update patient" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.patient.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Patient deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete patient" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")

    const medications = await prisma.medication.findMany({
      where: patientId ? { patientId } : {},
      include: {
        patient: true,
      },
      orderBy: { code: "asc" },
    })

    return NextResponse.json(medications)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch medications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { patientId, code, status } = body

    const medication = await prisma.medication.create({
      data: {
        id: `med-${Date.now()}`,
        patientId,
        code,
        status: status || "active",
      },
      include: {
        patient: true,
      },
    })

    return NextResponse.json(medication)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create medication" }, { status: 500 })
  }
}

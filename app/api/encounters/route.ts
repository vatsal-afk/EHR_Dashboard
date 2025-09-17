import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")

    const encounters = await prisma.encounter.findMany({
      where: patientId ? { patientId } : {},
      include: {
        patient: true,
      },
      orderBy: { start: "desc" },
    })

    return NextResponse.json(encounters)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch encounters" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { patientId, status, class: encounterClass, subject, start, end } = body

    const encounter = await prisma.encounter.create({
      data: {
        id: `enc-${Date.now()}`,
        patientId,
        status,
        class: encounterClass,
        subject,
        start,
        end,
      },
      include: {
        patient: true,
      },
    })

    return NextResponse.json(encounter)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create encounter" }, { status: 500 })
  }
}

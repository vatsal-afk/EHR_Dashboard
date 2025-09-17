import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")

    const observations = await prisma.observation.findMany({
      where: patientId ? { patientId } : {},
      include: {
        patient: true,
      },
      orderBy: { date: "desc" },
    })

    return NextResponse.json(observations)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch observations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { patientId, code, value, date, status } = body

    const observation = await prisma.observation.create({
      data: {
        id: `obs-${Date.now()}`,
        patientId,
        code,
        value,
        date,
        status: status || "final",
      },
      include: {
        patient: true,
      },
    })

    return NextResponse.json(observation)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create observation" }, { status: 500 })
  }
}

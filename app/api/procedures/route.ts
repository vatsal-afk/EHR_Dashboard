import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")

    const procedures = await prisma.procedure.findMany({
      where: patientId ? { patientId } : {},
      include: {
        patient: true,
      },
      orderBy: { performed: "desc" },
    })

    return NextResponse.json(procedures)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch procedures" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { patientId, code, status, performed } = body

    const procedure = await prisma.procedure.create({
      data: {
        id: `proc-${Date.now()}`,
        patientId,
        code,
        status: status || "completed",
        performed,
      },
      include: {
        patient: true,
      },
    })

    return NextResponse.json(procedure)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create procedure" }, { status: 500 })
  }
}

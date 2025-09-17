import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, status, criticality, patientId } = body

    const allergy = await prisma.allergy.create({
      data: {
        id: `allergy-${Date.now()}`,
        code,
        status,
        criticality,
        patientId,
      },
    })

    return NextResponse.json(allergy)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create allergy" }, { status: 500 })
  }
}

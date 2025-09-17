import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, patientId } = body

    const condition = await prisma.condition.create({
      data: {
        id: `condition-${Date.now()}`,
        code,
        patientId,
      },
    })

    return NextResponse.json(condition)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create condition" }, { status: 500 })
  }
}

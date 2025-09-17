import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const practitioners = await prisma.practitioner.findMany({
      orderBy: { name: "asc" },
    })

    return NextResponse.json(practitioners)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch practitioners" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, identifiers } = body

    const practitioner = await prisma.practitioner.create({
      data: {
        id: `prac-${Date.now()}`,
        name,
        identifiers,
      },
    })

    return NextResponse.json(practitioner)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create practitioner" }, { status: 500 })
  }
}

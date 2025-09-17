import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status, description, start, end, provider } = body

    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: { status, description, start, end, provider },
      include: {
        patient: true,
      },
    })

    return NextResponse.json(appointment)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.appointment.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Appointment deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete appointment" }, { status: 500 })
  }
}

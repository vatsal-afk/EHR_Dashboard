import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/apiClient";
import { normalizeAppointment } from "@/lib/normalizers";
import prisma from "@/lib/prisma";

const RESOURCE = "Appointment";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patient");

  try {
    const localAppointments = patientId
      ? await prisma.appointment.findMany({ where: { patientId } })
      : await prisma.appointment.findMany();
    if (localAppointments.length > 0) {
      return NextResponse.json(localAppointments);
    }
    const data = await apiClient(
      RESOURCE,
      patientId ? `?patient=${patientId}` : `?_count=10`
    );
    const items = Array.isArray(data.entry)
      ? data.entry.map((e: any) => normalizeAppointment(e.resource))
      : [];
    return NextResponse.json(items);
  } catch (err: any) {
    const message = err?.message || "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newAppointment = await prisma.appointment.create({ data: body });
    return NextResponse.json(newAppointment, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 });
  }
  try {
    const body = await req.json();
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(updatedAppointment);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 });
  }
  try {
    await prisma.appointment.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/apiClient";
import { normalizeObservation } from "@/lib/normalizers";
import prisma from "@/lib/prisma";

const RESOURCE = "Observation";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patient");
  const search = searchParams.get("search");

  try {
    const localObservations = patientId
      ? await prisma.observation.findMany({ where: { patientId } })
      : await prisma.observation.findMany();
    if (localObservations.length > 0) {
      return NextResponse.json(localObservations);
    }
    const data = await apiClient(
      RESOURCE,
      patientId ? `?patient=${patientId}` : (search ? `?_count=10&code=${search}` : `?_count=10`)
    );
    const items = Array.isArray(data.entry)
      ? data.entry.map((e: any) => normalizeObservation(e.resource))
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
    const newObservation = await prisma.observation.create({ data: body });
    return NextResponse.json(newObservation, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Observation ID is required" }, { status: 400 });
  }
  try {
    const body = await req.json();
    const updatedObservation = await prisma.observation.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(updatedObservation);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Observation ID is required" }, { status: 400 });
  }
  try {
    await prisma.observation.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
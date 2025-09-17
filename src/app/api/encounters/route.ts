import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/apiClient";
import { normalizeEncounter } from "@/lib/normalizers";
import prisma from "@/lib/prisma";

const RESOURCE = "Encounter";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patient");

  try {
    const localEncounters = patientId
      ? await prisma.encounter.findMany({ where: { patientId } })
      : await prisma.encounter.findMany();
    if (localEncounters.length > 0) {
      return NextResponse.json(localEncounters);
    }
    const data = await apiClient(
      RESOURCE,
      patientId ? `?subject=${patientId}` : `?_count=10`
    );
    const items = Array.isArray(data.entry)
      ? data.entry.map((e: any) => normalizeEncounter(e.resource))
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
    const newEncounter = await prisma.encounter.create({ data: body });
    return NextResponse.json(newEncounter, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Encounter ID is required" }, { status: 400 });
  }
  try {
    const body = await req.json();
    const updatedEncounter = await prisma.encounter.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(updatedEncounter);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Encounter ID is required" }, { status: 400 });
  }
  try {
    await prisma.encounter.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
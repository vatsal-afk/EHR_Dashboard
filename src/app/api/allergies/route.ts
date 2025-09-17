import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/apiClient";
import { normalizeAllergy } from "@/lib/normalizers";
import prisma from "@/lib/prisma";

const RESOURCE = "AllergyIntolerance";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patient");

  try {
    if (patientId) {
      const localAllergies = await prisma.allergy.findMany({
        where: { patientId },
      });
      if (localAllergies.length > 0) {
        return NextResponse.json(localAllergies);
      }
      const data = await apiClient(RESOURCE, `?patient=${patientId}`);
      const items = Array.isArray(data.entry)
        ? data.entry.map((e: any) => normalizeAllergy(e.resource))
        : [];
      return NextResponse.json(items);
    }

    const data = await apiClient(RESOURCE, "?_count=10");
    const items = Array.isArray(data.entry)
      ? data.entry.map((e: any) => normalizeAllergy(e.resource))
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
    const newAllergy = await prisma.allergy.create({ data: body });
    return NextResponse.json(newAllergy, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Allergy ID is required" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const updatedAllergy = await prisma.allergy.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(updatedAllergy);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Allergy ID is required" }, { status: 400 });
  }

  try {
    await prisma.allergy.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
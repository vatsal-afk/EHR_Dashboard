import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/apiClient";
import { normalizeCondition } from "@/lib/normalizers";
import prisma from "@/lib/prisma";

const RESOURCE = "Condition";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patient");

  try {
    const localConditions = patientId
      ? await prisma.condition.findMany({ where: { patientId } })
      : await prisma.condition.findMany();
    if (localConditions.length > 0) {
      return NextResponse.json(localConditions);
    }
    const data = await apiClient(
      RESOURCE,
      patientId ? `?subject=${patientId}` : `?_count=10`
    );
    const items = Array.isArray(data.entry)
      ? data.entry.map((e: any) => normalizeCondition(e.resource))
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
    const newCondition = await prisma.condition.create({ data: body });
    return NextResponse.json(newCondition, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Condition ID is required" }, { status: 400 });
  }
  try {
    const body = await req.json();
    const updatedCondition = await prisma.condition.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(updatedCondition);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Condition ID is required" }, { status: 400 });
  }
  try {
    await prisma.condition.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
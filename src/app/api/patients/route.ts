import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/apiClient";
import { normalizePatient } from "@/lib/normalizers";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") || "";

  try {
    const localPatients = await prisma.patient.findMany({
      where: { name: { contains: name } },
    });
    
    if (localPatients.length > 0) {
      return NextResponse.json(localPatients);
    }
    
    const data = await apiClient("Patient", name ? `?name=${name}` : "");
    const patients = Array.isArray(data.entry)
      ? data.entry.map((e: any) => normalizePatient(e.resource))
      : [];

    return NextResponse.json(patients);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newPatient = await prisma.patient.create({
      data: {
        id: body.id,
        name: body.name,
        gender: body.gender,
        birthDate: body.birthDate,
      },
    });
    return NextResponse.json(newPatient, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: {
        name: body.name,
        gender: body.gender,
        birthDate: body.birthDate,
      },
    });
    return NextResponse.json(updatedPatient);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
  }

  try {
    await prisma.patient.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/apiClient";
import { normalizeDiagnosticReport } from "@/lib/normalizers";
import prisma from "@/lib/prisma";

const RESOURCE = "DiagnosticReport";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patient");
  const search = searchParams.get("search");

  try {
    const localReports = patientId
      ? await prisma.diagnosticReport.findMany({ where: { patientId } })
      : await prisma.diagnosticReport.findMany();
    if (localReports.length > 0) {
      return NextResponse.json(localReports);
    }
    const data = await apiClient(
      RESOURCE,
      patientId ? `?patient=${patientId}` : (search ? `?_count=10&code=${search}` : `?_count=10`)
    );
    const items = Array.isArray(data.entry)
      ? data.entry.map((e: any) => normalizeDiagnosticReport(e.resource))
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
    const newReport = await prisma.diagnosticReport.create({ data: body });
    return NextResponse.json(newReport, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Diagnostic Report ID is required" }, { status: 400 });
  }
  try {
    const body = await req.json();
    const updatedReport = await prisma.diagnosticReport.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(updatedReport);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Diagnostic Report ID is required" }, { status: 400 });
  }
  try {
    await prisma.diagnosticReport.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
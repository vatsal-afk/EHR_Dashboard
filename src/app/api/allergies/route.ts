import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/apiClient";

async function getPatientId(name?: string) {
  if (!name) return "";
  const data: any = await apiClient("Patient", `?name=${encodeURIComponent(name)}`);
  return data.entry?.[0]?.resource?.id || "";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  try {
    const search = searchParams.get("search")?.trim();
    const patientId = await getPatientId(search);

    let query = "";
    if (patientId) {
      query = `?patient=Patient/${patientId}&_count=10`;
    }

    const data = await apiClient("AllergyIntolerance", query);

    const items = Array.isArray(data.entry)
      ? data.entry.map((e: any) => e.resource)
      : [];

    return NextResponse.json(items);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}

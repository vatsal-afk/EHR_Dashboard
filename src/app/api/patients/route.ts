import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/apiClient";
import { normalizePatient } from "@/lib/normalizers";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") || "";

  try {
    const data = await apiClient("Patient", name ? `?name=${name}` : "");
    const patients = Array.isArray(data.entry)
      ? data.entry.map((e: any) => normalizePatient(e.resource))
      : [];

    return NextResponse.json(patients);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

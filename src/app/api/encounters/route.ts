import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/apiClient";

const RESOURCE = "Encounter";

export async function GET(req: NextRequest) {
  const { search, searchParams } = new URL(req.url);

  try {
    const data = searchParams.toString()
      ? await apiClient(RESOURCE, search)
      : await apiClient(RESOURCE, "?_count=10");

    const items = Array.isArray(data.entry)
      ? data.entry.map((e: any) => e.resource)
      : [];

    return NextResponse.json(items);
  } catch (err: any) {
    const message = err?.message || "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

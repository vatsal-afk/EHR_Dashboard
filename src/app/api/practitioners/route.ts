import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/apiClient';

export async function GET(req: NextRequest) {
  const { search } = new URL(req.url);
  try {
    const data = await apiClient('Practitioner', search);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

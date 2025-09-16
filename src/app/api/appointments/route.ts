import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/apiClient';

const RESOURCE = 'Appointment';

export async function GET(req: NextRequest) {
  const { search, searchParams } = new URL(req.url);

  try {
    let data;

    if(searchParams.toString()) {
      data = await apiClient(RESOURCE, search);
    } 
    else {
      data = await apiClient(RESOURCE, '?_count=10');
    }

    return NextResponse.json(data);
  } 
  catch (err: any) {
    const message = err?.message || 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

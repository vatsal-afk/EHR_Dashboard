import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiClient } from '@/lib/apiClient';
import { normalizePatient } from '@/lib/normalizers';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const localPatient = await prisma.patient.findUnique({ where: { id } });
    if (localPatient) {
      return NextResponse.json(localPatient);
    }
    const fhirData = await apiClient(`Patient/${id}`);
    const normalizedData = normalizePatient(fhirData);
    return NextResponse.json(normalizedData);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
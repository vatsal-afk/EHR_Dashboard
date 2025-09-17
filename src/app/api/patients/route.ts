import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/apiClient";
import { normalizePatient } from "@/lib/normalizers";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") || "";

  try {
    // First try to get data from FHIR API
    let fhirData: any[] = [];
    try {
      console.log('Attempting to fetch patients from FHIR API...');
      const data = await apiClient("Patient", name ? `?name=${name}` : "");
      
      fhirData = Array.isArray(data.entry)
        ? data.entry.map((e: any) => normalizePatient(e.resource))
        : [];
      
      console.log(`FHIR API returned ${fhirData.length} patients`);
    } catch (fhirError: any) {
      console.log('FHIR API failed:', fhirError.message);
      // FHIR API failed, will fall back to local DB
    }

    // Get local data from database
    const localPatients = await prisma.patient.findMany({
      where: name ? { name: { contains: name } } : {},
    });

    console.log(`Local DB has ${localPatients.length} patients`);

    // Combine and deduplicate data (FHIR data takes precedence)
    const combinedData = [...fhirData];
    
    // Add local patients that aren't already in FHIR data
    localPatients.forEach(localPatient => {
      if (!combinedData.find(item => item.id === localPatient.id)) {
        combinedData.push(localPatient);
      }
    });

    console.log(`Returning ${combinedData.length} total patients`);
    return NextResponse.json(combinedData);

  } catch (err: any) {
    console.error('GET /api/patients error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('POST /api/patients - Request body:', body);

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: "Patient name is required" }, 
        { status: 400 }
      );
    }

    // Generate ID if not provided
    const patientData = {
      id: body.id || `patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: body.name,
      gender: body.gender || '',
      birthDate: body.birthDate || '',
    };

    console.log('Creating patient with data:', patientData);

    // Always store in local database for CRUD operations
    const newPatient = await prisma.patient.create({
      data: patientData,
    });

    console.log('Created patient:', newPatient);
    return NextResponse.json(newPatient, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/patients error:', err);
    
    // Handle Prisma-specific errors
    if (err.code === 'P2002') {
      return NextResponse.json(
        { error: "A patient with this ID already exists" }, 
        { status: 400 }
      );
    }
    
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
    console.log('PUT /api/patients - ID:', id, 'Body:', body);

    // Check if patient exists in local database
    const existingPatient = await prisma.patient.findUnique({
      where: { id }
    });

    if (!existingPatient) {
      return NextResponse.json(
        { error: "Patient not found in local database. Cannot update FHIR-sourced patients." }, 
        { status: 404 }
      );
    }

    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: {
        name: body.name,
        gender: body.gender,
        birthDate: body.birthDate,
      },
    });

    console.log('Updated patient:', updatedPatient);
    return NextResponse.json(updatedPatient);
  } catch (err: any) {
    console.error('PUT /api/patients error:', err);
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
    console.log('DELETE /api/patients - ID:', id);

    // Check if patient exists in local database
    const existingPatient = await prisma.patient.findUnique({
      where: { id }
    });

    if (!existingPatient) {
      return NextResponse.json(
        { error: "Patient not found in local database. Cannot delete FHIR-sourced patients." }, 
        { status: 404 }
      );
    }

    // Also delete related records
    await prisma.$transaction([
      prisma.allergy.deleteMany({ where: { patientId: id } }),
      prisma.condition.deleteMany({ where: { patientId: id } }),
      prisma.observation.deleteMany({ where: { patientId: id } }),
      prisma.appointment.deleteMany({ where: { patientId: id } }),
      prisma.encounter.deleteMany({ where: { patientId: id } }),
      prisma.diagnosticReport.deleteMany({ where: { patientId: id } }),
      prisma.patient.delete({ where: { id } }),
    ]);

    console.log('Deleted patient and related records with ID:', id);
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    console.error('DELETE /api/patients error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
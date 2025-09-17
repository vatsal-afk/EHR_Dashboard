'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ResourceTable from '@/components/ResourceTable';
import { normalizeAllergy, normalizeMedication, normalizeCondition, normalizeAppointment } from '@/lib/normalizers';
import { apiClient } from '@/lib/apiClient';

export default function PatientDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [allergies, setAllergies] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [conditions, setConditions] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchPatientData = async () => {
      setLoading(true);
      try {
        const patientRes = await fetch(`/api/patients/${id}`);
        const patientData = await patientRes.json();
        setPatient(patientData);

        const allergiesRes = await apiClient('AllergyIntolerance', `?patient=${id}`);
        const allergiesData = allergiesRes.entry?.map((e: any) => normalizeAllergy(e.resource)) || [];
        setAllergies(allergiesData);

        const medicationsRes = await apiClient('MedicationRequest', `?subject=${id}`);
        const medicationsData = medicationsRes.entry?.map((e: any) => normalizeMedication(e.resource)) || [];
        setMedications(medicationsData);

        const conditionsRes = await apiClient('Condition', `?subject=${id}`);
        const conditionsData = conditionsRes.entry?.map((e: any) => normalizeCondition(e.resource)) || [];
        setConditions(conditionsData);

        const appointmentsRes = await apiClient('Appointment', `?patient=${id}`);
        const appointmentsData = appointmentsRes.entry?.map((e: any) => normalizeAppointment(e.resource)) || [];
        setAppointments(appointmentsData);
      } catch (error) {
        console.error('Failed to fetch patient data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        const res = await fetch(`/api/patients?id=${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          router.push('/patients');
        } else {
          console.error('Failed to delete patient');
        }
      } catch (error) {
        console.error('Failed to delete patient', error);
      }
    }
  };

  if (loading) {
    return <p className="p-6">Loading patient data...</p>;
  }

  if (!patient) {
    return <p className="p-6 text-red-500">Patient not found.</p>;
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{patient.name}</h1>
        <div className="flex gap-2">
          {/* Implement Update Form/Modal here */}
          <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Update Details</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded text-sm">
            Delete Patient
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Demographics</h2>
          <p><strong>ID:</strong> {patient.id}</p>
          <p><strong>Gender:</strong> {patient.gender}</p>
          <p><strong>Birth Date:</strong> {patient.birthDate}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Appointments</h2>
          <ResourceTable data={appointments} fields={['id', 'description', 'status', 'start', 'end', 'provider']} />
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Allergies</h2>
          <ResourceTable data={allergies} fields={['id', 'code', 'status', 'criticality']} />
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Conditions</h2>
          <ResourceTable data={conditions} fields={['id', 'code']} />
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Medications</h2>
          <ResourceTable data={medications} fields={['id', 'code', 'status']} />
        </div>
      </div>
    </div>
  );
}
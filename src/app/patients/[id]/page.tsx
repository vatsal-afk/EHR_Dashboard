'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ResourceTable from '@/components/ResourceTable';
import PatientUpdateForm from '@/components/PatientUpdateForm';
import AllergyUpdateForm from '@/components/AllergyUpdateForm';
import ConditionUpdateForm from '@/components/ConditionUpdateForm';

export default function PatientDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [allergies, setAllergies] = useState<any[]>([]);
  const [conditions, setConditions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdatingPatient, setIsUpdatingPatient] = useState(false);
  const [isUpdatingAllergy, setIsUpdatingAllergy] = useState(false);
  const [isUpdatingCondition, setIsUpdatingCondition] = useState(false);
  const [currentAllergy, setCurrentAllergy] = useState<any>(null);
  const [currentCondition, setCurrentCondition] = useState<any>(null);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const patientRes = await fetch(`/api/patients/${id}`);
      const patientData = await patientRes.json();
      setPatient(patientData);

      const allergiesRes = await fetch(`/api/allergies?patient=${id}`);
      const allergiesData = await allergiesRes.json();
      setAllergies(Array.isArray(allergiesData) ? allergiesData : []);

      const conditionsRes = await fetch(`/api/conditions?patient=${id}`);
      const conditionsData = await conditionsRes.json();
      setConditions(Array.isArray(conditionsData) ? conditionsData : []);
      
    } catch (error) {
      console.error('Failed to fetch patient data', error);
      setPatient(null);
      setAllergies([]);
      setConditions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPatientData();
    }
  }, [id]);

  const handleUpdatePatient = (updatedPatient: any) => {
    setPatient(updatedPatient);
    setIsUpdatingPatient(false);
  };

  const handleUpdateAllergy = () => {
    fetchPatientData();
    setIsUpdatingAllergy(false);
  };

  const handleUpdateCondition = () => {
    fetchPatientData();
    setIsUpdatingCondition(false);
  };

  const handleDeletePatient = async () => {
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

  const handleEditAllergy = (allergy: any) => {
    setCurrentAllergy(allergy);
    setIsUpdatingAllergy(true);
  };

  const handleEditCondition = (condition: any) => {
    setCurrentCondition(condition);
    setIsUpdatingCondition(true);
  };

  const handleAddAllergy = () => {
    setCurrentAllergy(null);
    setIsUpdatingAllergy(true);
  };

  const handleAddCondition = () => {
    setCurrentCondition(null);
    setIsUpdatingCondition(true);
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
          <button onClick={() => setIsUpdatingPatient(true)} className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Update Details</button>
          <button onClick={handleDeletePatient} className="px-4 py-2 bg-red-600 text-white rounded text-sm">
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

        <div className="bg-gray-100 p-4 rounded-lg col-span-1 md:col-span-2">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Allergies</h2>
            <button onClick={handleAddAllergy} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Add New</button>
          </div>
          <ResourceTable
            data={allergies}
            fields={['id', 'code', 'status', 'criticality']}
            onRowClick={handleEditAllergy}
          />
        </div>

        <div className="bg-gray-100 p-4 rounded-lg col-span-1 md:col-span-2">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Conditions</h2>
            <button onClick={handleAddCondition} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Add New</button>
          </div>
          <ResourceTable
            data={conditions}
            fields={['id', 'code']}
            onRowClick={handleEditCondition}
          />
        </div>
      </div>
      
      {isUpdatingPatient && patient && (
        <PatientUpdateForm
          patient={patient}
          onUpdate={handleUpdatePatient}
          onClose={() => setIsUpdatingPatient(false)}
        />
      )}

      {isUpdatingAllergy && (
        <AllergyUpdateForm
          allergy={currentAllergy}
          patientId={id as string}
          onUpdate={handleUpdateAllergy}
          onClose={() => setIsUpdatingAllergy(false)}
        />
      )}

      {isUpdatingCondition && (
        <ConditionUpdateForm
          condition={currentCondition}
          patientId={id as string}
          onUpdate={handleUpdateCondition}
          onClose={() => setIsUpdatingCondition(false)}
        />
      )}
    </div>
  );
}
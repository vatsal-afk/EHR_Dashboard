'use client';
import { useEffect, useState } from 'react';
import ResourceTable from '@/components/ResourceTable';
import SearchBar from '@/components/SearchBar';

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);

  const fetchPatients = async (query?: string) => {
    let url = '/api/patients';
    if (query) url += `?name=${query}`;
    const res = await fetch(url);
    const data = await res.json();
    setPatients(data.entry ? data.entry.map((e: any) => e.resource) : []);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Patients</h1>
      <SearchBar onSearch={fetchPatients} />
      <ResourceTable data={patients} />
    </div>
  );
}

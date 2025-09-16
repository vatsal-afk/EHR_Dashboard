'use client';
import { useEffect, useState } from 'react';
import ResourceTable from '@/components/ResourceTable';
import SearchBar from '@/components/SearchBar';

export default function MedicationsPage() {
  const [medications, setMedications] = useState<any[]>([]);

  const fetchMedications = async (query?: string) => {
    let url = '/api/medications';
    if (query) url += `?patient=${query}`;
    const res = await fetch(url);
    const data = await res.json();
    setMedications(data.entry ? data.entry.map((e: any) => e.resource) : []);
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Medications</h1>
      <SearchBar onSearch={fetchMedications} />
      <ResourceTable data={medications} />
    </div>
  );
}

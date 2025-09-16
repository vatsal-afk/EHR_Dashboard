'use client';
import { useEffect, useState } from 'react';
import ResourceTable from '@/components/ResourceTable';
import SearchBar from '@/components/SearchBar';

export default function ObservationsPage() {
  const [observations, setObservations] = useState<any[]>([]);

  const fetchObservations = async (query?: string) => {
    let url = '/api/observations';
    if (query) url += `?patient=${query}&category=vital-signs`;
    const res = await fetch(url);
    const data = await res.json();
    setObservations(data.entry ? data.entry.map((e: any) => e.resource) : []);
  };

  useEffect(() => {
    fetchObservations();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Observations</h1>
      <SearchBar onSearch={fetchObservations} />
      <ResourceTable data={observations} />
    </div>
  );
}

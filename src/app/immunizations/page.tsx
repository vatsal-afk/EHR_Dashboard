'use client';
import { useEffect, useState } from 'react';
import ResourceTable from '@/components/ResourceTable';
import SearchBar from '@/components/SearchBar';

export default function ImmunizationsPage() {
  const [immunizations, setImmunizations] = useState<any[]>([]);

  const fetchImmunizations = async (query?: string) => {
    let url = '/api/immunizations';
    if (query) url += `?patient=${query}`;
    const res = await fetch(url);
    const data = await res.json();
    setImmunizations(data.entry ? data.entry.map((e: any) => e.resource) : []);
  };

  useEffect(() => {
    fetchImmunizations();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Immunizations</h1>
      <SearchBar onSearch={fetchImmunizations} />
      <ResourceTable data={immunizations} />
    </div>
  );
}

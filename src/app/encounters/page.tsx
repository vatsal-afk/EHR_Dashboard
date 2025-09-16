'use client';
import { useEffect, useState } from 'react';
import ResourceTable from '@/components/ResourceTable';
import SearchBar from '@/components/SearchBar';

export default function EncountersPage() {
  const [encounters, setEncounters] = useState<any[]>([]);

  const fetchEncounters = async (query?: string) => {
    let url = '/api/encounters';
    if (query) url += `?patient=${query}`;
    const res = await fetch(url);
    const data = await res.json();
    setEncounters(data.entry ? data.entry.map((e: any) => e.resource) : []);
  };

  useEffect(() => {
    fetchEncounters();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Encounters</h1>
      <SearchBar onSearch={fetchEncounters} />
      <ResourceTable data={encounters} />
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import ResourceTable from '@/components/ResourceTable';
import SearchBar from '@/components/SearchBar';

export default function AllergiesPage() {
  const [allergies, setAllergies] = useState<any[]>([]);

  const fetchAllergies = async (query?: string) => {
    let url = '/api/allergies';
    if (query) url += `?patient=${query}`;
    const res = await fetch(url);
    const data = await res.json();
    setAllergies(data.entry ? data.entry.map((e: any) => e.resource) : []);
  };

  useEffect(() => {
    fetchAllergies();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Allergies</h1>
      <SearchBar onSearch={fetchAllergies} />
      <ResourceTable data={allergies} />
    </div>
  );
}

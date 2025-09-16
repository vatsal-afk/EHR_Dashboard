'use client';
import { useEffect, useState } from 'react';
import ResourceTable from '@/components/ResourceTable';
import SearchBar from '@/components/SearchBar';

export default function ConditionsPage() {
  const [conditions, setConditions] = useState<any[]>([]);

  const fetchConditions = async (query?: string) => {
    let url = '/api/conditions';
    if (query) url += `?patient=${query}`;
    const res = await fetch(url);
    const data = await res.json();
    setConditions(data.entry ? data.entry.map((e: any) => e.resource) : []);
  };

  useEffect(() => {
    fetchConditions();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Conditions</h1>
      <SearchBar onSearch={fetchConditions} />
      <ResourceTable data={conditions} />
    </div>
  );
}

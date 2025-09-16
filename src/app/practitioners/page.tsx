'use client';
import { useEffect, useState } from 'react';
import ResourceTable from '@/components/ResourceTable';
import SearchBar from '@/components/SearchBar';

export default function PractitionersPage() {
  const [practitioners, setPractitioners] = useState<any[]>([]);

  const fetchPractitioners = async (query?: string) => {
    let url = '/api/practitioners';
    if (query) url += `?name=${query}`;
    const res = await fetch(url);
    const data = await res.json();
    setPractitioners(data.entry ? data.entry.map((e: any) => e.resource) : []);
  };

  useEffect(() => {
    fetchPractitioners();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Practitioners</h1>
      <SearchBar onSearch={fetchPractitioners} />
      <ResourceTable data={practitioners} />
    </div>
  );
}

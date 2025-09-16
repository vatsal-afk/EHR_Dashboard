'use client';
import { useEffect, useState } from 'react';
import ResourceTable from '@/components/ResourceTable';
import SearchBar from '@/components/SearchBar';

export default function ProceduresPage() {
  const [procedures, setProcedures] = useState<any[]>([]);

  const fetchProcedures = async (query?: string) => {
    let url = '/api/procedures';
    if (query) url += `?patient=${query}`;
    const res = await fetch(url);
    const data = await res.json();
    setProcedures(data.entry ? data.entry.map((e: any) => e.resource) : []);
  };

  useEffect(() => {
    fetchProcedures();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Procedures</h1>
      <SearchBar onSearch={fetchProcedures} />
      <ResourceTable data={procedures} />
    </div>
  );
}

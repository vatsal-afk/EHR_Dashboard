'use client';
import { useEffect, useState } from 'react';
import ResourceTable from '@/components/ResourceTable';
import SearchBar from '@/components/SearchBar';

export default function DiagnosticReportsPage() {
  const [reports, setReports] = useState<any[]>([]);

  const fetchReports = async (query?: string) => {
    let url = '/api/diagnosticreports';
    if (query) url += `?patient=${query}`;
    const res = await fetch(url);
    const data = await res.json();
    setReports(data.entry ? data.entry.map((e: any) => e.resource) : []);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Diagnostic Reports</h1>
      <SearchBar onSearch={fetchReports} />
      <ResourceTable data={reports} />
    </div>
  );
}

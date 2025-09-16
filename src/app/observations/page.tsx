'use client';
import { useState, useEffect } from 'react';
import ResourceTable from '@/components/ResourceTable';
import SearchBar from '@/components/SearchBar';

export default function ObservationsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async (query?: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/observations${query ? `?search=${query}` : ''}`);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch {
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Observations</h1>
      <SearchBar onSearch={fetchData} />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ResourceTable
          data={data}
          fields={['id', 'status', 'code', 'value', 'date']}
        />
      )}
    </div>
  );
}
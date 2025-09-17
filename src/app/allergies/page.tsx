'use client';
import { useState, useEffect } from 'react';
import ResourceTable from '@/components/ResourceTable';
import SearchBar from '@/components/SearchBar';
import { normalizeAllergy } from '@/lib/normalizers';

export default function AllergiesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newAllergy, setNewAllergy] = useState({ id: '', code: '', status: '', criticality: '', patientId: '' });

  const fetchData = async (query?: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/allergies${query ? `?patient=${query}` : ''}`);
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/allergies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAllergy),
      });
      setNewAllergy({ id: '', code: '', status: '', criticality: '', patientId: '' });
      fetchData();
    } catch (err) {
      console.error('Failed to create allergy', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this allergy?')) {
      try {
        await fetch(`/api/allergies?id=${id}`, {
          method: 'DELETE',
        });
        fetchData();
      } catch (err) {
        console.error('Failed to delete allergy', err);
      }
    }
  };

  const handleSearch = (query: string) => {
    fetchData(query);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Allergies</h1>
      <SearchBar onSearch={handleSearch} placeholder="Search by Patient ID..." />

      <div className="mt-4 p-4 border rounded-lg">
        <h2 className="text-lg font-bold mb-2">Create New Allergy</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="ID"
            value={newAllergy.id}
            onChange={(e) => setNewAllergy({ ...newAllergy, id: e.target.value })}
            className="border rounded px-2 py-1"
            required
          />
          <input
            type="text"
            placeholder="Code"
            value={newAllergy.code}
            onChange={(e) => setNewAllergy({ ...newAllergy, code: e.target.value })}
            className="border rounded px-2 py-1"
            required
          />
          <input
            type="text"
            placeholder="Status"
            value={newAllergy.status}
            onChange={(e) => setNewAllergy({ ...newAllergy, status: e.target.value })}
            className="border rounded px-2 py-1"
          />
          <input
            type="text"
            placeholder="Criticality"
            value={newAllergy.criticality}
            onChange={(e) => setNewAllergy({ ...newAllergy, criticality: e.target.value })}
            className="border rounded px-2 py-1"
          />
          <input
            type="text"
            placeholder="Patient ID"
            value={newAllergy.patientId}
            onChange={(e) => setNewAllergy({ ...newAllergy, patientId: e.target.value })}
            className="border rounded px-2 py-1"
            required
          />
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded text-sm">
            Create
          </button>
        </form>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ResourceTable
          data={data}
          fields={['id', 'code', 'status', 'criticality', 'patient']}
        />
      )}
    </div>
  );
}
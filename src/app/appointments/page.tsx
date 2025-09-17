'use client';
import { useState, useEffect } from 'react';
import ResourceTable from '@/components/ResourceTable';
import SearchBar from '@/components/SearchBar';

export default function AppointmentsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newAppointment, setNewAppointment] = useState({ id: '', status: '', description: '', start: '', end: '', patientId: '', provider: '' });

  const fetchData = async (query?: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments${query ? `?patient=${query}` : ''}`);
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

  const handleSearch = (query: string) => {
    fetchData(query);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment),
      });
      setNewAppointment({ id: '', status: '', description: '', start: '', end: '', patientId: '', provider: '' });
      fetchData();
    } catch (err) {
      console.error('Failed to create appointment', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await fetch(`/api/appointments?id=${id}`, {
          method: 'DELETE',
        });
        fetchData();
      } catch (err) {
        console.error('Failed to delete appointment', err);
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Appointments</h1>
      <SearchBar onSearch={handleSearch} placeholder="Search by Patient ID..." />
      <div className="mt-4 p-4 border rounded-lg">
        <h2 className="text-lg font-bold mb-2">Create New Appointment</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="ID"
            value={newAppointment.id}
            onChange={(e) => setNewAppointment({ ...newAppointment, id: e.target.value })}
            className="border rounded px-2 py-1"
            required
          />
          <input
            type="text"
            placeholder="Status"
            value={newAppointment.status}
            onChange={(e) => setNewAppointment({ ...newAppointment, status: e.target.value })}
            className="border rounded px-2 py-1"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={newAppointment.description}
            onChange={(e) => setNewAppointment({ ...newAppointment, description: e.target.value })}
            className="border rounded px-2 py-1"
          />
          <input
            type="text"
            placeholder="Start Date"
            value={newAppointment.start}
            onChange={(e) => setNewAppointment({ ...newAppointment, start: e.target.value })}
            className="border rounded px-2 py-1"
          />
          <input
            type="text"
            placeholder="End Date"
            value={newAppointment.end}
            onChange={(e) => setNewAppointment({ ...newAppointment, end: e.target.value })}
            className="border rounded px-2 py-1"
          />
          <input
            type="text"
            placeholder="Patient ID"
            value={newAppointment.patientId}
            onChange={(e) => setNewAppointment({ ...newAppointment, patientId: e.target.value })}
            className="border rounded px-2 py-1"
            required
          />
          <input
            type="text"
            placeholder="Provider"
            value={newAppointment.provider}
            onChange={(e) => setNewAppointment({ ...newAppointment, provider: e.target.value })}
            className="border rounded px-2 py-1"
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
          fields={['id', 'status', 'description', 'start', 'end', 'patientId', 'provider']}
        />
      )}
    </div>
  );
}
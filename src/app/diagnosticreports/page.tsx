"use client";
import { useState, useEffect } from "react";
import ResourceTable from "@/components/ResourceTable";
import SearchBar from "@/components/SearchBar";

export default function DiagnosticReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReports = async (patientId?: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/diagnosticreports${patientId ? `?patient=${patientId}` : ""}`);
      const json = await res.json();
      setReports(Array.isArray(json) ? json : []);
    } catch {
      setReports([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Diagnostic Reports</h1>
      <SearchBar onSearch={fetchReports} placeholder="Search by Patient ID..." />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ResourceTable
          data={reports}
          fields={["id", "status", "code", "subject", "effectiveDate", "issued"]}
        />
      )}
    </div>
  );
}

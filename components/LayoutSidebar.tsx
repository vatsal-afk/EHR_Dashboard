import Link from "next/link";

export default function LayoutSidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col p-4 space-y-3">
      <h2 className="text-lg font-bold mb-4">EHR Dashboard</h2>
      <nav className="flex flex-col space-y-2">
        <Link href="/patients" className="hover:bg-gray-700 rounded px-2 py-1">
          Patients
        </Link>
        <Link href="/appointments" className="hover:bg-gray-700 rounded px-2 py-1">
          Appointments
        </Link>
        <Link href="/observations" className="hover:bg-gray-700 rounded px-2 py-1">
          Observations
        </Link>
        <Link href="/conditions" className="hover:bg-gray-700 rounded px-2 py-1">
          Conditions
        </Link>
        <Link href="/allergies" className="hover:bg-gray-700 rounded px-2 py-1">
          Allergies
        </Link>
        <Link href="/immunizations" className="hover:bg-gray-700 rounded px-2 py-1">
          Immunizations
        </Link>
        <Link href="/medications" className="hover:bg-gray-700 rounded px-2 py-1">
          Medications
        </Link>
        <Link href="/encounters" className="hover:bg-gray-700 rounded px-2 py-1">
          Encounters
        </Link>
        <Link href="/practitioners" className="hover:bg-gray-700 rounded px-2 py-1">
          Practitioners
        </Link>
        <Link href="/procedures" className="hover:bg-gray-700 rounded px-2 py-1">
          Procedures
        </Link>
        <Link href="/diagnosticreports" className="hover:bg-gray-700 rounded px-2 py-1">
          Diagnostic Reports
        </Link>
      </nav>
    </aside>
  );
}

interface ResourceTableProps {
  data: any[];
  resourceType?: string;
}

export default function ResourceTable({ data }: ResourceTableProps) {
  if (!data.length) return <p>No records found.</p>;

  const keys = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto border rounded">
      <table className="min-w-full border text-sm table-auto">
        <thead className="bg-gray-100">
          <tr>
            {keys.map((k) => (
              <th
                key={k}
                className="border px-2 py-1 whitespace-nowrap text-left"
              >
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              {keys.map((k) => (
                <td
                  key={k}
                  className="border px-2 py-1 whitespace-nowrap"
                >
                  {typeof row[k] === 'object' ? JSON.stringify(row[k]) : String(row[k])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

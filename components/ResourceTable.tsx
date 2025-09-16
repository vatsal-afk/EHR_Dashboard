interface ResourceTableProps {
  data: any[];
}

export default function ResourceTable({ data }: ResourceTableProps) {
  if (!data.length) return <p>No records found.</p>;

  const keys = Object.keys(data[0]);

  return (
    <table className="min-w-full border text-sm">
      <thead>
        <tr>
          {keys.map((k) => (
            <th key={k} className="border px-2 py-1">{k}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx}>
            {keys.map((k) => (
              <td key={k} className="border px-2 py-1">
                {typeof row[k] === 'object' ? JSON.stringify(row[k]) : String(row[k])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

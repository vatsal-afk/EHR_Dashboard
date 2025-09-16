// lib/apiClient.ts
export async function apiClient(
  resource: string,
  search: string = '',
  method: string = 'GET',
  body?: any
) {
  const base = process.env.FHIR_BASE_URL;
  if (!base) throw new Error('ORACLE_BASE_URL not defined in env');

  const endpoint = `${base}/${resource}${search}`;
  const headers: HeadersInit = {
    'Accept': 'application/fhir+json',  
    'Content-Type': 'application/fhir+json',
  };

  const res = await fetch(endpoint, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw new Error(`FHIR error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

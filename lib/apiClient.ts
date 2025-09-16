export async function apiClient(
  resource: string,
  search: string = '',
  method: string = 'GET',
  body?: any
) {
  const base = process.env.FHIR_BASE_URL;
  const endpoint = `${base}/${resource}${search}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/fhir+json',
    Accept: 'application/fhir+json',
  };

  const res = await fetch(endpoint, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`FHIR error: ${res.status} ${res.statusText} - ${err}`);
  }

  return res.json();
}

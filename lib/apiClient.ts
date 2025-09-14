// API client for FHIR resources
export async function fetchResource(resource: string) {
  const res = await fetch(`/api/${resource}`);
  return res.json();
}

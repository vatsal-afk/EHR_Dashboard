// lib/normalizers.ts

export function normalizePatient(resource: any) {
  return {
    id: resource.id,
    name: resource.name?.[0]
      ? `${resource.name[0].given?.join(" ")} ${resource.name[0].family}`
      : "Unknown",
    gender: resource.gender || "N/A",
    birthDate: resource.birthDate || "N/A",
  };
}

export function normalizeAppointment(resource: any) {
  return {
    id: resource.id,
    status: resource.status,
    description: resource.description,
    start: resource.start,
    end: resource.end,
    patient: resource.participant?.find((p: any) => p.actor?.reference?.startsWith("Patient"))?.actor?.display || "Unknown",
    provider: resource.participant?.find((p: any) => p.actor?.reference?.startsWith("Practitioner"))?.actor?.display || "Unknown",
  };
}

export function normalizeObservation(resource: any) {
  return {
    id: resource.id,
    status: resource.status,
    code: resource.code?.coding?.[0]?.display,
    value: resource.valueQuantity
      ? `${resource.valueQuantity.value} ${resource.valueQuantity.unit}`
      : "N/A",
    date: resource.effectiveDateTime,
  };
}

export function normalizeCondition(resource: any) {
  return {
    id: resource.id,
    code: resource.code?.coding?.[0]?.display || resource.text?.div || "N/A",
    patient: resource.subject?.display || resource.subject?.reference,
  };
}

export function normalizeAllergy(resource: any) {
  return {
    id: resource.id,
    code: resource.code?.text || resource.code?.coding?.[0]?.display,
    status: resource.clinicalStatus?.coding?.[0]?.code || "N/A",
    criticality: resource.criticality || "N/A",
    patient: resource.patient?.reference || "N/A",
  };
}

export function normalizeImmunization(resource: any) {
  return {
    id: resource.id,
    status: resource.status,
    vaccine: resource.vaccineCode?.text || resource.vaccineCode?.coding?.[0]?.display,
    patient: resource.patient?.reference,
    primarySource: resource.primarySource,
  };
}

export function normalizeMedication(resource: any) {
  return {
    id: resource.id,
    code: resource.code?.coding?.[0]?.display,
    status: resource.status,
  };
}

export function normalizeEncounter(resource: any) {
  return {
    id: resource.id,
    status: resource.status,
    class: resource.class?.display || resource.class?.code,
    subject: resource.subject?.reference,
    start: resource.period?.start,
    end: resource.period?.end,
  };
}

export function normalizePractitioner(resource: any) {
  return {
    id: resource.id,
    name: resource.name?.[0]
      ? `${resource.name[0].given?.join(" ")} ${resource.name[0].family}`
      : "Unknown",
    identifiers: resource.identifier?.map((i: any) => i.value).join(", ") || "N/A",
  };
}

export function normalizeProcedure(resource: any) {
  return {
    id: resource.id,
    status: resource.status,
    code: resource.code?.text || resource.code?.coding?.[0]?.display,
    performed: resource.performedDateTime,
  };
}

export function normalizeDiagnosticReport(resource: any) {
  return {
    id: resource.id,
    status: resource.status,
    code: resource.code?.text || resource.code?.coding?.[0]?.display,
    subject: resource.subject?.display || resource.subject?.reference,
    effectiveDate: resource.effectiveDateTime,
    issued: resource.issued,
  };
}

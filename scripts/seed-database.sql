-- Create sample patients
INSERT OR IGNORE INTO Patient (id, name, gender, birthDate) VALUES 
('patient-1', 'John Smith', 'male', '1985-03-15'),
('patient-2', 'Sarah Johnson', 'female', '1992-07-22'),
('patient-3', 'Michael Brown', 'male', '1978-11-08'),
('patient-4', 'Emily Davis', 'female', '1990-05-12'),
('patient-5', 'Robert Wilson', 'male', '1965-09-30');

-- Create sample allergies
INSERT OR IGNORE INTO Allergy (id, code, status, criticality, patientId) VALUES 
('allergy-1', 'Penicillin', 'active', 'high', 'patient-1'),
('allergy-2', 'Peanuts', 'active', 'high', 'patient-2'),
('allergy-3', 'Shellfish', 'active', 'medium', 'patient-3');

-- Create sample appointments
INSERT OR IGNORE INTO Appointment (id, status, description, start, end, patientId, provider) VALUES 
('appt-1', 'scheduled', 'Annual Checkup', '2024-01-15T09:00:00Z', '2024-01-15T10:00:00Z', 'patient-1', 'Dr. Anderson'),
('appt-2', 'scheduled', 'Follow-up Visit', '2024-01-16T14:00:00Z', '2024-01-16T14:30:00Z', 'patient-2', 'Dr. Smith'),
('appt-3', 'completed', 'Blood Work', '2024-01-10T08:00:00Z', '2024-01-10T08:30:00Z', 'patient-3', 'Dr. Johnson');

-- Create sample conditions
INSERT OR IGNORE INTO Condition (id, code, patientId) VALUES 
('condition-1', 'Hypertension', 'patient-1'),
('condition-2', 'Type 2 Diabetes', 'patient-3'),
('condition-3', 'Asthma', 'patient-2');

-- Create sample medications
INSERT OR IGNORE INTO Medication (id, code, status, patientId) VALUES 
('med-1', 'Lisinopril 10mg', 'active', 'patient-1'),
('med-2', 'Metformin 500mg', 'active', 'patient-3'),
('med-3', 'Albuterol Inhaler', 'active', 'patient-2');

-- Create sample practitioners
INSERT OR IGNORE INTO Practitioner (id, name, identifiers) VALUES 
('prac-1', 'Dr. Anderson', 'MD-001'),
('prac-2', 'Dr. Smith', 'MD-002'),
('prac-3', 'Dr. Johnson', 'MD-003');

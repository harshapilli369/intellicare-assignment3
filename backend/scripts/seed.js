require('dotenv').config();
const mongoose = require('mongoose');

const { connectMongoDB } = require('../src/config/mongodb');
const User = require('../src/models/mongodb/User');
const Patient = require('../src/models/mongodb/Patient');
const Appointment = require('../src/models/mongodb/Appointment');
const Note = require('../src/models/mongodb/Note');
const AISummary = require('../src/models/mongodb/AISummary');

const PATIENT_COUNT = 10000;
const BATCH_SIZE = 1000;

// The clinician dashboard and appointment screens were designed around these
// names, so they are seeded first and keep the low patient ids.
const DESIGN_NAMES = [
  'Elias Tobias',
  'Sam Smith',
  'Nafisah Nuabh',
  'Tom Hollander',
  'Sameera Said',
  'Peter Parker',
];

const FIRST_NAMES = [
  'Aaron', 'Aisha', 'Amara', 'Andre', 'Anita', 'Bilal', 'Brianna', 'Callum', 'Carmen', 'Cedric',
  'Chloe', 'Damon', 'Deepa', 'Elena', 'Emeka', 'Farah', 'Felix', 'Gabriel', 'Grace', 'Hannah',
  'Hassan', 'Ingrid', 'Isaac', 'Jasmine', 'Javier', 'Jonas', 'Kiran', 'Lars', 'Leila', 'Lucas',
  'Maya', 'Mateo', 'Naomi', 'Nikolai', 'Olivia', 'Omar', 'Priya', 'Quentin', 'Rania', 'Rohan',
  'Sofia', 'Simone', 'Tariq', 'Tessa', 'Ulises', 'Vera', 'Wesley', 'Yara', 'Yusuf', 'Zara',
];

const LAST_NAMES = [
  'Abbott', 'Ahmed', 'Bennett', 'Bergeron', 'Cardoso', 'Chen', 'Clarke', 'Dubois', 'Duarte',
  'Eriksen', 'Fernandes', 'Fitzgerald', 'Gallagher', 'Gupta', 'Hansen', 'Ibrahim', 'Jensen',
  'Kaur', 'Kowalski', 'Lambert', 'Lindqvist', 'MacDonald', 'Mensah', 'Nakamura', 'Novak',
  'Okafor', 'Oliveira', 'Petrov', 'Quinn', 'Rahman', 'Ramirez', 'Rossi', 'Sinclair', 'Souza',
  'Tremblay', 'Vargas', 'Volkov', 'Walsh', 'Whitfield', 'Yilmaz',
];

const CONDITIONS = [
  'Hypertension', 'Type 2 Diabetes', 'Asthma', 'Seasonal allergies', 'Topical eczema',
  'Migraine', 'Hypothyroidism', 'Osteoarthritis', 'Anxiety', 'High cholesterol',
  'Iron deficiency anaemia', 'Acid reflux',
];

const MEDICATIONS = [
  'Metformin 500mg', 'Lisinopril 10mg', 'Atorvastatin 20mg', 'Salbutamol inhaler',
  'Desloratadine 5mg', 'Topical corticosteroids', 'Levothyroxine 50mcg', 'Omeprazole 20mg',
  'Sertraline 50mg', 'Ibuprofen 400mg',
];

const ALLERGIES = ['Penicillin', 'Sulfa drugs', 'Latex', 'Peanuts', 'Shellfish', 'Ibuprofen'];

const REASONS = [
  'Chest pain', 'Viral infection', 'Routine checkup', 'Broken bone', 'Prescription refill',
  'Allergies medication refill', 'Bi-yearly checkup', 'Follow-up', 'Blood pressure review',
  'Persistent cough', 'Back pain assessment', 'Diabetes review',
];

const pick = (list) => list[Math.floor(Math.random() * list.length)];

const pickMany = (list, max) => {
  const count = Math.floor(Math.random() * max);
  const chosen = new Set();
  for (let i = 0; i < count; i += 1) chosen.add(pick(list));
  return [...chosen];
};

const randomDateWithin = (daysBack, daysForward = 0) => {
  const span = daysBack + daysForward;
  const offset = Math.floor(Math.random() * span) - daysBack;
  const date = new Date();
  date.setDate(date.getDate() + offset);
  date.setHours(8 + Math.floor(Math.random() * 9), pick([0, 15, 30, 45]), 0, 0);
  return date;
};

const buildName = (index) => {
  if (index < DESIGN_NAMES.length) return DESIGN_NAMES[index];
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
};

const insertInBatches = async (Model, documents, label) => {
  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    await Model.insertMany(documents.slice(i, i + BATCH_SIZE), { ordered: false });
  }
  console.log(`  ${documents.length} ${label}`);
};

const seed = async () => {
  await connectMongoDB();

  console.log('Clearing existing data');
  await Promise.all([
    User.deleteMany({}),
    Patient.deleteMany({}),
    Appointment.deleteMany({}),
    Note.deleteMany({}),
    AISummary.deleteMany({}),
  ]);

  console.log('Creating users');
  const clinician = await User.create({
    email: 'dr.kuteishi@intellicare.ca',
    passwordHash: await User.hashPassword('Password123!'),
    name: 'Mariam Kuteishi',
    title: 'Physician',
    role: 'clinician',
  });

  await User.create({
    email: 'elias.tobias@example.com',
    passwordHash: await User.hashPassword('Password123!'),
    name: 'Elias Tobias',
    role: 'patient',
  });

  console.log(`Creating ${PATIENT_COUNT} patients`);
  const patients = [];
  for (let i = 0; i < PATIENT_COUNT; i += 1) {
    patients.push({
      patientId: i + 1,
      name: buildName(i),
      sex: pick(['Male', 'Female', 'Other']),
      dateOfBirth: new Date(
        1945 + Math.floor(Math.random() * 60),
        Math.floor(Math.random() * 12),
        1 + Math.floor(Math.random() * 28)
      ),
      address: `${100 + Math.floor(Math.random() * 800)} Lacewood Dr.`,
      phone: `(902) ${100 + Math.floor(Math.random() * 899)}-${1000 + Math.floor(Math.random() * 8999)}`,
      conditions: pickMany(CONDITIONS, 4),
      medications: pickMany(MEDICATIONS, 3),
      allergies: pickMany(ALLERGIES, 2),
      clinicianId: clinician._id,
    });
  }
  await insertInBatches(Patient, patients, 'patients');

  console.log('Creating appointments and notes');
  const appointments = [];
  const notes = [];
  let appointmentId = 1;

  for (const patient of patients) {
    const visits = 2 + Math.floor(Math.random() * 3);
    for (let v = 0; v < visits; v += 1) {
      const scheduledAt = randomDateWithin(730);
      appointments.push({
        appointmentId,
        patientId: patient.patientId,
        clinicianId: clinician._id,
        scheduledAt,
        reason: pick(REASONS),
        status: 'completed',
      });
      notes.push({
        appointmentId,
        patientId: patient.patientId,
        body: `Patient presented for ${pick(REASONS).toLowerCase()}. Observations recorded and plan discussed.`,
        createdBy: clinician._id,
      });
      appointmentId += 1;
    }
  }

  // A small number of appointments land on today so the dashboard and the
  // appointments screen have something to show.
  const today = new Date();
  [
    { hour: 11, minute: 45, patientId: 1, reason: 'Chest pain' },
    { hour: 12, minute: 30, patientId: 2, reason: 'Viral infection' },
    { hour: 13, minute: 15, patientId: 3, reason: 'Routine checkup' },
    { hour: 13, minute: 45, patientId: 6, reason: 'Broken bone' },
  ].forEach((slot) => {
    const scheduledAt = new Date(today);
    scheduledAt.setHours(slot.hour, slot.minute, 0, 0);
    appointments.push({
      appointmentId,
      patientId: slot.patientId,
      clinicianId: clinician._id,
      scheduledAt,
      reason: slot.reason,
      status: 'scheduled',
    });
    appointmentId += 1;
  });

  await insertInBatches(Appointment, appointments, 'appointments');
  await insertInBatches(Note, notes, 'notes');

  console.log('\nSeed complete');
  console.log('  Clinician login: dr.kuteishi@intellicare.ca / Password123!');
  console.log('  Patient login:   elias.tobias@example.com / Password123!');

  await mongoose.connection.close();
};

seed().catch(async (err) => {
  console.error(err);
  await mongoose.connection.close();
  process.exit(1);
});

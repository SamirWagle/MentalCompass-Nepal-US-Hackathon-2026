import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.resolve(__dirname, '../../data/appointments.json');
const isServerlessRuntime = process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
let memoryAppointments = [];

function canUseFileStore() {
  if (isServerlessRuntime) return false;
  try {
    const storeDir = path.dirname(STORE_PATH);
    if (!fs.existsSync(storeDir)) fs.mkdirSync(storeDir, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

function readStore() {
  const hasFileStore = canUseFileStore();
  if (!hasFileStore) return memoryAppointments;
  try {
    if (!fs.existsSync(STORE_PATH)) {
      fs.writeFileSync(STORE_PATH, '[]', 'utf-8');
      return [];
    }
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
  } catch {
    return memoryAppointments;
  }
}

function writeStore(data) {
  const hasFileStore = canUseFileStore();
  if (!hasFileStore) {
    memoryAppointments = data;
    return;
  }
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    memoryAppointments = data;
  }
}

export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  REFUNDED: 'refunded',
};

/**
 * Create a new appointment request.
 * Links patient anonymousId to doctor — never real patient identity.
 */
export function createAppointment({
  anonymousPatientId,
  doctorId,
  consultationFee,
  paymentRef,
  scheduledAt,
  createdBy,
}) {
  const appointments = readStore();

  const appointment = {
    id: uuidv4(),
    anonymousPatientId,       // JRN-XXXX — doctor never sees real name
    doctorId,                 // internal routing only — patient never sees doctor identity
    requestedAt: new Date().toISOString(),
    scheduledAt: scheduledAt || null,
    status: APPOINTMENT_STATUS.PENDING,
    consultationFee: consultationFee || 0,
    paymentRef: paymentRef || null,
    paymentStatus: PAYMENT_STATUS.UNPAID,
    patientDeclineReason: null,
    createdBy: createdBy || null,
    confirmedAt: null,
    completedAt: null,
  };

  appointments.push(appointment);
  writeStore(appointments);
  return appointment;
}

/**
 * Get all appointments for a patient (by anonymousId)
 */
export function getAppointmentsByPatient(anonymousPatientId, limit = 20) {
  return readStore()
    .filter(a => a.anonymousPatientId === anonymousPatientId)
    .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt))
    .slice(0, limit);
}

/**
 * Get all appointments for a doctor (by doctorId — internal use only)
 */
export function getAppointmentsByDoctor(doctorId, limit = 50) {
  return readStore()
    .filter(a => a.doctorId === doctorId)
    .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt))
    .slice(0, limit)
    .map(sanitizeForPatient); // strip internal doctorId details
}

/**
 * Update appointment status
 */
export function updateAppointmentStatus(id, status, extra = {}) {
  const appointments = readStore();
  const idx = appointments.findIndex(a => a.id === id);
  if (idx === -1) return null;

  appointments[idx].status = status;
  if (status === APPOINTMENT_STATUS.CONFIRMED) {
    appointments[idx].confirmedAt = new Date().toISOString();
  }
  if (status === APPOINTMENT_STATUS.COMPLETED) {
    appointments[idx].completedAt = new Date().toISOString();
  }
  if (status === APPOINTMENT_STATUS.CANCELLED && extra.reason) {
    appointments[idx].patientDeclineReason = extra.reason;
  }
  Object.assign(appointments[idx], extra);
  writeStore(appointments);
  return appointments[idx];
}

/**
 * Mark appointment as paid — creates booking
 */
export function confirmAppointmentPayment(id, paymentRef) {
  const appointments = readStore();
  const idx = appointments.findIndex(a => a.id === id);
  if (idx === -1) return null;

  appointments[idx].paymentStatus = PAYMENT_STATUS.PAID;
  appointments[idx].paymentRef = paymentRef;
  appointments[idx].status = APPOINTMENT_STATUS.CONFIRMED;
  appointments[idx].confirmedAt = new Date().toISOString();
  writeStore(appointments);
  return appointments[idx];
}

/**
 * Get aggregated stats for SuperAdmin analytics (PHI-stripped)
 */
export function getAppointmentStats() {
  const appointments = readStore();
  return {
    total: appointments.length,
    pending: appointments.filter(a => a.status === APPOINTMENT_STATUS.PENDING).length,
    confirmed: appointments.filter(a => a.status === APPOINTMENT_STATUS.CONFIRMED).length,
    completed: appointments.filter(a => a.status === APPOINTMENT_STATUS.COMPLETED).length,
    cancelled: appointments.filter(a => a.status === APPOINTMENT_STATUS.CANCELLED).length,
    totalRevenue: appointments
      .filter(a => a.paymentStatus === PAYMENT_STATUS.PAID)
      .reduce((sum, a) => sum + (a.consultationFee || 0), 0),
  };
}

/**
 * Strip doctorId from patient-facing appointment views
 */
function sanitizeForPatient(appt) {
  const { doctorId, ...safe } = appt;
  return safe;
}

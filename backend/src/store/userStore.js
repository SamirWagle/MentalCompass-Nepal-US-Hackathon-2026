import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.resolve(__dirname, '../../data/users.json');
const isServerlessRuntime = process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
let memoryUsers = [];

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
  if (!hasFileStore) return memoryUsers;
  try {
    if (!fs.existsSync(STORE_PATH)) {
      fs.writeFileSync(STORE_PATH, '[]', 'utf-8');
      return [];
    }
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
  } catch {
    return memoryUsers;
  }
}

function writeStore(data) {
  const hasFileStore = canUseFileStore();
  if (!hasFileStore) {
    memoryUsers = data;
    return;
  }
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    memoryUsers = data;
  }
}

// Valid roles
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  DOCTOR: 'doctor',
  PATIENT: 'patient',
  GUARDIAN: 'guardian',
  CHV: 'chv',       // Community Health Volunteer
  MINI_ADMIN: 'chv', // Alias — MiniAdmin === CHV (same role string)
};

// Doctor sub-types
export const DOCTOR_TYPES = ['psychiatrist', 'psychologist', 'general'];

/**
 * Generate a unique anonymous ID for patients (JRN-XXXX format).
 * Doctors only ever see this ID — never the patient's real identity.
 */
function generateAnonymousId(existingUsers) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id;
  const existingIds = new Set(existingUsers.map(u => u.anonymousId).filter(Boolean));
  do {
    id = 'JRN-' + Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (existingIds.has(id));
  return id;
}

/**
 * Seed the default super-admin account if it doesn't exist.
 */
export function seedSuperAdmin() {
  const users = readStore();
  const exists = users.find(u => u.role === ROLES.SUPER_ADMIN && u.email === 'admin@aegisspeak.com');
  if (exists) return exists;

  const admin = {
    id: uuidv4(),
    anonymousId: null, // admins don't need anonymous IDs
    email: 'admin@aegisspeak.com',
    password: bcrypt.hashSync('AegisAdmin@2026', 10),
    fullName: 'System Administrator',
    role: ROLES.SUPER_ADMIN,
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    linkedPatientId: null,
    doctorType: null,
    phone: '',
    avatar: '🛡️',
    consentGiven: true,
    consentAt: new Date().toISOString(),
    subscription: null,
  };

  users.push(admin);
  writeStore(users);
  return admin;
}

/**
 * Create a new user (only super_admin can do this)
 */
export function createUser({ email, password, fullName, role, doctorType, linkedPatientId, phone, createdBy }) {
  const users = readStore();

  // Check for duplicate email
  if (users.find(u => u.email === email)) {
    return { error: 'EMAIL_EXISTS', message: 'A user with this email already exists.' };
  }

  // Validate role
  if (!Object.values(ROLES).includes(role)) {
    return { error: 'INVALID_ROLE', message: `Invalid role: ${role}` };
  }

  // Validate guardian must have a linked patient
  if (role === ROLES.GUARDIAN && !linkedPatientId) {
    return { error: 'MISSING_LINK', message: 'Guardians must be linked to a patient.' };
  }

  // Validate linked patient exists
  if (linkedPatientId) {
    const patient = users.find(u => u.id === linkedPatientId && u.role === ROLES.PATIENT);
    if (!patient) {
      return { error: 'INVALID_PATIENT', message: 'Linked patient not found.' };
    }
  }

  const avatarMap = {
    [ROLES.SUPER_ADMIN]: '🛡️',
    [ROLES.DOCTOR]: '🩺',
    [ROLES.PATIENT]: '🧑',
    [ROLES.GUARDIAN]: '👨‍👩‍👧',
    [ROLES.CHV]: '👩‍⚕️',
  };

  // Patients get anonymous IDs — doctors/admins/CHVs/guardians don't
  const anonymousId = role === ROLES.PATIENT ? generateAnonymousId(users) : null;

  const user = {
    id: uuidv4(),
    anonymousId,
    email,
    password: bcrypt.hashSync(password, 10),
    fullName,
    role,
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: createdBy || 'system',
    linkedPatientId: linkedPatientId || null,
    doctorType: role === ROLES.DOCTOR ? (doctorType || 'general') : null,
    phone: phone || '',
    avatar: avatarMap[role] || '🧑',
    consentGiven: role === ROLES.PATIENT,
    consentAt: role === ROLES.PATIENT ? new Date().toISOString() : null,
    // Doctor monetization fields
    subscription: role === ROLES.DOCTOR ? 'pending' : null,
    subscriptionStatus: role === ROLES.DOCTOR ? 'pending' : null, // 'free'|'pending'|'active'
    paymentVerified: false,
    // Patient: anonymous check-in schedule
    checkinSchedule: role === ROLES.PATIENT ? { hour: 20, minute: 0, timezone: 'Asia/Kathmandu' } : null,
    // Patient: wearable device connection
    wearableConnected: false,
    wearableEncryptedData: null, // AES-encrypted PHI biometric payload
    // Doctor: anonymized code shown to patients (e.g. DR-A1B2)
    doctorCode: role === ROLES.DOCTOR ? generateDoctorCode() : null,
  };

  users.push(user);
  writeStore(users);

  return { user: sanitizeUser(user) };
}

/**
 * Authenticate user by email + password
 */
export function authenticateUser(email, password) {
  const users = readStore();
  const user = users.find(u => u.email === email);
  if (!user) return { error: 'NOT_FOUND', message: 'Invalid email or password.' };
  if (!user.isActive) return { error: 'DISABLED', message: 'This account has been deactivated.' };
  if (!bcrypt.compareSync(password, user.password)) return { error: 'BAD_PASSWORD', message: 'Invalid email or password.' };
  return { user: sanitizeUser(user) };
}

/**
 * Get user by ID (without password)
 */
export function getUserById(id) {
  const users = readStore();
  const user = users.find(u => u.id === id);
  if (!user) return null;
  return sanitizeUser(user);
}

/**
 * List all users (admin only, no passwords)
 */
export function listUsers(filterRole) {
  const users = readStore();
  const filtered = filterRole ? users.filter(u => u.role === filterRole) : users;
  return filtered.map(sanitizeUser);
}

/**
 * Update user status / info
 */
export function updateUser(id, updates) {
  const users = readStore();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return { error: 'NOT_FOUND', message: 'User not found.' };

  const allowed = [
    'fullName', 'phone', 'isActive', 'linkedPatientId', 'doctorType',
    'checkinSchedule', 'wearableConnected', 'wearableEncryptedData',
    'subscriptionStatus', 'paymentVerified', 'doctorCode'
  ];
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      users[idx][key] = updates[key];
    }
  }

  if (updates.password) {
    users[idx].password = bcrypt.hashSync(updates.password, 10);
  }

  writeStore(users);
  return { user: sanitizeUser(users[idx]) };
}

/**
 * Delete user
 */
export function deleteUser(id) {
  let users = readStore();
  const user = users.find(u => u.id === id);
  if (!user) return { error: 'NOT_FOUND', message: 'User not found.' };
  users = users.filter(u => u.id !== id);
  writeStore(users);
  return { deleted: true };
}

/**
 * Get guardians linked to a patient
 */
export function getGuardiansForPatient(patientId) {
  const users = readStore();
  return users
    .filter(u => u.role === ROLES.GUARDIAN && u.linkedPatientId === patientId)
    .map(sanitizeUser);
}

/**
 * Get patient linked to a guardian
 */
export function getLinkedPatient(guardianId) {
  const users = readStore();
  const guardian = users.find(u => u.id === guardianId);
  if (!guardian || !guardian.linkedPatientId) return null;
  const patient = users.find(u => u.id === guardian.linkedPatientId);
  return patient ? sanitizeUser(patient) : null;
}

function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

/**
 * Generate a unique anonymous doctor code (DR-XXXX format)
 */
function generateDoctorCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'DR-' + Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/**
 * Update patient's wearable connection and encrypted data
 */
export function updateWearableData(userId, encrypted, connected) {
  const users = readStore();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return null;
  users[idx].wearableConnected = connected;
  users[idx].wearableEncryptedData = encrypted;
  writeStore(users);
  return sanitizeUser(users[idx]);
}

/**
 * Update patient's check-in schedule
 */
export function updateCheckinSchedule(userId, schedule) {
  const users = readStore();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return null;
  users[idx].checkinSchedule = schedule;
  writeStore(users);
  return sanitizeUser(users[idx]);
}

/**
 * Mark a doctor as payment-verified and subscription active
 */
export function verifyDoctorPayment(doctorId, paymentRef) {
  const users = readStore();
  const idx = users.findIndex(u => u.id === doctorId && u.role === ROLES.DOCTOR);
  if (idx === -1) return null;
  users[idx].subscriptionStatus = 'active';
  users[idx].subscription = 'active';
  users[idx].paymentVerified = true;
  users[idx].paymentRef = paymentRef || null;
  users[idx].paymentVerifiedAt = new Date().toISOString();
  writeStore(users);
  return sanitizeUser(users[idx]);
}

/**
 * List available doctors (for patient booking).
 * Returns anonymized profile — never real name or email.
 */
export function listAvailableDoctors() {
  const users = readStore();
  return users
    .filter(u => u.role === ROLES.DOCTOR && u.isActive && u.paymentVerified)
    .map(u => ({
      doctorCode: u.doctorCode || 'DR-????',
      doctorType: u.doctorType || 'general',
      isActive: u.isActive,
      consultationFee: u.consultationFee || 500, // NPR 500 default
      // ❌ No name, email, phone — anonymous to patient
    }));
}

/**
 * Get aggregated user statistics for SuperAdmin (PHI-free)
 */
export function getUserStats() {
  const users = readStore();
  const byRole = {};
  for (const u of users) {
    byRole[u.role] = (byRole[u.role] || 0) + 1;
  }
  return {
    total: users.length,
    byRole,
    activePatients: users.filter(u => u.role === ROLES.PATIENT && u.isActive).length,
    activeDoctors: users.filter(u => u.role === ROLES.DOCTOR && u.isActive && u.paymentVerified).length,
    activeChvs: users.filter(u => u.role === ROLES.CHV && u.isActive).length,
  };
}

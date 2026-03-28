import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.resolve(__dirname, '../../data/users.json');

function readStore() {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      fs.writeFileSync(STORE_PATH, '[]', 'utf-8');
      return [];
    }
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

function writeStore(data) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Valid roles
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  DOCTOR: 'doctor',
  PATIENT: 'patient',
  GUARDIAN: 'guardian',
  CHV: 'chv', // Community Health Volunteer (Mini Admin)
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
    subscription: role === ROLES.DOCTOR ? 'pending' : null,
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

  const allowed = ['fullName', 'phone', 'isActive', 'linkedPatientId', 'doctorType'];
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

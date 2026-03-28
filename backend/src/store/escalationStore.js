import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "escalations.json");
const isServerlessRuntime = process.env.VERCEL === "1" || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
let memoryRecords = [];

function ensureStore() {
  if (isServerlessRuntime) return false;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([]));
    }
    return true;
  } catch {
    return false;
  }
}

function readAll() {
  const hasFsStore = ensureStore();
  if (!hasFsStore) return memoryRecords;
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return memoryRecords;
  }
}

function writeAll(records) {
  const hasFsStore = ensureStore();
  if (!hasFsStore) {
    memoryRecords = records;
    return;
  }
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2));
  } catch {
    memoryRecords = records;
  }
}

export function saveEscalation(record) {
  const records = readAll();
  records.push(record);
  writeAll(records);
}

export function listEscalations(userId) {
  const records = readAll();
  // null userId = return all (SuperAdmin analytics)
  if (userId === null || userId === undefined) return records;
  return records.filter((item) => item.userId === userId);
}


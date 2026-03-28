import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "checkins.json");
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

export function saveCheckin(record) {
  const records = readAll();
  records.push(record);
  writeAll(records);
}

export function listCheckins(userId) {
  const records = readAll();
  return records.filter((item) => item.userId === userId);
}

export function getLatestMoodSeries(userId, max = 14) {
  const records = listCheckins(userId);
  return records.slice(-max).map((item) => ({
    timestamp: item.timestamp,
    mood: item.input.mood,
    score: item.score
  }));
}

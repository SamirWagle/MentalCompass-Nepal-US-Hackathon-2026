import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "checkins.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
}

function readAll() {
  ensureStore();
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  return JSON.parse(raw);
}

function writeAll(records) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2));
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

import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "community_posts.txt");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "", "utf8");
  }
}

export function listCommunityPosts(limit = 100) {
  ensureStore();
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  if (!raw.trim()) return [];

  const lines = raw.split(/\r?\n/).filter(Boolean);
  const parsed = [];
  for (const line of lines) {
    try {
      const item = JSON.parse(line);
      if (item && item.id && item.text) parsed.push(item);
    } catch {
      // Skip malformed lines to keep feed resilient.
    }
  }

  return parsed
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, Math.max(1, Number(limit) || 100));
}

export function saveCommunityPost(post) {
  ensureStore();
  fs.appendFileSync(DATA_FILE, `${JSON.stringify(post)}\n`, "utf8");
}

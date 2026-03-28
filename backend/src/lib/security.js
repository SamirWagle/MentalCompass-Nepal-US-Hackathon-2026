import crypto from "crypto";

const ALGO = "aes-256-gcm";

function normalizeKey(rawKey) {
  if (!rawKey) return null;
  return crypto.createHash("sha256").update(rawKey).digest();
}

export function encryptPayload(payload, rawKey) {
  const key = normalizeKey(rawKey);
  if (!key) {
    return { encrypted: null, iv: null, authTag: null };
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const plaintext = JSON.stringify(payload);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final()
  ]);

  return {
    encrypted: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64")
  };
}

export function createAuditHash(payload) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}

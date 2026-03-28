import { createAuditHash } from "./security.js";

export function buildSmsPayload(data) {
  const compact = {
    u: data.userId,
    r: data.riskScore,
    l: data.riskLevel,
    e: data.escalation ? 1 : 0,
    t: Date.now()
  };

  const json = JSON.stringify(compact);
  const encoded = Buffer.from(json, "utf8").toString("base64");

  return {
    channel: "sms-simulated",
    payload: encoded.slice(0, 160),
    payloadLength: encoded.length,
    truncatedForSms: encoded.length > 160,
    receiptHash: createAuditHash(compact)
  };
}

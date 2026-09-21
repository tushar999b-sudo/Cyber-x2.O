// ============================================================
// 1. Hash Identifier
// ============================================================
export interface HashGuess {
  type: string;
  confidence: "high" | "medium" | "low";
}

export function identifyHash(input: string): HashGuess[] {
  const value = input.trim();
  const guesses: HashGuess[] = [];

  if (/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value)) {
    guesses.push({ type: "bcrypt", confidence: "high" });
  }
  if (/^\$1\$/.test(value)) {
    guesses.push({ type: "MD5-crypt (Unix)", confidence: "high" });
  }
  if (/^\$6\$/.test(value)) {
    guesses.push({ type: "SHA-512-crypt (Unix)", confidence: "high" });
  }
  if (/^[a-f0-9]{32}$/i.test(value)) {
    guesses.push({ type: "MD5", confidence: "medium" });
  }
  if (/^[a-f0-9]{40}$/i.test(value)) {
    guesses.push({ type: "SHA-1", confidence: "medium" });
  }
  if (/^[a-f0-9]{64}$/i.test(value)) {
    guesses.push({ type: "SHA-256", confidence: "medium" });
  }
  if (/^[a-f0-9]{128}$/i.test(value)) {
    guesses.push({ type: "SHA-512", confidence: "medium" });
  }

  if (guesses.length === 0) {
    guesses.push({ type: "Unknown", confidence: "low" });
  }
  return guesses;
}

// ============================================================
// 2. Encoder / Decoder
// ============================================================
export type EncodeFormat = "base64" | "url" | "hex";

function b64Encode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

function b64Decode(b64: string): string {
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeText(text: string, format: EncodeFormat): string {
  switch (format) {
    case "base64":
      return b64Encode(text);
    case "url":
      return encodeURIComponent(text);
    case "hex":
      return Array.from(new TextEncoder().encode(text))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
  }
}

export function decodeText(text: string, format: EncodeFormat): string {
  switch (format) {
    case "base64":
      return b64Decode(text);
    case "url":
      return decodeURIComponent(text);
    case "hex": {
      const bytes = text.trim().replace(/\s+/g, "").match(/.{1,2}/g) ?? [];
      return new TextDecoder().decode(
        Uint8Array.from(bytes.map((b) => parseInt(b, 16)))
      );
    }
  }
}

// ============================================================
// 3. JWT Decoder (read-only inspection)
// ============================================================
export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  expiresAt: string | null;
  isExpired: boolean | null;
}

function base64UrlDecode(segment: string): string {
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/");
  const pad =
    padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return b64Decode(padded + pad);
}

export function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().split(".");
  if (parts.length < 2) {
    throw new Error("Not a valid JWT — expected header.payload.signature");
  }
  const header = JSON.parse(base64UrlDecode(parts[0]));
  const payload = JSON.parse(base64UrlDecode(parts[1]));
  const exp = typeof payload.exp === "number" ? payload.exp : null;
  return {
    header,
    payload,
    expiresAt: exp ? new Date(exp * 1000).toLocaleString() : null,
    isExpired: exp ? Date.now() > exp * 1000 : null,
  };
}

// ============================================================
// 4. Password Strength Auditor (local heuristic, no network)
// ============================================================
export interface PasswordAudit {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  entropyBits: number;
  feedback: string[];
}

const COMMON_PATTERNS = [
  /123/,
  /password/i,
  /qwerty/i,
  /letmein/i,
  /admin/i,
  /welcome/i,
  /(.)\1{2}/,
  /abcdef/i,
  /000000/,
  /111111/,
];

export function auditPassword(password: string): PasswordAudit {
  const feedback: string[] = [];
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^A-Za-z0-9]/.test(password)) poolSize += 32;

  const entropyBits =
    password.length > 0
      ? Math.round(password.length * Math.log2(poolSize || 1))
      : 0;

  if (password.length < 8) feedback.push("Shorter than 8 characters.");
  if (!/[A-Z]/.test(password)) feedback.push("No uppercase letters.");
  if (!/[a-z]/.test(password)) feedback.push("No lowercase letters.");
  if (!/[0-9]/.test(password)) feedback.push("No digits.");
  if (!/[^A-Za-z0-9]/.test(password)) feedback.push("No symbols.");

  const hitsCommonPattern = COMMON_PATTERNS.some((re) => re.test(password));
  if (hitsCommonPattern) feedback.push("Matches a common weak pattern.");

  let score: PasswordAudit["score"] = 0;
  if (entropyBits >= 28) score = 1;
  if (entropyBits >= 36) score = 2;
  if (entropyBits >= 60) score = 3;
  if (entropyBits >= 80 && !hitsCommonPattern) score = 4;
  if (hitsCommonPattern && score > 1) score = 1;

  const labels = ["Very weak", "Weak", "Fair", "Strong", "Very strong"];
  if (feedback.length === 0)
    feedback.push("No obvious weaknesses detected locally.");

  return { score, label: labels[score], entropyBits, feedback };
}

// ============================================================
// 5. Wordlist Generator (charset rules, capped output)
// ============================================================
export interface WordlistOptions {
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
  minLength: number;
  maxLength: number;
  prefix: string;
  suffix: string;
  cap?: number;
}

const CHARSETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*",
};

export function generateWordlist(ops: WordlistOptions): string[] {
  const cap = ops.cap ?? 10000;
  let pool = "";
  if (ops.lower) pool += CHARSETS.lower;
  if (ops.upper) pool += CHARSETS.upper;
  if (ops.digits) pool += CHARSETS.digits;
  if (ops.symbols) pool += CHARSETS.symbols;
  if (!pool) return [];

  const results = new Set<string>();
  const minLen = Math.max(1, ops.minLength);
  const maxLen = Math.max(minLen, ops.maxLength);

  let attempts = 0;
  const maxAttempts = cap * 10;

  while (results.size < cap && attempts < maxAttempts) {
    attempts++;
    const len = minLen + Math.floor(Math.random() * (maxLen - minLen + 1));
    let word = "";
    for (let i = 0; i < len; i++) {
      word += pool[Math.floor(Math.random() * pool.length)];
    }
    results.add(`${ops.prefix}${word}${ops.suffix}`);
  }

  return Array.from(results);
}

// ============================================================
// 6. CIDR Calculator (IPv4)
// ============================================================
export interface CidrResult {
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  hostCount: number;
  subnetMask: string;
}

function ipToInt(ip: string): number {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    throw new Error("Invalid IPv4 address.");
  }
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function intToIp(int: number): string {
  return [24, 16, 8, 0].map((shift) => (int >>> shift) & 255).join(".");
}

export function calculateCidr(cidr: string): CidrResult {
  const [ip, prefixStr] = cidr.trim().split("/");
  const prefix = parseInt(prefixStr, 10);
  if (!ip || isNaN(prefix) || prefix < 0 || prefix > 32) {
    throw new Error("Expected format: 192.168.1.0/24");
  }

  const ipInt = ipToInt(ip);
  const maskInt = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = ipInt & maskInt;
  const broadcast = network | (~maskInt >>> 0);
  const hostCount =
    prefix >= 31 ? 2 ** (32 - prefix) : Math.max(0, 2 ** (32 - prefix) - 2);

  return {
    network: intToIp(network >>> 0),
    broadcast: intToIp(broadcast >>> 0),
    firstHost: prefix >= 31 ? intToIp(network >>> 0) : intToIp((network + 1) >>> 0),
    lastHost: prefix >= 31 ? intToIp(broadcast >>> 0) : intToIp((broadcast - 1) >>> 0),
    hostCount,
    subnetMask: intToIp(maskInt),
  };
}
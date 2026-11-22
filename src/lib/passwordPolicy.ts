/**
 * Shared password policy for every sign-up, password-change and reset form.
 *
 * Acts as an in-app fallback while the hosted leaked-password check is off:
 * enforces length + complexity, rejects well-known weak passwords (including
 * simple variations like "Password123!" or "P@ssw0rd2026"), and rejects
 * passwords built from the person's own name or email.
 */

export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 72;

/**
 * Base words of commonly breached / easily guessed passwords. Matching ignores
 * case, leading/trailing digits and symbols, and common letter swaps
 * (@→a, 0→o, 3→e, 1→i, $→s, ...).
 */
export const WEAK_PASSWORDS: readonly string[] = [
  // Global top breached passwords
  "password", "passw", "passwd", "pass", "pasword", "qwerty", "qwertyuiop", "qwertyui", "qwer", "asdf",
  "asdfgh", "asdfghjkl", "zxcvbn", "zxcvbnm", "qazwsx", "qazwsxedc", "wsxedc", "abc", "abcd", "abcdef",
  "abcdefg", "abcdefgh", "iloveyou", "iloveu", "loveyou", "admin", "administrator", "root", "toor",
  "welcome", "letmein", "monkey", "dragon", "football", "soccer", "baseball", "basketball", "hockey",
  "sunshine", "princess", "shadow", "master", "superman", "batman", "spiderman", "trustno", "starwars",
  "whatever", "freedom", "michael", "jennifer", "jessica", "ashley", "daniel", "thomas", "charlie",
  "jordan", "hunter", "ranger", "buster", "tigger", "pepper", "ginger", "summer", "winter", "spring",
  "autumn", "hello", "helloworld", "secret", "changeme", "default", "login", "guest", "user", "test",
  "tester", "testing", "demo", "temp", "temporary", "computer", "internet", "samsung", "google",
  "apple", "iphone", "android", "facebook", "instagram", "linkedin", "microsoft", "windows", "killer",
  "lovely", "flower", "angel", "angels", "family", "friends", "forever", "pokemon", "naruto", "matrix",
  "mustang", "ferrari", "porsche", "harley", "cheese", "chocolate", "cookie", "banana", "orange",
  "purple", "yellow", "silver", "golden", "diamond", "money", "monster", "access", "master key",
  "zaq", "qwe", "qweasd", "qweasdzxc", "azerty", "passport", "letmeinnow", "onlyme", "nothing",
  "unknown", "blink", "liverpool", "chelsea", "arsenal", "barcelona", "realmadrid", "juventus",
  "manchester", "united", "hottie", "babygirl", "sweety", "sweetheart", "baby", "lover", "myspace",
  "superstar", "rockstar", "wizard", "magic", "player", "gamer", "hacker", "ninja", "q1w2e3r4",
  "q1w2e3r4t5", "1q2w3e4r", "1q2w3e4r5t", "1qaz2wsx", "zaq1xsw2", "p4ssw0rd", "passw0rd", "pa55word",
  // Indonesian favourites
  "sayang", "sayangku", "sayangkamu", "bismillah", "alhamdulillah", "subhanallah", "insyaallah",
  "indonesia", "jakarta", "bandung", "surabaya", "yogyakarta", "jogja", "semarang", "medan", "makassar",
  "bali", "denpasar", "rahasia", "cinta", "cintaku", "aku", "akucintakamu", "kamu", "kucing", "anjing",
  "merdeka", "garuda", "persib", "persija", "arema", "doraemon", "katasandi", "kata sandi", "sandi",
  "ganteng", "cantik", "rumahku", "keluarga", "mama", "papa", "mamah", "bapak", "ibu", "sukses",
  "rejeki", "selamat", "pancasila", "nusantara", "bintang", "matahari", "pelangi", "sahabat",
  // Brand and site-specific words people reach for
  "astra", "astravilla", "astra villa", "villa", "villas", "property", "properti", "properties",
  "rumah", "realestate", "real estate", "investor", "invest", "investment", "agent", "agen",
  "reos", "luxury", "mewah",
];

const WEAK_SET = new Set(WEAK_PASSWORDS.map((w) => w.replace(/\s+/g, "")));

const LEET: Record<string, string> = {
  "@": "a", "4": "a", "8": "b", "(": "c", "3": "e", "6": "g", "9": "g", "1": "i", "!": "i",
  "|": "l", "0": "o", "$": "s", "5": "s", "7": "t", "+": "t", "2": "z",
};

const SPECIAL_RE = /[^A-Za-z0-9\s]/;

const deLeet = (s: string) => s.replace(/[@48(36901!|$57+2]/g, (c) => LEET[c] ?? c);
const stripEdges = (s: string) => s.replace(/^[^a-z]+|[^a-z]+$/g, "");
const stripTrailing = (s: string) => s.replace(/[^a-z]+$/g, "");

/** Every reasonable "base word" a password could reduce to. */
function candidateBases(password: string): string[] {
  const lower = password.toLowerCase().replace(/\s+/g, "");
  const out = new Set<string>([
    lower,
    stripEdges(lower),
    deLeet(lower),
    stripEdges(deLeet(lower)),
    deLeet(stripTrailing(lower)),
    stripEdges(deLeet(stripTrailing(lower))),
  ]);
  return [...out].filter(Boolean);
}

/** True when the password is a well-known weak password or a simple variation of one. */
export function isCommonPassword(password: string): boolean {
  if (!password) return false;
  const bases = candidateBases(password);
  if (bases.some((b) => WEAK_SET.has(b))) return true;
  // Same word repeated, e.g. "PasswordPassword1!" or "qwertyqwerty"
  return bases.some((b) => {
    for (const w of WEAK_SET) {
      if (w.length >= 4 && b.length >= w.length * 2 && b === w.repeat(b.length / w.length)) return true;
    }
    return false;
  });
}

export interface PasswordContext {
  email?: string | null;
  name?: string | null;
}

/** Name or email-based pieces (4+ letters) that must not appear in the password. */
function personalTokens(ctx: PasswordContext): string[] {
  const tokens: string[] = [];
  const local = (ctx.email ?? "").split("@")[0]?.toLowerCase() ?? "";
  tokens.push(...local.split(/[^a-z0-9]+/));
  if (local.replace(/[^a-z0-9]/g, "").length >= 4) tokens.push(local.replace(/[^a-z0-9]/g, ""));
  tokens.push(...(ctx.name ?? "").toLowerCase().split(/[^a-z0-9\u00c0-\u024f]+/));
  return [...new Set(tokens.filter((t) => t.length >= 4))];
}

export function containsPersonalInfo(password: string, ctx: PasswordContext = {}): boolean {
  if (!password) return false;
  const lower = password.toLowerCase();
  const plain = deLeet(lower);
  return personalTokens(ctx).some((t) => lower.includes(t) || plain.includes(t));
}

/** Too few distinct characters or a plain run like "aaaa" / "1234" / "abcd". */
export function isTooPredictable(password: string): boolean {
  if (!password) return false;
  if (new Set(password.toLowerCase()).size < 5) return true;
  return /(.)\1{3,}/.test(password);
}

export type PasswordStrength = "weak" | "fair" | "good" | "strong";

export interface PasswordCriterion {
  id: "length" | "upper" | "lower" | "number" | "special" | "common" | "personal";
  label: string;
  met: boolean;
}

export interface PasswordAnalysis {
  criteria: PasswordCriterion[];
  /** 0–5 */
  score: number;
  strength: PasswordStrength;
  isCommon: boolean;
  hasPersonalInfo: boolean;
  isPredictable: boolean;
  /** True when the password may be used. */
  acceptable: boolean;
  /** First problem to show the person, or null when acceptable. */
  error: string | null;
}

export function analyzePassword(password: string, ctx: PasswordContext = {}): PasswordAnalysis {
  const pw = password ?? "";
  const isCommon = isCommonPassword(pw);
  const hasPersonalInfo = containsPersonalInfo(pw, ctx);
  const isPredictable = isTooPredictable(pw);
  const hasContext = Boolean(ctx.email || ctx.name);

  const criteria: PasswordCriterion[] = [
    { id: "length", label: `At least ${PASSWORD_MIN_LENGTH} characters`, met: pw.length >= PASSWORD_MIN_LENGTH },
    { id: "upper", label: "Contains uppercase letter", met: /[A-Z]/.test(pw) },
    { id: "lower", label: "Contains lowercase letter", met: /[a-z]/.test(pw) },
    { id: "number", label: "Contains number", met: /\d/.test(pw) },
    { id: "special", label: "Contains special character (!@#$%^&*)", met: SPECIAL_RE.test(pw) },
    { id: "common", label: "Not a common or easy-to-guess password", met: pw.length > 0 && !isCommon && !isPredictable },
  ];
  if (hasContext) {
    criteria.push({ id: "personal", label: "Doesn't include your name or email", met: pw.length > 0 && !hasPersonalInfo });
  }

  const basicMet = criteria.filter((c) => ["length", "upper", "lower", "number", "special"].includes(c.id) && c.met).length;
  const blocked = isCommon || hasPersonalInfo || isPredictable;
  // A weak-listed, personal or predictable password is capped at "weak".
  const score = blocked ? Math.min(basicMet, 1) : basicMet;
  const strength: PasswordStrength = score <= 2 ? "weak" : score === 3 ? "fair" : score === 4 ? "good" : "strong";

  let error: string | null = null;
  if (!pw) error = "Enter a password.";
  else if (pw.length > PASSWORD_MAX_LENGTH) error = `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`;
  else if (isCommon) error = "This password is too common and easy to guess. Choose something more unique.";
  else if (hasPersonalInfo) error = "Don't use your name or email in your password.";
  else if (isPredictable) error = "This password is too predictable. Avoid repeated characters.";
  else if (basicMet < 5)
    error = `Password must be at least ${PASSWORD_MIN_LENGTH} characters with uppercase, lowercase, number, and special character.`;

  return { criteria, score, strength, isCommon, hasPersonalInfo, isPredictable, acceptable: error === null, error };
}

/** Returns the reason a password is rejected, or null when it may be used. */
export function getPasswordError(password: string, ctx: PasswordContext = {}): string | null {
  return analyzePassword(password, ctx).error;
}

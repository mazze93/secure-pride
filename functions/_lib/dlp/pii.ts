import { type PIIMatch, DataClassification } from "./types.js";

type MaskFn = (matched: string) => string;
type PIIPatternDef = readonly [string, DataClassification, RegExp, MaskFn];

const maskEmail: MaskFn = (matched) => {
  const atIdx = matched.indexOf("@");
  return `${matched[0]}***@${matched.slice(atIdx + 1)}`;
};

const maskPhone: MaskFn = (matched) => {
  const digits = matched.replace(/\D/g, "");
  return `***-***-${digits.slice(-4)}`;
};

const maskSSN: MaskFn = (matched) => {
  const digits = matched.replace(/\D/g, "");
  return `***-**-${digits.slice(-4)}`;
};

const maskCreditCard: MaskFn = (matched) => {
  const digits = matched.replace(/\D/g, "");
  return `****-****-****-${digits.slice(-4)}`;
};

const maskAPIKey: MaskFn = () => "[REDACTED_API_KEY]";

const maskBearerToken: MaskFn = () => "Bearer [REDACTED_TOKEN]";

const maskPrivateKey: MaskFn = () => "[REDACTED_PRIVATE_KEY]";

const PII_PATTERNS: PIIPatternDef[] = [
  [
    "email",
    DataClassification.PII,
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    maskEmail,
  ],
  [
    "us_phone",
    DataClassification.PII,
    /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}(?!\d)/g,
    maskPhone,
  ],
  [
    "ssn",
    DataClassification.PII,
    /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g,
    maskSSN,
  ],
  [
    "credit_card",
    DataClassification.PCI,
    /\b(?:4\d{3}|5[1-5]\d{2}|3[47]\d{2}|6(?:011|5\d{2}))[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{1,4}\b/g,
    maskCreditCard,
  ],
  [
    "api_key_generic",
    DataClassification.CREDENTIAL,
    /(?:sk|pk|api|key|token|secret|password)[-_](?:[a-zA-Z0-9]+[-_])*[a-zA-Z0-9]{16,}/gi,
    maskAPIKey,
  ],
  [
    "bearer_token",
    DataClassification.CREDENTIAL,
    /Bearer\s+[a-zA-Z0-9\-._~+/]+=*/gi,
    maskBearerToken,
  ],
  [
    "aws_key",
    DataClassification.CREDENTIAL,
    /(?:AKIA|ASIA)[A-Z0-9]{16}/g,
    maskAPIKey,
  ],
  [
    "private_key_header",
    DataClassification.CREDENTIAL,
    /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/g,
    maskPrivateKey,
  ],
] as const;

export function detectPII(text: string): PIIMatch[] {
  const matches: PIIMatch[] = [];

  for (const [typeName, classification, pattern, maskFn] of PII_PATTERNS) {
    for (const match of text.matchAll(pattern)) {
      matches.push({
        piiType: typeName,
        classification,
        original: match[0],
        masked: maskFn(match[0]),
        startPos: match.index!,
        endPos: match.index! + match[0].length,
      });
    }
  }

  return matches.sort((a, b) => a.startPos - b.startPos);
}

export function maskText(text: string): [string, PIIMatch[]] {
  const matches = detectPII(text);
  if (matches.length === 0) return [text, []];

  let result = text;
  // Replace right-to-left so earlier positions stay valid
  for (const match of [...matches].reverse()) {
    result = result.slice(0, match.startPos) + match.masked + result.slice(match.endPos);
  }
  return [result, matches];
}

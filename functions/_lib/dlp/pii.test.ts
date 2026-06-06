import { describe, it, expect } from "vitest";
import { detectPII, maskText } from "./pii.js";
import { DataClassification } from "./types.js";

describe("detectPII — email", () => {
  it("detects a plain email address", () => {
    const results = detectPII("Contact jane@example.com for info");
    expect(results.some((r) => r.piiType === "email")).toBe(true);
    const match = results.find((r) => r.piiType === "email")!;
    expect(match.classification).toBe(DataClassification.PII);
    expect(match.masked).toBe("j***@example.com");
    expect(match.original).toBe("jane@example.com");
  });

  it("masks email keeping first char + domain", () => {
    const [r] = detectPII("a@b.io");
    expect(r.masked).toBe("a***@b.io");
  });
});

describe("detectPII — phone", () => {
  it("detects US phone number", () => {
    const results = detectPII("Call me at 555-123-4567 any time");
    expect(results.some((r) => r.piiType === "us_phone")).toBe(true);
    const match = results.find((r) => r.piiType === "us_phone")!;
    expect(match.masked).toBe("***-***-4567");
  });
});

describe("detectPII — SSN", () => {
  it("detects SSN with dashes", () => {
    const results = detectPII("SSN: 123-45-6789");
    expect(results.some((r) => r.piiType === "ssn")).toBe(true);
    const match = results.find((r) => r.piiType === "ssn")!;
    expect(match.masked).toBe("***-**-6789");
    expect(match.classification).toBe(DataClassification.PII);
  });
});

describe("detectPII — credit card", () => {
  it("detects Visa card number", () => {
    const results = detectPII("Card: 4111111111111111");
    expect(results.some((r) => r.piiType === "credit_card")).toBe(true);
    const match = results.find((r) => r.piiType === "credit_card")!;
    expect(match.masked).toBe("****-****-****-1111");
    expect(match.classification).toBe(DataClassification.PCI);
  });
});

describe("detectPII — credentials", () => {
  it("detects generic API key", () => {
    const results = detectPII("token: sk-abc123def456ghi789jkl012");
    expect(results.some((r) => r.piiType === "api_key_generic")).toBe(true);
    const match = results.find((r) => r.piiType === "api_key_generic")!;
    expect(match.masked).toBe("[REDACTED_API_KEY]");
    expect(match.classification).toBe(DataClassification.CREDENTIAL);
  });

  it("detects bearer token", () => {
    const results = detectPII("Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.payload.sig");
    expect(results.some((r) => r.piiType === "bearer_token")).toBe(true);
    const match = results.find((r) => r.piiType === "bearer_token")!;
    expect(match.masked).toBe("Bearer [REDACTED_TOKEN]");
  });

  it("detects AWS access key", () => {
    const results = detectPII("AWS key: AKIAIOSFODNN7EXAMPLE");
    expect(results.some((r) => r.piiType === "aws_key")).toBe(true);
    const match = results.find((r) => r.piiType === "aws_key")!;
    expect(match.masked).toBe("[REDACTED_API_KEY]");
  });

  it("detects PEM private key header", () => {
    const results = detectPII("-----BEGIN RSA PRIVATE KEY-----");
    expect(results.some((r) => r.piiType === "private_key_header")).toBe(true);
    const match = results.find((r) => r.piiType === "private_key_header")!;
    expect(match.masked).toBe("[REDACTED_PRIVATE_KEY]");
  });
});

describe("detectPII — clean text", () => {
  it("returns empty array for text with no PII", () => {
    const results = detectPII("Hello, I would like help writing a grant proposal for our LGBTQ+ youth center.");
    expect(results).toHaveLength(0);
  });
});

describe("detectPII — result ordering", () => {
  it("returns matches sorted by position (earliest first)", () => {
    const results = detectPII("jane@test.com then 555-111-2222 later");
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results[0].startPos).toBeLessThan(results[1].startPos);
  });
});

describe("maskText", () => {
  it("replaces all PII in text with masked values", () => {
    const [masked] = maskText("Email: test@corp.com");
    expect(masked).not.toContain("test@corp.com");
    expect(masked).toContain("t***@corp.com");
  });

  it("handles multiple PII items in one string", () => {
    const [masked, matches] = maskText("jane@test.com and 555-123-4567");
    expect(matches.length).toBeGreaterThanOrEqual(2);
    expect(masked).not.toContain("jane@test.com");
    expect(masked).not.toContain("555-123-4567");
  });

  it("returns unchanged text and empty array when no PII", () => {
    const [masked, matches] = maskText("Nothing sensitive here.");
    expect(masked).toBe("Nothing sensitive here.");
    expect(matches).toHaveLength(0);
  });

  it("preserves text outside PII spans", () => {
    const [masked] = maskText("Before jane@test.com after");
    expect(masked).toMatch(/^Before .+ after$/);
  });
});

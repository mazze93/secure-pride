import { describe, expect, it } from "vitest";
import {
  parseScanResponse,
  redactedDraft,
  scanFindings,
  scanSummary,
  type ScanResponse,
} from "./scanner-results";
const clean: ScanResponse = {
  trace_id: "synthetic-test",
  blocked: false,
  action: "log_only",
  injection_count: 0,
  injections: [],
  pii_count: 0,
  pii_matches: [],
  policy_violations: [],
};

describe("scanner result boundaries", () => {
  it("does not equate a no-match result with safety", () => {
    expect(scanSummary(clean)).toBe("No matching patterns detected");
    expect(redactedDraft(clean)).toBeNull();
  });
  it("makes policy-only blocks visible and never offers their draft", () => {
    const blocked: ScanResponse = {
      ...clean,
      blocked: true,
      action: "block",
      policy_violations: ["Input rejected"],
      masked_text: "untrusted draft",
    };
    expect(scanSummary(blocked)).toBe("Do not share this submission");
    expect(scanFindings(blocked)).toContainEqual({
      name: "Policy finding",
      detail: "Input rejected",
      kind: "block",
    });
    expect(redactedDraft(blocked)).toBeNull();
  });
  it("offers exactly the API redacted draft only for masking", () => {
    const masked: ScanResponse = {
      ...clean,
      action: "mask_and_allow",
      masked_text: "Contact [EMAIL]",
      pii_count: 1,
      pii_matches: [
        { pii_type: "email", classification: "pii", masked: "[EMAIL]" },
      ],
    };
    expect(parseScanResponse(masked)).toEqual(masked);
    expect(scanSummary(masked)).toBe("Review required");
    expect(redactedDraft(masked)).toBe("Contact [EMAIL]");
  });
  it("does not call medium-severity or policy-only findings clear", () => {
    expect(
      scanSummary({
        ...clean,
        injections: [
          {
            pattern_name: "synthetic",
            severity: "medium",
            description: "Review this",
          },
        ],
        injection_count: 1,
      }),
    ).toBe("Review required");
    expect(scanSummary({ ...clean, policy_violations: ["Review this"] })).toBe(
      "Review required",
    );
  });
  it.each([
    null,
    {},
    { ...clean, blocked: true },
    { ...clean, injection_count: 1 },
    { ...clean, action: "mask_and_allow" },
    { ...clean, policy_violations: [null] },
    { ...clean, pii_matches: [{ pii_type: "email" }], pii_count: 1 },
  ])("rejects malformed or inconsistent results: %j", (value) => {
    expect(() => parseScanResponse(value)).toThrow("unexpected response");
  });
});

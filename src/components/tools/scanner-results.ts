export interface ScanResponse {
  trace_id: string;
  blocked: boolean;
  action: "block" | "mask_and_allow" | "log_only";
  masked_text?: string;
  injection_count: number;
  injections: {
    pattern_name: string;
    severity: "critical" | "high" | "medium" | "low";
    description: string;
  }[];
  pii_count: number;
  pii_matches: { pii_type: string; classification: string; masked: string }[];
  policy_violations: string[];
}

export interface Finding {
  name: string;
  detail: string;
  kind: "block" | "review";
}
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

// Fail visibly on invalid contracts instead of converting missing fields into assurance.
export function parseScanResponse(value: unknown): ScanResponse {
  if (
    !record(value) ||
    typeof value.trace_id !== "string" ||
    typeof value.blocked !== "boolean" ||
    !["block", "mask_and_allow", "log_only"].includes(String(value.action)) ||
    !Number.isInteger(value.injection_count) ||
    !Number.isInteger(value.pii_count) ||
    !Array.isArray(value.injections) ||
    !Array.isArray(value.pii_matches) ||
    !Array.isArray(value.policy_violations) ||
    !value.policy_violations.every((item) => typeof item === "string") ||
    value.injection_count !== value.injections.length ||
    value.pii_count !== value.pii_matches.length ||
    (value.masked_text !== undefined &&
      typeof value.masked_text !== "string") ||
    !value.injections.every(
      (item) =>
        record(item) &&
        typeof item.pattern_name === "string" &&
        typeof item.description === "string" &&
        ["critical", "high", "medium", "low"].includes(String(item.severity)),
    ) ||
    !value.pii_matches.every(
      (item) =>
        record(item) &&
        typeof item.pii_type === "string" &&
        typeof item.classification === "string" &&
        typeof item.masked === "string",
    ) ||
    value.blocked !== (value.action === "block") ||
    (value.action === "mask_and_allow" && typeof value.masked_text !== "string")
  ) {
    throw new Error(
      "The scanner returned an unexpected response. No result is available.",
    );
  }
  return value as unknown as ScanResponse;
}

export function scanSummary(result: ScanResponse): string {
  if (result.blocked) return "Do not share this submission";
  if (
    result.injection_count > 0 ||
    result.pii_count > 0 ||
    result.policy_violations.length > 0 ||
    result.action === "mask_and_allow"
  )
    return "Review required";
  return "No matching patterns detected";
}

export function scanFindings(result: ScanResponse): Finding[] {
  return [
    ...result.injections.map((item) => ({
      name: item.pattern_name.replace(/_/g, " "),
      detail: item.description,
      kind: (["high", "critical"].includes(item.severity)
        ? "block"
        : "review") as Finding["kind"],
    })),
    ...result.pii_matches.map((item) => ({
      name: item.pii_type.replace(/_/g, " "),
      detail: `Detected category: ${item.classification}`,
      kind: "review" as const,
    })),
    ...result.policy_violations.map((detail) => ({
      name: "Policy finding",
      detail,
      kind: result.blocked ? ("block" as const) : ("review" as const),
    })),
  ];
}

export function redactedDraft(result: ScanResponse): string | null {
  // A blocking result must never offer a draft as a suggested way past the block.
  return !result.blocked &&
    result.action === "mask_and_allow" &&
    typeof result.masked_text === "string"
    ? result.masked_text
    : null;
}

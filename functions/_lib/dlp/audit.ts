import type { AuditEntry, DataClassification, ScanAction, Severity } from "./types.js";

const DEFAULT_SALT = "secure-pride-default-salt";

/**
 * One-way hash of actor identity for the audit trail. Never stores raw
 * identity. Salt prevents rainbow-table attacks on common actor IDs.
 * Matches the original Python design (SHA-256, salted, truncated to 16 hex
 * chars) — swapped for Web Crypto's async digest, since Workers/Pages
 * Functions don't have Node's synchronous `crypto` module.
 */
export async function hashActor(actorId: string, salt = DEFAULT_SALT): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${actorId}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex.slice(0, 16);
}

export interface LogScanParams {
  traceId: string;
  actorId: string;
  classificationsFound: DataClassification[];
  injectionDetected: boolean;
  maxSeverity: Severity | null;
  policyAction: ScanAction;
  piiTypesFound: string[];
  inputLength: number;
  blocked: boolean;
  salt?: string;
}

/**
 * Log a DLP scan event. Called on every scan, even clean ones — matching
 * the original design's "always audit" intent. Emits one structured JSON
 * line via console.log; Cloudflare Workers Logs captures stdout and can
 * forward it via Logpush to any external SIEM, same end goal as the
 * original file-based logger, without needing a new binding.
 */
export async function logScan(params: LogScanParams): Promise<AuditEntry> {
  const entry: AuditEntry = {
    trace_id: params.traceId,
    timestamp: new Date().toISOString(),
    actor_hash: await hashActor(params.actorId, params.salt),
    action: "dlp_scan",
    classifications_found: params.classificationsFound,
    injection_detected: params.injectionDetected,
    max_severity: params.maxSeverity,
    policy_action: params.policyAction,
    pii_types_found: params.piiTypesFound,
    input_length: params.inputLength,
    blocked: params.blocked,
  };

  console.log(JSON.stringify(entry));
  return entry;
}

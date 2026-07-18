export enum Severity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum DataClassification {
  PUBLIC = "public",
  INTERNAL = "internal",
  PII = "pii",
  PHI = "phi",
  PCI = "pci",
  CREDENTIAL = "credential",
}

export enum ScanAction {
  LOG_ONLY = "log_only",
  MASK_AND_ALLOW = "mask_and_allow",
  BLOCK = "block",
}

export interface InjectionMatch {
  patternName: string;
  severity: Severity;
  matchedText: string;
  startPos: number;
  endPos: number;
  description: string;
}

export interface PIIMatch {
  piiType: string;
  classification: DataClassification;
  original: string;
  masked: string;
  startPos: number;
  endPos: number;
}

export interface DLPPolicy {
  name: string;
  classification: DataClassification;
  action: ScanAction;
}

export interface ScanResult {
  traceId: string;
  blocked: boolean;
  actionTaken: ScanAction;
  maskedText: string | null;
  injectionMatches: InjectionMatch[];
  piiMatches: PIIMatch[];
  maxInjectionSeverity: Severity | null;
  policyViolations: string[];
  classificationsFound: DataClassification[];
}

/**
 * Structured audit entry for a single DLP scan. Schema (including snake_case
 * field names) matches the original Python AuditLogger's JSON output, so any
 * downstream log ingestion built for that version keeps working unchanged.
 * Never contains raw actor identity, raw scanned text, or raw PII values.
 */
export interface AuditEntry {
  trace_id: string;
  timestamp: string;
  actor_hash: string;
  action: "dlp_scan";
  classifications_found: DataClassification[];
  injection_detected: boolean;
  max_severity: Severity | null;
  policy_action: ScanAction;
  pii_types_found: string[];
  input_length: number;
  blocked: boolean;
}

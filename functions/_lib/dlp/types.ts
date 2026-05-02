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

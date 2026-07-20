import {
  DataClassification,
  ScanAction,
  Severity,
  type DLPPolicy,
  type InjectionMatch,
  type PIIMatch,
  type ScanResult,
} from "./types.js";
import { detectInjections, getMaxSeverity } from "./patterns.js";
import { detectPII, maskText } from "./pii.js";
import { logScan } from "./audit.js";

const MAX_INPUT_LENGTH = 50_000;

const DEFAULT_POLICIES: DLPPolicy[] = [
  {
    name: "block_credentials",
    classification: DataClassification.CREDENTIAL,
    action: ScanAction.BLOCK,
  },
  {
    name: "mask_pii",
    classification: DataClassification.PII,
    action: ScanAction.MASK_AND_ALLOW,
  },
  {
    name: "block_phi",
    classification: DataClassification.PHI,
    action: ScanAction.BLOCK,
  },
  {
    name: "block_pci",
    classification: DataClassification.PCI,
    action: ScanAction.BLOCK,
  },
];

function buildPolicyMap(
  policies: DLPPolicy[]
): Map<DataClassification, DLPPolicy> {
  return new Map(policies.map((p) => [p.classification, p]));
}

function evaluatePolicies(
  injections: InjectionMatch[],
  piiMatches: PIIMatch[],
  classifications: DataClassification[],
  policyMap: Map<DataClassification, DLPPolicy>
): [ScanAction, string[]] {
  const violations: string[] = [];
  let maxAction = ScanAction.LOG_ONLY;

  if (injections.length > 0) {
    const sev = getMaxSeverity(injections)!;
    if (sev === Severity.CRITICAL || sev === Severity.HIGH) {
      return [ScanAction.BLOCK, [`Prompt injection: ${sev}`]];
    }
    violations.push(`Prompt injection: ${sev}`);
  }

  for (const classification of classifications) {
    const policy = policyMap.get(classification);
    if (!policy) continue;
    violations.push(`${policy.name}: ${classification} detected`);
    if (policy.action === ScanAction.BLOCK) {
      return [ScanAction.BLOCK, violations];
    }
    if (policy.action === ScanAction.MASK_AND_ALLOW) {
      maxAction = ScanAction.MASK_AND_ALLOW;
    }
  }

  return [maxAction, violations];
}

function blockedResult(traceId: string, reason: string): ScanResult {
  return {
    traceId,
    blocked: true,
    actionTaken: ScanAction.BLOCK,
    maskedText: null,
    injectionMatches: [],
    piiMatches: [],
    maxInjectionSeverity: null,
    policyViolations: [reason],
    classificationsFound: [],
  };
}

export async function scan(
  text: string,
  actorId = "anonymous",
  policies = DEFAULT_POLICIES,
  auditSalt?: string
): Promise<ScanResult> {
  const traceId = crypto.randomUUID();
  const policyMap = buildPolicyMap(policies);

  // Size guard short-circuits before the audit log, matching the original
  // design — an oversized payload never reaches the pipeline that produces
  // the fields an audit entry needs.
  if (text.length > MAX_INPUT_LENGTH) {
    return blockedResult(
      traceId,
      "Input exceeds maximum length of 50,000 characters"
    );
  }

  const injectionMatches = detectInjections(text);
  const maxSeverity = getMaxSeverity(injectionMatches);
  const piiMatches = detectPII(text);
  const classificationsFound = [
    ...new Set(piiMatches.map((m) => m.classification)),
  ];

  const [action, violations] = evaluatePolicies(
    injectionMatches,
    piiMatches,
    classificationsFound,
    policyMap
  );

  const maskedText =
    action === ScanAction.MASK_AND_ALLOW ? maskText(text)[0] : null;

  const blocked = action === ScanAction.BLOCK;

  // Audit log — always, for every scan that reaches this point, clean or not.
  await logScan({
    traceId,
    actorId,
    classificationsFound,
    injectionDetected: injectionMatches.length > 0,
    maxSeverity,
    policyAction: action,
    piiTypesFound: piiMatches.map((m) => m.piiType),
    inputLength: text.length,
    blocked,
    salt: auditSalt,
  });

  return {
    traceId,
    blocked,
    actionTaken: action,
    maskedText,
    injectionMatches,
    piiMatches,
    maxInjectionSeverity: maxSeverity,
    policyViolations: violations,
    classificationsFound,
  };
}

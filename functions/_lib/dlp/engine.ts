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

export function scan(
  text: string,
  _actorId = "anonymous",
  policies = DEFAULT_POLICIES
): ScanResult {
  const traceId = crypto.randomUUID();
  const policyMap = buildPolicyMap(policies);

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

  return {
    traceId,
    blocked: action === ScanAction.BLOCK,
    actionTaken: action,
    maskedText,
    injectionMatches,
    piiMatches,
    maxInjectionSeverity: maxSeverity,
    policyViolations: violations,
    classificationsFound,
  };
}

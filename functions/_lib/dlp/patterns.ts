import { type InjectionMatch, Severity } from "./types.js";

type PatternDef = readonly [string, RegExp, Severity, string];

const INJECTION_PATTERNS: PatternDef[] = [
  [
    "role_override",
    /(?:ignore|forget|disregard)\s+(?:all\s+)?(?:previous|prior|above|earlier)\s+(?:instructions?|rules?|prompts?|context)/gi,
    Severity.CRITICAL,
    "Attempt to override system instructions",
  ],
  [
    "system_prompt_extraction",
    /(?:show|reveal|print|output|repeat|display)\s+(?:your\s+)?(?:system\s+prompt|instructions?|initial\s+prompt|rules)/gi,
    Severity.HIGH,
    "Attempt to extract system prompt or instructions",
  ],
  [
    "role_impersonation",
    /(?:you\s+are\s+now|act\s+as|pretend\s+(?:to\s+be|you(?:'re|\s+are))|switch\s+to\s+(?:a\s+)?(?:new\s+)?(?:role|persona|mode))/gi,
    Severity.HIGH,
    "Attempt to reassign model identity or role",
  ],
  [
    "encoding_evasion",
    /(?:base64|rot13|hex|url.?encode|decode\s+this|unicode\s+escape)/gi,
    Severity.MEDIUM,
    "Possible encoding-based evasion technique",
  ],
  [
    "delimiter_injection",
    /(?:```\s*system|<\|(?:im_start|system|endoftext)\|>|\[INST\]|\[\/INST\]|<\/?s>|<<SYS>>)/gi,
    Severity.CRITICAL,
    "Injection of LLM control delimiters",
  ],
  [
    "data_exfiltration",
    /(?:send|post|fetch|curl|wget|upload|exfiltrate)\b[^\n]{0,120}?(?:https?:\/\/|ftp:\/\/)|(?:https?:\/\/|ftp:\/\/)\S+[^\n]{0,60}?\b(?:collect|upload|webhook|receiver?)\b/gi,
    Severity.HIGH,
    "Attempt to exfiltrate data via external request",
  ],
  [
    "jailbreak_keywords",
    /(?:DAN|do\s+anything\s+now|jailbreak|bypass\s+(?:filters?|safety|guardrails?)|developer\s+mode|god\s+mode|unrestricted\s+mode)/gi,
    Severity.CRITICAL,
    "Known jailbreak technique keywords",
  ],
  [
    "instruction_smuggling",
    /(?:hidden\s+instruction|secret\s+command|embedded\s+prompt|invisible\s+text|white\s+text\s+on\s+white)/gi,
    Severity.MEDIUM,
    "Possible hidden instruction smuggling",
  ],
] as const;

const SEVERITY_ORDER: Record<Severity, number> = {
  [Severity.CRITICAL]: 0,
  [Severity.HIGH]: 1,
  [Severity.MEDIUM]: 2,
  [Severity.LOW]: 3,
};

export function detectInjections(text: string): InjectionMatch[] {
  const matches: InjectionMatch[] = [];

  for (const [name, pattern, severity, description] of INJECTION_PATTERNS) {
    for (const match of text.matchAll(pattern)) {
      matches.push({
        patternName: name,
        severity,
        matchedText: match[0],
        startPos: match.index!,
        endPos: match.index! + match[0].length,
        description,
      });
    }
  }

  return matches.sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );
}

export function getMaxSeverity(matches: InjectionMatch[]): Severity | null {
  if (matches.length === 0) return null;
  return matches[0].severity;
}

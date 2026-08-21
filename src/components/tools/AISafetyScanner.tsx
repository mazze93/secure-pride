import { useCallback, useState } from "react";

// ─────────────────────────────────────────────────────────────
// API contract (unchanged — still the live TS scanner in
// functions/_lib/dlp/, not yet cut over to scanner-rs)
// ─────────────────────────────────────────────────────────────

interface InjectionResult {
  pattern_name: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
}

interface PIIResult {
  pii_type: string;
  classification: string;
  masked: string;
}

interface ScanResponse {
  trace_id: string;
  blocked: boolean;
  action: string;
  masked_text?: string;
  injection_count: number;
  injections: InjectionResult[];
  pii_count: number;
  pii_matches: PIIResult[];
  policy_violations: string[];
}

type ScanState = "idle" | "scanning" | "done" | "error";
type FindingStatus = "pass" | "warn" | "fail";

interface Finding {
  id: string;
  name: string;
  detail: string;
  status: FindingStatus;
}

// ─────────────────────────────────────────────────────────────
// Scoring — kept identical to the prior implementation; this is
// a presentation-layer rebuild, not a behavior change.
// ─────────────────────────────────────────────────────────────

function gaugeTarget(result: ScanResponse): number {
  if (result.blocked) return 20;
  if (result.pii_count > 0) return 55;
  return 85;
}

function postureLabel(pct: number): string {
  if (pct < 20) return "Fragile";
  if (pct < 50) return "Vulnerable";
  if (pct < 75) return "Baseline";
  return "Mended";
}

function buildFindings(result: ScanResponse): Finding[] {
  const findings: Finding[] = [];
  result.injections.forEach((inj, i) => {
    const isCriticalOrHigh = inj.severity === "critical" || inj.severity === "high";
    findings.push({
      id: `inj-${i}`,
      name: inj.pattern_name.replace(/_/g, " ").toUpperCase(),
      detail: inj.description,
      status: isCriticalOrHigh ? "fail" : "warn",
    });
  });
  result.pii_matches.forEach((pii, i) => {
    findings.push({
      id: `pii-${i}`,
      name: pii.pii_type.replace(/_/g, " ").toUpperCase(),
      detail: `Masked: ${pii.masked}`,
      status: "warn",
    });
  });
  if (!result.blocked && result.injection_count === 0 && result.pii_count === 0) {
    findings.push({
      id: "clear",
      name: "No threats detected",
      detail: "Text is safe to use with AI services",
      status: "pass",
    });
  }
  return findings;
}

// ─────────────────────────────────────────────────────────────
// Kintsugi seam gauge — the mended-pot metaphor, not a generic
// donut chart. A whole brass ring means nothing broke. Each
// finding fractures the ring into a colored seam segment: pink
// for a hard block, amber for something masked, sized to how
// many findings there are, gold for what's still intact.
// ─────────────────────────────────────────────────────────────

interface SeamGaugeProps {
  percent: number;
  state: ScanState;
  findings: Finding[];
}

const STATUS_STROKE: Record<FindingStatus, string> = {
  pass: "var(--sp-brass-highlight)",
  warn: "var(--sp-status-warning)",
  fail: "var(--sp-status-blocked)",
};

function SeamGauge({ percent, state, findings }: SeamGaugeProps) {
  const r = 68;
  const circumference = 2 * Math.PI * r;
  const cracks = findings.filter((f) => f.status !== "pass");
  const isMended = state === "done" && cracks.length === 0;
  const isScanning = state === "scanning";

  const verdict =
    state === "idle"
      ? "—"
      : isScanning
        ? "SCANNING"
        : state === "error"
          ? "ERROR"
          : cracks.some((f) => f.status === "fail")
            ? "BLOCKED"
            : cracks.length > 0
              ? "REVIEW"
              : "CLEAR";

  const verdictColor =
    verdict === "BLOCKED" ? "var(--sp-status-blocked)" : verdict === "REVIEW" ? "var(--sp-status-warning)" : verdict === "CLEAR" ? "var(--sp-status-protected)" : "var(--sp-text-secondary)";

  // Segment layout: whole ring in brass when idle/mended; otherwise
  // one seam arc per finding (capped so a noisy scan doesn't turn
  // into visual static), remainder stays brass.
  const maxSegments = 10;
  const segments = cracks.slice(0, maxSegments);
  const gapDeg = segments.length > 1 ? 3 : 0;
  const segLen = segments.length > 0 ? 360 / segments.length : 360;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="168" height="168" viewBox="0 0 168 168" aria-hidden="true">
        <defs>
          <filter id="seam-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor={verdictColor} floodOpacity="0.55" />
          </filter>
          <linearGradient id="brass-arc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--sp-brass-highlight)" />
            <stop offset="100%" stopColor="var(--sp-brass)" />
          </linearGradient>
        </defs>

        {/* track */}
        <circle cx="84" cy="84" r={r} fill="none" stroke="var(--sp-border)" strokeWidth="9" />

        {isScanning ? (
          <circle
            cx="84"
            cy="84"
            r={r}
            fill="none"
            stroke="var(--sp-cyan)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.22} ${circumference}`}
            transform="rotate(-90 84 84)"
            style={{ transformOrigin: "84px 84px", animation: "seamSweep 1.1s linear infinite" }}
          />
        ) : segments.length === 0 ? (
          <circle
            cx="84"
            cy="84"
            r={r}
            fill="none"
            stroke={state === "done" ? "url(#brass-arc)" : "var(--sp-border)"}
            strokeWidth="9"
            strokeLinecap="round"
            filter={isMended ? "url(#seam-glow)" : undefined}
            style={{ transition: "stroke 0.4s ease" }}
          />
        ) : (
          segments.map((f, i) => {
            const start = i * (segLen + gapDeg) - 90;
            return (
              <circle
                key={f.id}
                cx="84"
                cy="84"
                r={r}
                fill="none"
                stroke={STATUS_STROKE[f.status]}
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={`${(circumference * (segLen - gapDeg)) / 360} ${circumference}`}
                transform={`rotate(${start} 84 84)`}
                filter="url(#seam-glow)"
                style={{ transition: "stroke 0.4s ease" }}
              />
            );
          })
        )}

        <text x="84" y="80" textAnchor="middle" fontFamily="var(--font-heading)" fontWeight={700} fontSize="17" letterSpacing="0.04em" fill={verdictColor}>
          {verdict}
        </text>
        <text x="84" y="100" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="var(--sp-text-muted)">
          {state === "done" ? `${Math.round(percent)}% ${postureLabel(percent)}` : "awaiting input"}
        </text>
      </svg>
      <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-text-muted">Repair status</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Finding row
// ─────────────────────────────────────────────────────────────

interface FindingRowProps {
  finding: Finding;
  index: number;
}

const STATUS_PILL: Record<FindingStatus, string> = {
  pass: "bg-status-protected/10 text-status-protected border-status-protected/30",
  warn: "bg-status-warning/10 text-status-warning border-status-warning/30",
  fail: "bg-status-blocked/10 text-status-blocked border-status-blocked/30",
};

const STATUS_EDGE: Record<FindingStatus, string> = {
  pass: "border-l-status-protected",
  warn: "border-l-status-warning",
  fail: "border-l-status-blocked",
};

function FindingRow({ finding, index }: FindingRowProps) {
  return (
    <div
      style={{ opacity: 0, animation: `fadeUp 0.4s ease ${index * 90}ms forwards` }}
      className={`rounded-md border border-dark-border border-l-[3px] ${STATUS_EDGE[finding.status]} bg-dark-elevated/70 px-4 py-3`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-heading text-[0.9rem] font-semibold text-text-primary truncate">{finding.name}</p>
          <p className="mt-0.5 text-[0.8rem] text-text-secondary">{finding.detail}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.08em] ${STATUS_PILL[finding.status]}`}>
          {finding.status === "pass" ? "clear" : finding.status === "warn" ? "masked" : "blocked"}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

export default function AISafetyScanner() {
  const [text, setText] = useState("");
  const [state, setState] = useState<ScanState>("idle");
  const [findings, setFindings] = useState<Finding[]>([]);
  const [gaugeValue, setGaugeValue] = useState(0);
  const [totalIssues, setTotalIssues] = useState<number | null>(null);
  const [injectionCount, setInjectionCount] = useState<number | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const runScan = useCallback(async () => {
    if (!text.trim()) return;
    setState("scanning");
    setFindings([]);
    setGaugeValue(0);
    setBlocked(false);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), actor_id: "anonymous" }),
      });

      if (res.status === 429) {
        setErrorMsg("Too many requests — please wait a moment and try again.");
        setState("error");
        return;
      }
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { detail?: string };
        setErrorMsg(err.detail ?? "Scanner error — please try again.");
        setState("error");
        return;
      }

      const result = (await res.json()) as ScanResponse;
      const f = buildFindings(result);
      setBlocked(result.blocked);
      setTotalIssues(result.injection_count + result.pii_count);
      setInjectionCount(result.injection_count);
      setFindings(f);
      setGaugeValue(gaugeTarget(result));
      setState("done");
    } catch {
      setErrorMsg("Scanner unavailable — check your connection.");
      setState("error");
    }
  }, [text]);

  const clear = useCallback(() => {
    setText("");
    setState("idle");
    setFindings([]);
    setGaugeValue(0);
    setTotalIssues(null);
    setInjectionCount(null);
    setBlocked(false);
    setErrorMsg("");
  }, []);

  const isEmpty = text.trim().length === 0;
  const isScanning = state === "scanning";

  return (
    <div className="min-h-screen bg-dark-bg text-text-primary">
      <div className="mx-auto max-w-[1120px] px-6 py-12 md:py-16">
        {/* Header */}
        <div style={{ opacity: 0, animation: "fadeUp 0.5s ease 0s forwards" }} className="mb-8 max-w-[640px]">
          <p className="mb-3 inline-flex items-center gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-brand-electric">
            <span className="h-[6px] w-[6px] rounded-full bg-brand-electric" aria-hidden="true" />
            AI Safety Scanner
          </p>
          <h1 className="font-heading text-[1.9rem] font-bold normal-case leading-tight tracking-[-0.01em] text-text-primary">
            Find the cracks before you paste.
          </h1>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-text-secondary">
            Scans text for prompt injection, credentials, and PII before it reaches an AI service — entirely server-side, nothing stored.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: terminal-chrome input + results */}
          <div
            style={{ opacity: 0, animation: "fadeUp 0.5s ease 120ms forwards" }}
            className="lg:col-span-2 overflow-hidden rounded-xl border border-dark-borderGlow bg-dark-surface"
          >
            <div className="h-[2px] w-full" style={{ background: "var(--grad-rainbow)", opacity: 0.7 }} aria-hidden="true" />
            <div className="flex items-center gap-2 border-b border-dark-border bg-dark-elevated px-4 py-[0.6rem]">
              <span className="h-[10px] w-[10px] rounded-full bg-status-blocked/70" aria-hidden="true" />
              <span className="h-[10px] w-[10px] rounded-full bg-status-warning/70" aria-hidden="true" />
              <span className="h-[10px] w-[10px] rounded-full bg-status-protected/70" aria-hidden="true" />
              <span className="ml-3 rounded-md border border-dark-border bg-dark-surface px-3 py-[0.15rem] font-mono text-[0.7rem] text-text-muted">
                scan-input.txt
              </span>
            </div>

            <div className="p-5 space-y-4">
              <label htmlFor="scanInput" className="sr-only">
                Text to scan
              </label>
              <textarea
                id="scanInput"
                aria-describedby="scan-hint"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                placeholder="Paste text here…"
                className="w-full resize-y rounded-lg border border-dark-border bg-dark-bg p-4 font-mono text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-electric"
              />
              <p id="scan-hint" className="sr-only">
                Paste the text you want to scan for PII and prompt injection patterns.
              </p>

              <div className="flex gap-3">
                <button
                  id="initScanBtn"
                  type="button"
                  onClick={runScan}
                  disabled={isEmpty || isScanning}
                  aria-busy={isScanning}
                  className="min-h-[44px] rounded-full bg-brand-electric px-6 py-2.5 font-heading text-sm font-bold uppercase tracking-[0.06em] text-dark-void transition-all duration-250 hover:bg-neon-cyan hover:-translate-y-0.5 hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {isScanning ? "Scanning…" : "Run scan"}
                </button>
                <button
                  type="button"
                  onClick={clear}
                  className="min-h-[44px] rounded-full border border-dark-borderGlow px-6 py-2.5 font-heading text-sm font-bold uppercase tracking-[0.06em] text-text-secondary transition-all duration-250 hover:border-brand-electric hover:text-brand-electric"
                >
                  Clear
                </button>
              </div>

              {/* Results feed */}
              <div id="auditFeed" role="status" aria-live="polite" aria-label="Scan results" className="min-h-[80px] space-y-2 pt-2">
                {state === "idle" && (
                  <div className="rounded-lg border border-dark-border bg-dark-bg/60 p-5 text-center">
                    <p className="text-sm text-text-secondary">Paste text above to begin scanning</p>
                    <p className="mt-1 text-xs text-text-muted">Detects PII, credentials, and prompt injection patterns</p>
                  </div>
                )}
                {isScanning && (
                  <div className="rounded-lg border border-dark-border bg-dark-bg/60 p-5 text-center" style={{ animation: "statusPulse 1.4s ease-in-out infinite" }}>
                    <p className="text-sm text-text-secondary">Scanning…</p>
                    <p className="mt-1 text-xs text-text-muted">Checking for PII and injection patterns</p>
                  </div>
                )}
                {state === "error" && (
                  <div role="alert" className="rounded-lg border border-status-blocked/40 bg-status-blocked/10 p-4 text-sm text-status-blocked">
                    {errorMsg}
                  </div>
                )}
                {state === "done" && blocked && (
                  <div role="alert" className="rounded-lg border border-status-blocked/50 bg-status-blocked/15 px-4 py-3 font-heading text-sm font-bold text-status-blocked">
                    Scan blocked — sensitive content detected. Do not send this text to an AI service.
                  </div>
                )}
                {findings.map((f, i) => (
                  <FindingRow key={f.id} finding={f} index={i} />
                ))}
              </div>
            </div>
          </div>

          {/* Right: gauge + summary */}
          <div style={{ opacity: 0, animation: "fadeUp 0.5s ease 220ms forwards" }} className="space-y-4">
            <div className="flex flex-col items-center rounded-xl border border-dark-borderGlow bg-dark-surface p-5">
              <SeamGauge percent={gaugeValue} state={state} findings={findings} />
            </div>

            <div className="space-y-3 rounded-xl border border-dark-borderGlow bg-dark-surface p-5">
              <h2 className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-text-muted">Scan summary</h2>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Total issues</span>
                <span id="totalCreds" className="font-mono font-semibold text-text-primary">
                  {totalIssues ?? "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Injections</span>
                <span id="legacyCount" className={`font-mono font-semibold ${injectionCount ? "text-status-blocked" : "text-text-primary"}`}>
                  {injectionCount ?? "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Status</span>
                <span
                  className={`font-heading text-xs font-bold uppercase tracking-[0.06em] ${
                    state === "done" ? (blocked ? "text-status-blocked" : "text-status-protected") : "text-text-muted"
                  }`}
                >
                  {state === "done" ? (blocked ? "Blocked" : "Clear") : "—"}
                </span>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-text-muted">
              All scanning happens server-side. No text is stored or logged. No tracking.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes seamSweep {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -${2 * Math.PI * 68}; }
        }
      `}</style>
    </div>
  );
}

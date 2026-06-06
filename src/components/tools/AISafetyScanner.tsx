import { useState, useCallback } from "react";

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

interface Finding {
  name: string;
  detail: string;
  status: "pass" | "warn" | "fail";
  score: number;
}

function severityScore(s: InjectionResult["severity"]): number {
  return s === "critical" ? -25 : s === "high" ? -20 : -10;
}

function gaugeTarget(result: ScanResponse): number {
  if (result.blocked) return 20;
  if (result.pii_count > 0) return 55;
  return 85;
}

function postureLabel(pct: number): string {
  if (pct < 20) return "Fragile";
  if (pct < 50) return "Vulnerable";
  if (pct < 75) return "Baseline";
  return "Robust";
}

function buildFindings(result: ScanResponse): Finding[] {
  const findings: Finding[] = [];
  for (const inj of result.injections) {
    const isCriticalOrHigh = inj.severity === "critical" || inj.severity === "high";
    findings.push({
      name: inj.pattern_name.replace(/_/g, " ").toUpperCase(),
      detail: inj.description,
      status: isCriticalOrHigh ? "fail" : "warn",
      score: severityScore(inj.severity),
    });
  }
  for (const pii of result.pii_matches) {
    findings.push({
      name: pii.pii_type.replace(/_/g, " ").toUpperCase(),
      detail: `Masked: ${pii.masked}`,
      status: "warn",
      score: -8,
    });
  }
  if (!result.blocked && result.injection_count === 0 && result.pii_count === 0) {
    findings.push({
      name: "No threats detected",
      detail: "Text is safe to use with AI services",
      status: "pass",
      score: 30,
    });
  }
  return findings;
}

function GaugeCircle({ percent }: { percent: number }) {
  const r = 70;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;
  const color = percent >= 75 ? "#22c55e" : percent >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="160" height="160" viewBox="0 0 160 160" aria-hidden="true">
        <circle cx="80" cy="80" r={r} fill="none" stroke="#1e293b" strokeWidth="10" />
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 80 80)"
          style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.4s ease" }}
        />
        <text x="80" y="76" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">
          {Math.round(percent)}%
        </text>
        <text x="80" y="98" textAnchor="middle" fill="#94a3b8" fontSize="12">
          {postureLabel(percent)}
        </text>
      </svg>
      <span className="text-xs text-slate-400 uppercase tracking-widest">Confidence</span>
    </div>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  const pillColors: Record<Finding["status"], string> = {
    pass: "bg-green-900 text-green-300",
    warn: "bg-yellow-900 text-yellow-300",
    fail: "bg-red-900 text-red-300",
  };
  const scoreColor =
    finding.status === "pass" ? "text-green-400" : finding.status === "warn" ? "text-yellow-400" : "text-red-400";

  return (
    <div className="rounded border border-slate-700 bg-slate-800/60 p-3 space-y-1">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-slate-100">{finding.name}</div>
          <div className="text-xs text-slate-400 mt-0.5">{finding.detail}</div>
        </div>
        <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${pillColors[finding.status]}`}>
          {finding.status.toUpperCase()}
        </span>
      </div>
      <div className={`text-xs font-mono ${scoreColor}`}>
        Score: {finding.score > 0 ? "+" : ""}{finding.score}
      </div>
    </div>
  );
}

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
        const err = await res.json().catch(() => ({})) as { detail?: string };
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
      setTimeout(() => setGaugeValue(gaugeTarget(result)), (f.length - 1) * 120 + 100);
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
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Safety Scanner</h1>
          <p className="text-slate-400 text-sm mt-1">
            Paste text before sending it to an AI service. Detects PII, credentials, and prompt injection.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: input + results */}
          <div className="lg:col-span-2 space-y-4">
            <textarea
              id="scanInput"
              aria-label="Text to scan"
              aria-describedby="scan-hint"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              placeholder="Paste text here…"
              className="w-full rounded border border-slate-700 bg-slate-800 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y font-mono"
            />
            <p id="scan-hint" className="sr-only">
              Paste the text you want to scan for PII and prompt injection patterns.
            </p>

            <div className="flex gap-3">
              <button
                id="initScanBtn"
                onClick={runScan}
                disabled={isEmpty || isScanning}
                aria-busy={isScanning}
                className="rounded bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isScanning ? "Scanning…" : "Run Scan"}
              </button>
              <button
                onClick={clear}
                className="rounded border border-slate-600 px-5 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Results feed */}
            <div
              id="auditFeed"
              role="status"
              aria-live="polite"
              aria-label="Scan results"
              className="space-y-2 min-h-[80px]"
            >
              {state === "idle" && (
                <div className="rounded border border-slate-700 bg-slate-800/40 p-4 text-center">
                  <p className="text-slate-400 text-sm">Paste text above to begin scanning</p>
                  <p className="text-slate-500 text-xs mt-1">Detects PII, credentials, and prompt injection patterns</p>
                </div>
              )}
              {isScanning && (
                <div className="rounded border border-slate-700 bg-slate-800/40 p-4 text-center animate-pulse">
                  <p className="text-slate-400 text-sm">Scanning…</p>
                  <p className="text-slate-500 text-xs mt-1">Checking for PII and injection patterns</p>
                </div>
              )}
              {state === "error" && (
                <div className="rounded border border-red-800 bg-red-900/30 p-4 text-sm text-red-300" role="alert">
                  {errorMsg}
                </div>
              )}
              {state === "done" && blocked && (
                <div
                  className="rounded border border-red-700 bg-red-900/40 px-4 py-3 text-sm font-semibold text-red-300"
                  role="alert"
                >
                  Scan blocked — sensitive content detected. Do not send this text to an AI service.
                </div>
              )}
              {findings.map((f, i) => (
                <div
                  key={i}
                  style={{ animationDelay: `${i * 120}ms` }}
                  className="animate-fade-in"
                >
                  <FindingCard finding={f} />
                </div>
              ))}
            </div>
          </div>

          {/* Right: gauge + stats */}
          <div className="space-y-4">
            <div className="rounded border border-slate-700 bg-slate-800/60 p-4 flex flex-col items-center">
              <GaugeCircle percent={gaugeValue} />
            </div>

            <div className="rounded border border-slate-700 bg-slate-800/60 p-4 space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Scan Summary
              </h2>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total issues</span>
                <span id="totalCreds" className="font-mono font-semibold">
                  {totalIssues ?? "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Injections</span>
                <span id="legacyCount" className={`font-mono font-semibold ${injectionCount ? "text-red-400" : ""}`}>
                  {injectionCount ?? "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Status</span>
                <span className={`font-semibold text-xs uppercase ${state === "done" ? (blocked ? "text-red-400" : "text-green-400") : "text-slate-500"}`}>
                  {state === "done" ? (blocked ? "Blocked" : "Clear") : "—"}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              All scanning happens server-side via Cloudflare Pages Functions. No text is stored or logged. No tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

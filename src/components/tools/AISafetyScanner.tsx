import { useEffect, useRef, useState } from "react";
import {
  parseScanResponse,
  redactedDraft,
  scanFindings,
  scanSummary,
  type ScanResponse,
} from "./scanner-results";

const EXAMPLE =
  "Please contact the fictional volunteer at sample@example.org about next week's meeting.";
const INPUT_LIMIT = 50_000;

export default function AISafetyScanner() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copyNotice, setCopyNotice] = useState("");
  const request = useRef<AbortController | null>(null);
  const revision = useRef(0);
  useEffect(
    () => () => {
      revision.current += 1;
      request.current?.abort();
    },
    [],
  );

  function changeInput(value: string) {
    // Results belong to exactly one submission. Editing or clearing invalidates them.
    revision.current += 1;
    request.current?.abort();
    request.current = null;
    setBusy(false);
    setText(value);
    setResult(null);
    setError("");
    setCopyNotice("");
  }

  async function runScan() {
    if (!text.trim() || busy) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const currentRevision = ++revision.current;
    setBusy(true);
    setResult(null);
    setError("");
    setCopyNotice("");
    const timeout = window.setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), actor_id: "anonymous" }),
        signal: controller.signal,
        cache: "no-store",
      });
      if (!response.ok) {
        if (response.status === 429)
          throw new Error("Too many requests. Wait a moment and try again.");
        throw new Error(
          "Scanner unavailable. No result is available; try again later.",
        );
      }
      const parsed = parseScanResponse(await response.json());
      if (currentRevision === revision.current && !controller.signal.aborted)
        setResult(parsed);
    } catch (failure) {
      if (currentRevision === revision.current)
        setError(
          controller.signal.aborted
            ? "The scan timed out. No result is available."
            : failure instanceof Error
              ? failure.message
              : "Scanner unavailable. No result is available.",
        );
    } finally {
      window.clearTimeout(timeout);
      if (currentRevision === revision.current) {
        setBusy(false);
        request.current = null;
      }
    }
  }

  async function copyDraft() {
    if (!result) return;
    const draft = redactedDraft(result);
    if (draft === null) return;
    const currentRevision = revision.current;
    try {
      await navigator.clipboard.writeText(draft);
      if (currentRevision === revision.current)
        setCopyNotice(
          "Draft copied. Review it before sharing; the clipboard may sync across devices.",
        );
    } catch {
      if (currentRevision === revision.current)
        setCopyNotice(
          "Clipboard access was unavailable. Select the draft and copy it manually.",
        );
    }
  }

  const draft = result ? redactedDraft(result) : null;
  const findings = result ? scanFindings(result) : [];
  const needsReview = result
    ? scanSummary(result) !== "No matching patterns detected"
    : false;

  return (
    <main className="mx-auto max-w-[960px] px-6 py-12 text-text-primary">
      <p
        className="mb-3 font-mono text-sm"
        style={{ color: "var(--sp-brass-light)" }}
      >
        Manual text check · Hosted on Cloudflare
      </p>
      <h1 className="font-heading text-4xl normal-case leading-tight tracking-normal">
        Check a draft before you share.
      </h1>
      <p className="mt-4 max-w-3xl text-text-secondary">
        Looks for known personal-data, credential, and prompt-injection
        patterns. It cannot establish that text is safe or protect your
        organization as a whole.
      </p>
      <aside
        aria-labelledby="processing-title"
        className="my-8 rounded-lg border border-dark-borderGlow bg-dark-surface p-5"
      >
        <h2
          id="processing-title"
          className="font-heading text-xl normal-case tracking-normal"
          style={{ color: "var(--sp-brass-light)" }}
        >
          Before you submit
        </h2>
        <p id="processing-notice" className="mt-2 text-text-secondary">
          Your text goes to our Cloudflare-hosted API. Do not submit real client
          records, passwords, health information, or identity details. Start
          with the invented example below.
        </p>
        <p className="mt-3 text-sm text-text-secondary">
          The application logs scan metadata, not submitted text. Hosting
          retention and processing locations remain unverified.{" "}
          <a href="/privacy" className="underline underline-offset-4">
            Read privacy and processing
          </a>
          .
        </p>
      </aside>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void runScan();
        }}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <label htmlFor="scanInput" className="font-semibold">
            Text to check
          </label>
          <button
            type="button"
            onClick={() => changeInput(EXAMPLE)}
            className="min-h-[44px] rounded-md border border-dark-borderGlow px-4 text-sm hover:bg-dark-elevated"
          >
            Use invented example
          </button>
        </div>
        <textarea
          id="scanInput"
          value={text}
          onChange={(event) => changeInput(event.target.value)}
          maxLength={INPUT_LIMIT}
          rows={9}
          aria-describedby="processing-notice scan-hint"
          className="w-full resize-y rounded-lg border border-dark-borderGlow bg-dark-surface p-4 font-mono text-sm text-text-primary placeholder:text-text-secondary"
          placeholder="Use example text you are authorized to share…"
        />
        <p id="scan-hint" className="mt-2 text-sm text-text-secondary">
          {text.length.toLocaleString()} / {INPUT_LIMIT.toLocaleString()}{" "}
          characters. Editing the text clears prior results.
        </p>
        <div className="my-5 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={!text.trim() || busy}
            aria-busy={busy}
            className="min-h-[44px] rounded-md px-6 py-3 font-semibold text-dark-bg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--sp-brass-light)" }}
          >
            {busy ? "Checking…" : "Run text check"}
          </button>
          <button
            type="button"
            onClick={() => changeInput("")}
            className="min-h-[44px] rounded-md border border-dark-borderGlow px-6 py-3"
          >
            Clear
          </button>
        </div>
      </form>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="text-text-secondary"
      >
        {busy
          ? "Checking this submission…"
          : result
            ? scanSummary(result)
            : "No current scan result."}
      </div>
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-dark-borderGlow bg-dark-surface p-4"
        >
          {error}
        </p>
      )}
      {result && (
        <section
          aria-labelledby="results-title"
          className="mt-6 rounded-lg border border-dark-borderGlow bg-dark-surface p-5"
        >
          <h2
            id="results-title"
            className="font-heading text-2xl normal-case tracking-normal"
            style={{ color: "var(--sp-brass-highlight)" }}
          >
            {scanSummary(result)}
          </h2>
          <p className="mt-3 text-text-secondary">
            {result.blocked
              ? "The scanner recommends withholding this submission. It has not blocked another app or AI provider; you control what happens next."
              : needsReview
                ? "Review each finding. A redacted draft can still contain sensitive context or missed patterns."
                : "This check found none of its known patterns. It may miss sensitive context, identities, or unfamiliar attacks. Review the text and your provider's data handling before sharing."}
          </p>
          <ul className="mt-4 space-y-3 list-none p-0">
            {findings.map((finding, index) => (
              <li
                key={`${finding.name}-${index}`}
                className="rounded-md border border-dark-border p-4"
              >
                <p className="font-semibold">
                  {finding.name}{" "}
                  <span className="text-sm text-text-secondary">
                    · {finding.kind === "block" ? "Withhold" : "Review"}
                  </span>
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  {finding.detail}
                </p>
              </li>
            ))}
          </ul>
          {draft !== null && (
            <div className="mt-6">
              <label htmlFor="redactedDraft" className="block font-semibold">
                Redacted draft — review before sharing
              </label>
              <p className="my-2 text-sm text-text-secondary">
                The original input above is unchanged. Review this version for
                missed details. Nothing is sent to an AI provider automatically.
              </p>
              <textarea
                id="redactedDraft"
                readOnly
                value={draft}
                rows={6}
                className="w-full resize-y rounded-md border border-dark-borderGlow bg-dark-bg p-4 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => void copyDraft()}
                className="mt-3 min-h-[44px] rounded-md border border-dark-borderGlow px-5 py-3"
              >
                Copy redacted draft
              </button>
              <p role="status" className="mt-2 text-sm text-text-secondary">
                {copyNotice}
              </p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

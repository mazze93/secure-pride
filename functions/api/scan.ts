import type { PagesFunction } from "@cloudflare/workers-types";
import { scan } from "../_lib/dlp/engine.js";

interface ScanRequestBody {
  text?: unknown;
  actor_id?: unknown;
}

export const onRequestPost: PagesFunction = async (context) => {
  let body: ScanRequestBody;

  try {
    body = (await context.request.json()) as ScanRequestBody;
  } catch {
    return Response.json({ detail: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body.text !== "string" || body.text.length === 0) {
    return Response.json(
      { detail: "text must be a non-empty string" },
      { status: 400 }
    );
  }
  if (body.text.length > 50_000) {
    return Response.json(
      { detail: "Input exceeds maximum length of 50,000 characters" },
      { status: 400 }
    );
  }
  if (body.text.includes("\x00")) {
    return Response.json(
      { detail: "Input contains null bytes" },
      { status: 400 }
    );
  }

  const actorId =
    typeof body.actor_id === "string" ? body.actor_id : "anonymous";
  const result = scan(body.text, actorId);

  return Response.json({
    trace_id: result.traceId,
    blocked: result.blocked,
    action: result.actionTaken,
    ...(result.maskedText !== null && { masked_text: result.maskedText }),
    injection_count: result.injectionMatches.length,
    injections: result.injectionMatches.map((m) => ({
      pattern_name: m.patternName,
      severity: m.severity,
      description: m.description,
    })),
    pii_count: result.piiMatches.length,
    pii_matches: result.piiMatches.map((m) => ({
      pii_type: m.piiType,
      classification: m.classification,
      masked: m.masked,
    })),
    policy_violations: result.policyViolations,
  });
};

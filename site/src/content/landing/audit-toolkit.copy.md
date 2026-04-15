## PROOF_BLOCK_START

Security is stewardship, not software theater.

- Targeting is asymmetric: small orgs get hit because they’re exposed, not because they’re “important.”
- Most compromises are boring: misconfigurations, weak email authentication, bad TLS modes, leaked secrets.
- Resilience is buildable: audit → fix → document → repeat.

Misconfigurations we routinely see:
- Flexible SSL + redirect loops
- Missing/weak DMARC enforcement
- Overexposed subdomains and admin surfaces
- Missing security headers / overly-permissive CSP
- Secrets committed to repos or printed in CI logs

What changes after an audit:
- Smaller public footprint
- Verifiable email authenticity
- Fewer easy phishing vectors
- Clear remediation backlog
- Repeatable audit cadence

## PROOF_BLOCK_END


## TOOLKIT_BLOCK_START

Layer 1 — Surface Audit
What the public internet can see.
- DNS posture (A/AAAA/CNAME/MX)
- TLS and certificate checks
- Redirect rules + loop detection
- Email authentication review (SPF/DKIM/DMARC)
- Subdomain exposure scan
Output: Prioritized exposure report.

Layer 2 — Configuration Integrity
What’s misconfigured (and how to fix it).
- Cloudflare settings review
- HSTS + security headers
- CSP baseline and gaps
- CI/CD + environment exposure patterns
Output: Pass/fail checklist + step-by-step remediation.

Layer 3 — Operational Hardening
The human layer attackers exploit.
- MFA enforcement guidance
- Admin surface reduction
- Registrar access review
- Secret storage practices
- Backup verification + incident readiness
Output: Resilience roadmap (impact vs effort).

## TOOLKIT_BLOCK_END


## DELIVERABLES_BLOCK_START

You receive:
- Findings report with severity tiers
- Remediation checklist with clear owners
- Configuration templates: DNS / TLS / Email auth / CSP
- Roadmap ranked by impact → effort
- Suggested cadence: quarterly / biannual

What this is not:
- Not surveillance
- Not tracking scripts
- Not a SaaS dashboard that holds your data

Deployment options:
- Self-Guided Audit: run locally, generate a report, apply fixes on your timeline.
- Guided Review: walk through findings with Secure Pride.
- Hardened Implementation: optional help implementing corrections.

## DELIVERABLES_BLOCK_END

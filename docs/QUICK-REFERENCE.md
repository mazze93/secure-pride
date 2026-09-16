# Secure Pride Copilot Instructions – Quick Reference Card

**Print or bookmark this page during development.**

---

## Mindful Development: Six-Step Cycle

```
Understand → Verify → Design → Build → Validate → Deploy
```

### At Each Step, Ask:

| Step | Questions |
|---|---|
| **Understand** | What's the goal? Who are we building for? What are constraints? |
| **Verify** | Does the API exist? Is it privacy-preserving? Are we hallucinating? |
| **Design** | Is this simple? Secure? Accessible? Why this approach? |
| **Build** | Is this production-ready? Edge cases handled? Secure? |
| **Validate** | What command tests this? Would it pass a unit test? |
| **Deploy** | Is the environment ready? Do we have a rollback plan? |

---

## Authority Matrix: What Needs Approval?

| Decision Type | Can I Decide? | Must I Document? | Requires Approval? |
|---|---|---|---|
| Code architecture, refactoring | ✅ Yes | No | ❌ No |
| Testing, verification commands | ✅ Yes | No | ❌ No |
| Tool/library recommendations | ✅ Yes | No | ❌ No (after verification) |
| Data schema, persistence | ⚠️ Conditional | **YES** | ❌ No (but document) |
| Security, encryption, auth | ⚠️ Conditional | **YES** | ❌ No (but document) |
| UX, accessibility, interface | ⚠️ Conditional | **YES** | ❌ No (but document) |
| Third-party service integration | ⚠️ Conditional | **YES** | ❌ No (verify privacy first) |
| **SOGI data handling** | ❌ No | **YES** | **✅ YES—WAIT** |
| **External system access** | ❌ No | No | **✅ YES—WAIT** |
| **Org policy / legal questions** | ❌ No | No | **✅ YES—WAIT** |
| **Tracking, telemetry, sharing** | ❌ No | No | **✅ YES—WAIT** |

---

## SWE-bench Verification Checklist

Before finalizing code, confirm **ALL** items:

```
☐ Syntax: Compiles without errors
☐ Dependencies: Imports only available packages
☐ Edge Cases: Handles null, empty, invalid input
☐ Error Handling: Catches errors, logs appropriately
☐ Unit Tests: Would pass basic unit tests
☐ Project Style: Follows established naming, formatting
☐ Security: No SQLi, XSS, unencrypted data, credential leaks
☐ Integration: Works with existing codebase
```

If you can't check all boxes, **flag the limitation** and explain.

---

## Security Standards: Checklist

### Privacy-First (All Code)

```
☐ No external telemetry or tracking
☐ No unencrypted data storage or transmission
☐ No collection of unnecessary data
☐ Assume all data is sensitive until proven otherwise
```

### SOGI Data (Sexual Orientation & Gender Identity)

```
☐ Collection justified and documented
☐ Collection optional (users can skip)
☐ Encrypted at rest (AES-256-GCM)
☐ Encrypted in transit (TLS 1.3+)
☐ Access restricted (RBAC, minimum necessary)
☐ Retained only as long as necessary
☐ NEVER shared with third parties
☐ NEVER logged in plaintext
```

### Authentication & Identity

```
☐ No real-name enforcement
☐ Pseudonymous accounts supported
☐ Session-based tokens preferred over permanent credentials
☐ Rate limiting on auth endpoints
```

### Encryption

```
☐ HTTPS everywhere (no HTTP)
☐ TLS 1.3 or higher
☐ HSTS headers enabled
☐ Sensitive data encrypted at rest
☐ Keys rotated regularly (every 90 days)
```

---

## Accessibility Checklist

For documentation, code comments, user-facing text:

```
☐ Language clear and concise (no jargon)
☐ Sentences short (8–15 words max)
☐ Complex ideas broken into small chunks
☐ Headings descriptive and hierarchical
☐ Navigation in two clicks or fewer
☐ Instructions phrased as direct commands
☐ Visual anchors (headings, icons, dividers)
☐ Fonts sans-serif, high-contrast
☐ Dark mode and low-stimulation options available
```

---

## When You Get Stuck: Error Recovery Process

1. **Analyze the failure**: Read error messages, logs, stack traces. Don't guess.
2. **Identify root cause**: Missing dependency? Config error? Version mismatch? Logic bug?
3. **Propose Mindful fix**: Address root cause, not symptom. Explain why it works.
4. **Provide recovery steps**: Exact commands + checklist to verify fix.
5. **Document learning**: Update docs so error doesn't repeat.

---

## Decision Documentation Template (Quick Version)

File in `decisions/DECISION-NNN.md`:

```markdown
## Decision: [Title]

**Date**: YYYY-MM-DD | **Category**: [Security|Architecture|Accessibility|Privacy|SOGI Data]

### Context
[Problem, constraints, who was involved]

### Options Considered
A: [Pros/Cons] | B: [Pros/Cons] | C: [Pros/Cons]

### Decision
Chose **Option X** because [reasoning].

### Rationale
- Aligns with Secure Pride values: [how]
- Trade-offs: [what we're sacrificing and why it's acceptable]
- Risks mitigated: [what could go wrong and how we prevent it]

### Outcome (Later)
[Did it work? What did we learn?]
```

---

## Escalation Protocol

When you need human approval:

```
1. Signal clearly: "This requires escalation: [reason]"
2. Provide full context: Show your reasoning, alternatives, why human judgment is needed
3. Make a recommendation: State your preferred path and why
4. WAIT: Do not proceed until you get explicit approval
```

**Examples of escalation triggers**:
- "We need to store user pronouns (SOGI data). Here's my analysis..."
- "I need AWS credentials to test deployment. Here's why..."
- "Should we sell aggregated analytics to fund operations? Here's the impact..."

---

## Key Principles (One-Liners)

- **Understand before you build**: Five minutes of planning saves hours of rework
- **Verify, don't assume**: APIs don't exist until you test them
- **Privacy by default**: Assume data is sensitive; never collect unless justified
- **SOGI data = life-or-death**: Treat it with extreme care
- **Accessibility from day one**: Not a feature; it's a requirement
- **Code quality matters**: SWE-bench Verified or flag the gap
- **Document decisions**: Tomorrow-you will thank today-you
- **When in doubt, escalate**: Better safe than sorry

---

## Command Reference

**Common verification commands**:

```bash
# JavaScript/Node.js
npm install          # Install dependencies
npm run build        # Build the project
npm test             # Run tests
npm run lint         # Check code style

# Python
pip install -r requirements.txt  # Install dependencies
python -m pytest                  # Run tests
python -m black .                 # Format code

# Docker (see docs/DOCKER_IMAGE_WORKFLOW.md for the full release pipeline)
docker build -t secure-pride .   # Build the production image
docker run -p 8080:8080 secure-pride  # Serve it at localhost:8080
```

---

## Bookmarks

- [Full Instructions](COPILOT-INSTRUCTIONS.md) — Complete reference
- [README](COPILOT-INSTRUCTIONS-README.md) — How to use this document
- [Decisions](decisions/) — Historical decision records

---

**Secure Pride: Privacy-first cybersecurity for LGBTQ+ communities.**

*Keep this tab open during development.*

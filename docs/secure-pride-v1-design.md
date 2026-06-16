# Secure Pride — macOS PKI Trust Auditor

**Date:** 2026-03-12
**Status:** Reviewed
**Scope:** v1 — Swift scanner + local dashboard
**Platform:** macOS 13+ (Ventura). Requires modern Security.framework APIs.

## Context

Most security tools focus on threat detection. Secure Pride takes a different angle: **trust observability**. It inventories the PKI state on a macOS machine — certificates, identities, and trust settings — using Apple's Security.framework directly, scores the findings, and visualizes them through a local web dashboard.

The product is two things that ship together:
1. **Scanner engine** — Swift CLI that queries Security.framework and emits structured JSON
2. **Dashboard** — local web UI (already built) that visualizes scan results

The dashboard exists at `/Users/daedalus/Code/secure-pride/index.html`. It currently renders mock data. This spec describes how to replace that mock data with real scanner output.

## Goals

- Enumerate all certificates, identities, and trust settings via Security.framework
- Detect mkcert root CAs
- Score each finding for security posture
- Output structured JSON (default), Markdown, or plain text
- Serve a local web dashboard that visualizes real scan results
- Ship as a single CLI: `secure-pride audit` (scan) and `secure-pride dashboard` (serve UI)

## Non-Goals (v1)

- Filesystem key scanning (`find ~ -name "*.key"`)
- Docker trust inspection
- Network/TLS port scanning
- Trust relationship graph visualization
- Cloud/SaaS deployment
- Native macOS app (menubar, SwiftUI, etc.)

## Architecture

```
┌─────────────────────────────────────────────┐
│              secure-pride CLI                │
│         (ArgumentParser subcommands)        │
├──────────────────┬──────────────────────────┤
│  audit           │  dashboard               │
│  ┌────────────┐  │  ┌─────────────────────┐ │
│  │ Scanners   │  │  │ Local HTTP server   │ │
│  │ ├ Cert     │  │  │ serves index.html   │ │
│  │ ├ Identity │  │  │ + /api/scan.json    │ │
│  │ └ Trust    │  │  └─────────────────────┘ │
│  ├────────────┤  │                          │
│  │ Scoring    │  │  Browser reads scan.json │
│  │ Engine     │  │  and renders findings    │
│  ├────────────┤  │                          │
│  │ Report     │  │                          │
│  │ Writer     │  │                          │
│  └────────────┘  │                          │
└──────────────────┴──────────────────────────┘
         │                    │
    Security.framework    localhost:3741
```

Two subcommands:
- `secure-pride audit` — runs scanners, scores findings, outputs JSON/Markdown/Text
- `secure-pride dashboard` — runs a scan, writes `scan.json`, starts an HTTP server on `localhost:3741`, opens the dashboard in the default browser

The dashboard reads `/api/scan.json` via `fetch()` on load. No WebSocket, no polling — one scan, one render. User clicks "INITIALIZE SCAN" to re-trigger via the API.

## Project Structure

```
secure-pride/
├── Package.swift                              # SPM, depends on swift-argument-parser
├── Sources/
│   └── SecurePride/
│       ├── main.swift                         # CLI entry point (ArgumentParser)
│       ├── Commands/
│       │   ├── AuditCommand.swift             # `secure-pride audit` subcommand
│       │   └── DashboardCommand.swift         # `secure-pride dashboard` subcommand
│       ├── Scanners/
│       │   ├── CertificateScanner.swift       # SecCertificate enumeration
│       │   ├── IdentityScanner.swift          # SecIdentity (cert + private key)
│       │   └── TrustScanner.swift             # Trust settings per domain
│       ├── Models/
│       │   ├── Finding.swift                  # Core data model
│       │   └── ScanReport.swift               # Aggregated report
│       ├── Scoring/
│       │   └── ScoringEngine.swift            # Score assignment rules
│       ├── Output/
│       │   └── ReportWriter.swift             # JSON, Markdown, Text formatters
│       └── Server/
│           └── DashboardServer.swift          # Minimal HTTP server (no dependencies)
├── Dashboard/
│   └── index.html                             # Existing dashboard UI (modified to fetch real data)
├── Tests/
│   └── SecurePrideTests/
│       ├── ScoringEngineTests.swift
│       ├── ReportWriterTests.swift
│       └── ModelTests.swift
└── README.md
```

## Data Model

### Finding

```swift
struct Finding: Codable {
    let id: String                    // "CERT_021", "IDENT_003", "TRUST_007"
    let category: Category
    let name: String                  // "Developer Root CA"
    let detail: String                // Human-readable explanation
    let status: Status
    let score: Int                    // Negative = bad, zero = neutral
    let metadata: [String: String]    // Standard keys below
}

// Standard metadata keys:
// - "algorithm"     e.g. "RSA 2048", "EC 256", "RSA 1024"
// - "issuer"        e.g. "Apple Inc.", "Let's Encrypt"
// - "expiry"        ISO 8601 date, e.g. "2026-12-31T00:00:00Z"
// - "keychain"      e.g. "login", "System", "System Roots"
// - "domain"        trust domain: "user", "admin", "system"
// - "policy"        trust policy: "trustAll", "ssl", "codeSign", etc.
// - "keyType"       e.g. "RSA", "EC", "Ed25519"
// - "keySizeBits"   e.g. "2048", "256"
```

**Finding ID format:** `{CATEGORY_PREFIX}_{sequential_index_per_scan}` — e.g., the 21st certificate is `CERT_021`. IDs reset each scan. For cross-run tracking, use `name` + `metadata` fingerprint.

```swift
enum Category: String, Codable {
    case certificate
    case identity
    case trustSetting
}

enum Status: String, Codable {
    case ok
    case warn
    case critical
}
```

### ScanReport

```swift
struct ScanReport: Codable {
    let timestamp: Date
    let findings: [Finding]
    let totalScore: Int               // 0-100, clamped
    let summary: ReportSummary
    let errors: [ScanError]
}

struct ScanError: Codable {
    let scanner: String
    let message: String
    let code: Int32                   // OSStatus from Security.framework
}

struct ReportSummary: Codable {
    let certificateCount: Int
    let identityCount: Int
    let trustAnchorCount: Int
    let criticalCount: Int
    let warnCount: Int
}
```

### Dashboard data mapping

The existing dashboard expects objects shaped like:

```js
{ id, name, detail, status, score }
```

The `Finding` model matches this exactly. The dashboard JS changes from:

```js
// Before (mock)
const mockData = [{ id: "CERT_001", name: "Legacy TLS Profile", ... }];
renderAuditFeed();

// After (real)
fetch('/api/scan.json')
  .then(r => r.json())
  .then(report => {
    renderAuditFeed(report.findings);
    updateGauge(report.totalScore);
    updateStats(report.summary);
  });
```

The `status` field mapping: Finding uses `ok`/`warn`/`critical`. The dashboard CSS uses `pass`/`warn`/`fail`. The dashboard JS maps: `ok` → `pass`, `critical` → `fail`, `warn` → `warn`.

## Scanner Details

### CertificateScanner

Queries `kSecClassCertificate` with `kSecMatchLimitAll`. For each `SecCertificate`:

- Extract subject summary via `SecCertificateCopySubjectSummary`
- Extract DER data via `SecCertificateCopyData`
- **Key algorithm and size:** Use `SecCertificateCopyKey` (macOS 10.14+) to get a `SecKey`, then `SecKeyCopyAttributes` to read `kSecAttrKeyType` and `kSecAttrKeySizeInBits`
- **Expiry date:** Use `SecCertificateCopyValues` (deprecated but functional on macOS 13) with OID `2.5.4.24` (or `kSecOIDX509V1ValidityNotAfter`) to extract the notAfter date. The only alternative is raw DER/ASN.1 parsing, not justified for v1
- Generate finding with appropriate score

**Keychain access:** The login keychain is readable without elevation. System keychain and System Roots require `sudo` or entitlements. In v1, we run without elevation and handle partial access gracefully: if a query returns `errSecAuthFailed` or `errSecInteractionNotAllowed`, log a `ScanError` and continue.

### IdentityScanner

Queries `kSecClassIdentity` with `kSecMatchLimitAll`. For each `SecIdentity`:

- Extract the associated certificate via `SecIdentityCopyCertificate(_:)` (non-deprecated form, macOS 12+)
- Reuse certificate analysis from CertificateScanner
- Flag the existence of a private key as inherently sensitive
- Classify: developer cert, TLS server identity, SSH cert, etc.

### TrustScanner

Uses `SecTrustSettingsCopyCertificates` across trust domains:

- `.user` — user-added trust settings
- `.admin` — admin-added trust settings
- `.system` — Apple's default trust store. Returns `errSecNoTrustSettings` without elevation. Fallback: skip with a `ScanError`.

For each trusted certificate, calls `SecTrustSettingsCopyTrustSettings` to get policy details.

Flags:
- Custom root CAs not in Apple's default set
- Certificates with "trust all" policy overrides
- Any user-domain trust additions (potential corporate interception)
- **mkcert root CA detection:** Match certificates whose subject contains "mkcert" (default CN: `mkcert {username}@{hostname}`). mkcert installs a root CA that can sign for any domain — dev convenience but real risk if the root key (`~/.local/share/mkcert/rootCA-key.pem`) is compromised or persists on shared/production machines

**Error handling:** If any domain query fails, record a `ScanError` and continue. The tool always emits partial results rather than failing entirely.

## Scoring Rules

Baseline: **100**. Only warn/critical findings subtract. Ok-status findings score **0**. Clamped to 0–100.

| Finding | Status | Score |
|---------|--------|-------|
| Valid modern certificate (RSA 2048+, SHA256+) | ok | 0 |
| Certificate expiring within 30 days | warn | -10 |
| Expired certificate | critical | -15 |
| Weak algorithm (RSA 1024, SHA1) | critical | -20 |
| Identity present (cert + private key) | warn | -5 |
| Unexpected/unknown identity | critical | -25 |
| Custom root CA installed | warn | -15 |
| Unknown root CA (not Apple default) | critical | -25 |
| mkcert root CA detected | warn | -15 |
| Standard Apple trust anchor | ok | 0 |

Score interpretation:
- **80–100:** Robust
- **50–79:** Baseline (review recommended)
- **20–49:** Vulnerable
- **0–19:** Fragile

These labels match the existing dashboard's posture states.

## Dashboard Server

### DashboardServer.swift

A minimal HTTP server using `NWListener` from Network.framework (macOS 10.14+). **Zero external dependencies.**

Serves:
- `GET /` → `Dashboard/index.html`
- `GET /api/scan.json` → latest scan result (JSON)
- `POST /api/scan` → triggers a new scan, returns JSON result

The server:
1. Runs a full scan on startup
2. Stores the result in memory
3. Serves it at `/api/scan.json`
4. Re-scans on `POST /api/scan`

Default port: `3741`. Configurable via `--port`.

### Dashboard modifications

The existing `index.html` needs these changes:

1. Replace `mockData` array with a `fetch('/api/scan.json')` call
2. Map `status` values: `ok` → `pass`, `critical` → `fail`
3. Update `startAudit()` to `POST /api/scan` then re-fetch
4. Wire `report.totalScore` to the confidence gauge
5. Wire `report.summary` to the Audit Intelligence stats
6. Remove the "M3 HARDWARE ACCELERATED" label — replace with scan timestamp
7. Remove "BAYESIAN CORE" label — replace with "TRUST SCORE"

The dashboard's existing design, animations, and layout stay untouched.

## CLI Interface

```
secure-pride audit                              # JSON to stdout (default)
secure-pride audit --format json                # Explicit JSON
secure-pride audit --format markdown            # Markdown report
secure-pride audit --format text                # Plain text summary
secure-pride audit --output report.json         # Write to file
secure-pride audit --verbose                    # Human summary to stderr
secure-pride audit --category certificate       # Scan only certificates
secure-pride audit --category identity          # Scan only identities
secure-pride audit --category trust-setting      # Scan only trust settings

secure-pride dashboard                          # Scan + serve UI on localhost:3741
secure-pride dashboard --port 8080              # Custom port
secure-pride dashboard --no-open                # Don't auto-open browser
```

With `--verbose`, a human-readable summary goes to stderr:

```
🔍 secure-pride audit — PKI trust inventory
Found: 47 certificates, 3 identities, 12 trust anchors
Score: 72/100 (Baseline)
⚠ 2 warnings, 1 critical finding
```

## Dependencies

- **swift-argument-parser** (Apple, ~1.3.0) — CLI parsing
- **Security.framework** (system) — keychain and trust APIs
- **Foundation** (system) — JSON encoding, dates
- **Network.framework** (system) — HTTP server for dashboard

No third-party dependencies beyond ArgumentParser.

### Package.swift outline

```swift
// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "secure-pride",
    platforms: [.macOS(.v13)],
    dependencies: [
        .package(url: "https://github.com/apple/swift-argument-parser", from: "1.3.0"),
    ],
    targets: [
        .executableTarget(
            name: "secure-pride",
            dependencies: [.product(name: "ArgumentParser", package: "swift-argument-parser")],
            path: "Sources/SecurePride",
            resources: [.copy("../../Dashboard")]
        ),
        .testTarget(
            name: "SecurePrideTests",
            dependencies: ["secure-pride"],
            path: "Tests/SecurePrideTests"
        ),
    ]
)
```

## Testing Strategy

Test files:
- `Tests/SecurePrideTests/ScoringEngineTests.swift` — scoring rules with mock findings
- `Tests/SecurePrideTests/ReportWriterTests.swift` — JSON/Markdown/Text formatting with fixture data
- `Tests/SecurePrideTests/ModelTests.swift` — Codable round-trip for Finding, ScanReport, ScanError

Notes:
- **Scanners** interact with the system keychain — test on real machines, not CI
- **DashboardServer** can be tested with a local HTTP request to verify it serves scan.json
- Integration: run `secure-pride audit` on a dev machine, validate JSON schema

## Verification

1. `swift build` compiles without errors
2. `swift test` passes scoring engine and model tests
3. `secure-pride audit` produces valid JSON with findings from the local machine
4. `secure-pride audit --format markdown` produces readable Markdown
5. `secure-pride audit --output /tmp/test.json` writes file correctly
6. `secure-pride dashboard` starts server, opens browser, shows real findings in the UI
7. Clicking "INITIALIZE SCAN" in the dashboard triggers a re-scan and updates the display
8. The confidence gauge reflects the real `totalScore`

## Future Work (not v1)

- Filesystem key scanner (`*.key`, `*.pem` detection)
- Docker container trust mount inspection
- TLS port scanning
- Trust relationship graph visualization (Root CA → developer CA → localhost cert)
- Scheduled scans with historical trend tracking
- PDF/HTML report export from dashboard
- Homebrew formula for distribution

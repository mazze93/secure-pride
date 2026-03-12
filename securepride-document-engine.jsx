import { useState, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   SECURE PRIDE — BRANDED DOCUMENT ENGINE
   Submit copy → receive branded, print-ready PDF output.
   Use Cmd/Ctrl+P from preview to generate PDF.
   ═══════════════════════════════════════════════════════════════ */

// ─── BRAND TOKENS ────────────────────────────────────────────
const B = {
  teal: "#0a7e74",
  tealLight: "#e6f7f5",
  tealMid: "#b3e8e3",
  purple: "#3a2a5e",
  purpleLight: "#eee9f4",
  cyan: "#06d6e0",
  pink: "#ff2d95",
  dark: "#0a0a1a",
  body: "#2a2a3e",
  muted: "#6b6b80",
  border: "#d4cfc7",
  bg: "#ffffff",
  bgWarm: "#faf8f5",
  copyBg: "#f4f3f8",
};

// ─── SHIELD-PADLOCK SVG (Correct orientation) ────────────────
function ShieldLogo({ size = 48, variant = "color" }) {
  const s = size;
  const mono = variant === "mono";
  return (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Secure Pride shield logo">
      <defs>
        <linearGradient id={`shGrad${s}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={B.cyan} />
          <stop offset="50%" stopColor="#b24bf3" />
          <stop offset="100%" stopColor={B.pink} />
        </linearGradient>
      </defs>
      {/* Shield — point at BOTTOM */}
      <path
        d="M32 4 L8 16 L8 32 C8 46 18.5 56.5 32 60 C45.5 56.5 56 46 56 32 L56 16 Z"
        fill={mono ? "#f0f0f0" : B.bgWarm}
        stroke={mono ? B.muted : `url(#shGrad${s})`}
        strokeWidth="2.5"
      />
      {/* Padlock body */}
      <rect x="22" y="30" width="20" height="15" rx="3"
        fill={mono ? B.muted : B.teal} />
      {/* Shackle */}
      <path d="M26 30 L26 25 C26 20.5 28.7 18 32 18 C35.3 18 38 20.5 38 25 L38 30"
        stroke={mono ? "#999" : B.purple}
        strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Keyhole */}
      <circle cx="32" cy="36.5" r="2.5" fill="white" />
      <rect x="31" y="36.5" width="2" height="4.5" rx="1" fill="white" />
    </svg>
  );
}

// ─── DOCUMENT TEMPLATES ──────────────────────────────────────
const TEMPLATES = {
  brand_guide: {
    name: "Brand Guide",
    description: "Voice principles, copy blocks, terminology",
    sections: [
      { id: "title", label: "Document Title", type: "text", placeholder: "Secure Pride Brand Voice Guide", default: "Secure Pride Brand Voice Guide" },
      { id: "subtitle", label: "Subtitle", type: "text", placeholder: "v1.0 · March 2026", default: "v1.0 · March 2026" },
      { id: "intro", label: "Introduction", type: "textarea", placeholder: "Brief overview of this document's purpose...", default: "This guide defines how Secure Pride speaks across every surface: website, dashboard UI, social media, email, documentation, and partner communications." },
      { id: "body", label: "Main Content (Markdown-style)", type: "richtext", placeholder: "## Section Heading\n\nBody paragraph...\n\n### Subsection\n\nMore content...\n\n> Quoted/highlighted text\n\n---\n\n## Next Section", default: "" },
    ],
  },
  report: {
    name: "Report / Proposal",
    description: "Status reports, grant proposals, project updates",
    sections: [
      { id: "title", label: "Document Title", type: "text", placeholder: "Q2 2026 Project Update", default: "" },
      { id: "subtitle", label: "Subtitle / Date", type: "text", placeholder: "Prepared for [stakeholder]", default: "" },
      { id: "summary", label: "Executive Summary", type: "textarea", placeholder: "Brief summary of key points...", default: "" },
      { id: "body", label: "Report Body (Markdown-style)", type: "richtext", placeholder: "## Background\n\nContext...\n\n## Progress\n\nDetails...\n\n## Next Steps\n\n1. First\n2. Second", default: "" },
    ],
  },
  documentation: {
    name: "Technical Documentation",
    description: "API docs, setup guides, architecture",
    sections: [
      { id: "title", label: "Document Title", type: "text", placeholder: "DLP Scanner Setup Guide", default: "" },
      { id: "subtitle", label: "Version / Date", type: "text", placeholder: "v1.0 · For system administrators", default: "" },
      { id: "intro", label: "Overview", type: "textarea", placeholder: "What this document covers...", default: "" },
      { id: "body", label: "Documentation Body (Markdown-style)", type: "richtext", placeholder: "## Prerequisites\n\n- Docker installed\n- 512MB RAM\n\n## Installation\n\n```\ndocker pull securepride/dlp-scanner\n```\n\n## Configuration\n\nDetails...", default: "" },
    ],
  },
  onepager: {
    name: "One-Pager / Fact Sheet",
    description: "Single-page overview for stakeholders",
    sections: [
      { id: "title", label: "Title", type: "text", placeholder: "Secure Pride — At a Glance", default: "" },
      { id: "subtitle", label: "Tagline", type: "text", placeholder: "Where we draw the line online.", default: "Where we draw the line online." },
      { id: "body", label: "Content (Markdown-style)", type: "richtext", placeholder: "## What We Do\n\nBrief description...\n\n## Key Features\n\n- Feature one\n- Feature two\n\n## Pricing\n\nFree for orgs under 10 staff.", default: "" },
    ],
  },
};

// ─── MARKDOWN PARSER (lightweight) ───────────────────────────
function parseMarkdown(text) {
  if (!text) return [];
  const lines = text.split("\n");
  const blocks = [];
  let currentBlock = null;
  let inCode = false;
  let codeContent = "";
  let codeLang = "";

  const flush = () => {
    if (currentBlock) {
      if (currentBlock.type === "paragraph" || currentBlock.type === "list") {
        currentBlock.content = currentBlock.content.trim();
      }
      if (currentBlock.content) blocks.push(currentBlock);
      currentBlock = null;
    }
  };

  for (const line of lines) {
    // Code block toggle
    if (line.trim().startsWith("```")) {
      if (inCode) {
        blocks.push({ type: "code", content: codeContent.trim(), lang: codeLang });
        inCode = false;
        codeContent = "";
        codeLang = "";
      } else {
        flush();
        inCode = true;
        codeLang = line.trim().replace("```", "");
      }
      continue;
    }
    if (inCode) { codeContent += line + "\n"; continue; }

    // Horizontal rule
    if (line.trim() === "---" || line.trim() === "***") {
      flush();
      blocks.push({ type: "hr" });
      continue;
    }

    // Headings
    const h3 = line.match(/^### (.+)/);
    if (h3) { flush(); blocks.push({ type: "h3", content: h3[1] }); continue; }
    const h2 = line.match(/^## (.+)/);
    if (h2) { flush(); blocks.push({ type: "h2", content: h2[1] }); continue; }
    const h1 = line.match(/^# (.+)/);
    if (h1) { flush(); blocks.push({ type: "h1", content: h1[1] }); continue; }

    // Blockquote
    if (line.trim().startsWith("> ")) {
      flush();
      blocks.push({ type: "quote", content: line.trim().replace(/^>\s*/, "") });
      continue;
    }

    // Comparison row: ✗ ... | ✓ ...
    if ((line.includes("✗") || line.includes("✗")) && line.includes("|") && (line.includes("✓") || line.includes("✓"))) {
      flush();
      const parts = line.split("|").map(s => s.trim());
      blocks.push({ type: "comparison", dont: parts[0].replace(/^[✗✘]\s*/, ""), do: parts[1].replace(/^[✓✔]\s*/, "") });
      continue;
    }

    // List items
    if (line.trim().match(/^[-*•]\s/) || line.trim().match(/^\d+\.\s/)) {
      if (!currentBlock || currentBlock.type !== "list") {
        flush();
        currentBlock = { type: "list", items: [], ordered: !!line.trim().match(/^\d+\./) };
      }
      currentBlock.items = currentBlock.items || [];
      currentBlock.items.push(line.trim().replace(/^[-*•]\s+/, "").replace(/^\d+\.\s+/, ""));
      currentBlock.content = "list";
      continue;
    }

    // Copy block: [LABEL]: content
    const copyMatch = line.match(/^\[(.+?)\]:\s*(.+)/);
    if (copyMatch) {
      flush();
      blocks.push({ type: "copyblock", label: copyMatch[1], content: copyMatch[2] });
      continue;
    }

    // Empty line = paragraph break
    if (line.trim() === "") {
      flush();
      continue;
    }

    // Regular paragraph
    if (!currentBlock || currentBlock.type !== "paragraph") {
      flush();
      currentBlock = { type: "paragraph", content: "" };
    }
    currentBlock.content += (currentBlock.content ? " " : "") + line.trim();
  }
  flush();
  if (inCode && codeContent) blocks.push({ type: "code", content: codeContent.trim(), lang: codeLang });
  return blocks;
}

// ─── INLINE MARKDOWN ─────────────────────────────────────────
function InlineMarkdown({ text }) {
  if (!text) return null;
  // Bold, italic, code, links
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Inline code
    const codeMatch = remaining.match(/`(.+?)`/);

    let firstMatch = null;
    let firstIndex = remaining.length;

    if (boldMatch && boldMatch.index < firstIndex) {
      firstMatch = { type: "bold", match: boldMatch };
      firstIndex = boldMatch.index;
    }
    if (codeMatch && codeMatch.index < firstIndex) {
      firstMatch = { type: "code", match: codeMatch };
      firstIndex = codeMatch.index;
    }

    if (!firstMatch) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    if (firstIndex > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, firstIndex)}</span>);
    }

    if (firstMatch.type === "bold") {
      parts.push(<strong key={key++} style={{ fontWeight: 700 }}>{firstMatch.match[1]}</strong>);
    } else if (firstMatch.type === "code") {
      parts.push(<code key={key++} style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.88em", background: B.copyBg,
        padding: "1px 5px", borderRadius: "3px", color: B.teal,
      }}>{firstMatch.match[1]}</code>);
    }

    remaining = remaining.slice(firstIndex + firstMatch.match[0].length);
  }

  return <>{parts}</>;
}


// ─── PRINT STYLES (injected into document head) ──────────────
const printCSS = `
@media print {
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .no-print { display: none !important; }
  .print-only { display: block !important; }
  .page-break { page-break-before: always; }
  .avoid-break { page-break-inside: avoid; }
  @page { margin: 0.75in 0.75in 0.6in 0.75in; size: letter; }
  .doc-preview { box-shadow: none !important; border: none !important; padding: 0 !important; max-width: 100% !important; }
  .editor-panel { display: none !important; }
  .preview-wrapper { width: 100% !important; padding: 0 !important; }
}
`;

// ─── RENDERED BLOCK ──────────────────────────────────────────
function RenderedBlock({ block }) {
  const base = { fontFamily: "'Source Sans 3', -apple-system, sans-serif", color: B.body };

  switch (block.type) {
    case "h1":
      return <h1 className="avoid-break" style={{ ...base, fontFamily: "'Rajdhani', sans-serif", fontSize: "22px", fontWeight: 700, color: B.purple, marginTop: "28px", marginBottom: "8px", lineHeight: 1.2 }}><InlineMarkdown text={block.content} /></h1>;
    case "h2":
      return (
        <div className="avoid-break" style={{ marginTop: "24px", marginBottom: "10px" }}>
          <h2 style={{ ...base, fontFamily: "'Rajdhani', sans-serif", fontSize: "16px", fontWeight: 700, color: B.teal, letterSpacing: "0.01em", marginBottom: "4px" }}>
            <InlineMarkdown text={block.content} />
          </h2>
          <div style={{ width: "40px", height: "2px", background: B.teal, borderRadius: "1px" }} />
        </div>
      );
    case "h3":
      return <h3 className="avoid-break" style={{ ...base, fontSize: "13px", fontWeight: 700, color: B.body, marginTop: "18px", marginBottom: "6px" }}><InlineMarkdown text={block.content} /></h3>;
    case "paragraph":
      return <p style={{ ...base, fontSize: "10.5px", lineHeight: "18px", marginBottom: "10px", textAlign: "justify" }}><InlineMarkdown text={block.content} /></p>;
    case "quote":
      return (
        <blockquote className="avoid-break" style={{
          ...base, borderLeft: `3px solid ${B.teal}`, paddingLeft: "14px",
          margin: "12px 0", fontSize: "10.5px", fontStyle: "italic",
          color: B.teal, lineHeight: "17px",
        }}>
          <InlineMarkdown text={block.content} />
        </blockquote>
      );
    case "list":
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag style={{ ...base, fontSize: "10.5px", lineHeight: "18px", paddingLeft: "24px", marginBottom: "10px" }}>
          {(block.items || []).map((item, i) => (
            <li key={i} style={{ marginBottom: "4px" }}><InlineMarkdown text={item} /></li>
          ))}
        </Tag>
      );
    case "code":
      return (
        <pre className="avoid-break" style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: "9px",
          lineHeight: "15px", background: "#1a1a2e", color: "#06d6e0",
          padding: "12px 14px", borderRadius: "6px", margin: "10px 0",
          overflowX: "auto", whiteSpace: "pre-wrap",
        }}>
          {block.content}
        </pre>
      );
    case "hr":
      return <hr style={{ border: "none", borderTop: `1px solid ${B.border}`, margin: "20px 0" }} />;
    case "copyblock":
      return (
        <div className="avoid-break" style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "8px", fontWeight: 700, color: B.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
            {block.label}
          </div>
          <div style={{
            background: B.copyBg, borderLeft: `3px solid ${B.teal}`,
            borderRadius: "4px", padding: "10px 14px",
            fontSize: "10.5px", lineHeight: "17px", color: B.body,
          }}>
            <InlineMarkdown text={block.content} />
          </div>
        </div>
      );
    case "comparison":
      return (
        <div className="avoid-break" style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
          <div style={{
            flex: 1, background: "#fff0f0", borderLeft: `3px solid ${B.pink}`,
            borderRadius: "4px", padding: "8px 10px", fontSize: "9px", lineHeight: "14px",
          }}>
            <span style={{ fontWeight: 700, color: B.pink, fontSize: "7px", display: "block", marginBottom: "3px" }}>✗ DON'T</span>
            <span style={{ color: "#993333" }}>{block.dont}</span>
          </div>
          <div style={{
            flex: 1, background: B.tealLight, borderLeft: `3px solid ${B.teal}`,
            borderRadius: "4px", padding: "8px 10px", fontSize: "9px", lineHeight: "14px",
          }}>
            <span style={{ fontWeight: 700, color: B.teal, fontSize: "7px", display: "block", marginBottom: "3px" }}>✓ DO</span>
            <span style={{ color: "#064e48" }}>{block.do}</span>
          </div>
        </div>
      );
    default:
      return null;
  }
}


// ─── DOCUMENT PREVIEW ────────────────────────────────────────
function DocumentPreview({ data, template }) {
  const title = data.title || "Untitled Document";
  const subtitle = data.subtitle || "";
  const intro = data.intro || data.summary || "";
  const bodyBlocks = parseMarkdown(data.body || "");

  return (
    <div className="doc-preview" style={{
      background: "white",
      maxWidth: "680px",
      margin: "0 auto",
      fontFamily: "'Source Sans 3', -apple-system, sans-serif",
      color: B.body,
      lineHeight: 1.6,
    }}>
      {/* ── HEADER BAR ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: `2px solid ${B.teal}`,
        paddingBottom: "10px", marginBottom: "24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ShieldLogo size={32} />
          <div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "11px", fontWeight: 700, color: B.purple, letterSpacing: "0.06em", textTransform: "uppercase", lineHeight: 1.2 }}>
              Secure Pride
            </div>
            <div style={{ fontSize: "7.5px", color: B.muted }}>
              Where we draw the line online
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "7px", color: B.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            securepride.org
          </div>
        </div>
      </div>

      {/* ── TITLE BLOCK ── */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: "28px", fontWeight: 700, color: B.purple,
          lineHeight: 1.15, marginBottom: "6px",
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: "12px", color: B.muted, marginBottom: "4px" }}>
            {subtitle}
          </p>
        )}
        <div style={{
          width: "60px", height: "3px", borderRadius: "1.5px",
          background: `linear-gradient(90deg, ${B.teal}, ${B.purple})`,
          marginTop: "10px",
        }} />
      </div>

      {/* ── INTRO ── */}
      {intro && (
        <div style={{
          fontSize: "11px", lineHeight: "19px", color: B.body,
          marginBottom: "20px", paddingBottom: "16px",
          borderBottom: `1px solid ${B.border}`,
        }}>
          {intro}
        </div>
      )}

      {/* ── BODY CONTENT ── */}
      <div>
        {bodyBlocks.map((block, i) => (
          <RenderedBlock key={i} block={block} />
        ))}
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        marginTop: "36px", paddingTop: "12px",
        borderTop: `1px solid ${B.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <ShieldLogo size={16} variant="mono" />
          <span style={{ fontSize: "7.5px", color: B.muted }}>
            © 2026 Secure Pride · CC BY 4.0
          </span>
        </div>
        <span style={{ fontSize: "7.5px", color: B.muted }}>
          securepride.org
        </span>
      </div>
    </div>
  );
}


// ─── SAMPLE CONTENT ──────────────────────────────────────────
const SAMPLE_CONTENT = `## Who We're Talking To

Our primary audience is community organization leaders: executive directors, program managers, board members, and IT volunteers at LGBTQ+ nonprofits, community centers, advocacy groups, health clinics, and mutual aid networks.

They have 15 minutes between meetings. They need tools that respect their intelligence without demanding their expertise.

## Voice Principles

### 1. Calm confidence

We speak from a place of competence, not alarm. We are the steady hand, not the siren.

✗ Your data is at risk. Act now before it's too late. | ✓ Your org's data deserves protection built for the threats you actually face.

✗ 47 CRITICAL ALERTS DETECTED | ✓ 3 items need your attention this week.

### 2. Culturally competent

We speak as members of the community, not as outsiders offering charity.

✗ We help marginalized communities stay safe online. | ✓ We build security tools for organizations like ours.

### 3. Approachable professional

We are experts who don't need jargon to prove it. Think of a trusted colleague who happens to be really good at security.

✗ Our ML-driven DLP engine performs heuristic analysis... | ✓ Our scanner checks AI conversations for hidden attacks and sensitive data.

---

## Website Copy

[Headline]: Cybersecurity for the organizations that protect our communities.

[Subheadline]: Secure Pride scans your AI workflows for hidden threats and sensitive data leaks — so you can focus on the work that matters.

[CTA — Primary]: Get protected

[Supporting line]: Free for organizations with fewer than 10 staff. No credit card required.

[Trust bar]: Built by LGBTQ+ technologists. Open source. Self-hostable. Your data never leaves your infrastructure.

---

## Pricing

[Community Tier — Free]: For organizations with fewer than 10 staff. Full scanner. Full dashboard. No feature gates. This isn't a trial. This is the product.

[Organization — $200/month]: For teams of 10–50. Everything in Community, plus priority support, custom policy templates, and audit log exports.

[Coalition — Custom]: For networks of organizations and fiscal sponsors. Talk to us. We'll build something that works.`;


// ═══════════════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function SecurePrideDocEngine() {
  const [templateKey, setTemplateKey] = useState("brand_guide");
  const [data, setData] = useState({
    title: "Secure Pride Brand Voice Guide",
    subtitle: "v1.0 · March 2026 · Internal & Agency Reference",
    intro: "This guide defines how Secure Pride speaks across every surface: website, dashboard UI, social media, email, documentation, and partner communications.",
    body: SAMPLE_CONTENT,
  });
  const [view, setView] = useState("split"); // editor | preview | split

  const template = TEMPLATES[templateKey];

  const updateField = (id, value) => {
    setData(prev => ({ ...prev, [id]: value }));
  };

  const switchTemplate = (key) => {
    setTemplateKey(key);
    const t = TEMPLATES[key];
    const newData = {};
    t.sections.forEach(s => { newData[s.id] = s.default || ""; });
    setData(newData);
  };

  const handlePrint = () => {
    window.print();
  };

  const showEditor = view === "editor" || view === "split";
  const showPreview = view === "preview" || view === "split";

  return (
    <div style={{
      minHeight: "100vh",
      background: B.bgWarm,
      fontFamily: "'Source Sans 3', -apple-system, sans-serif",
    }}>
      {/* Inject print styles */}
      <style dangerouslySetInnerHTML={{ __html: printCSS }} />
      {/* Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Source+Sans+3:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* ── TOOLBAR ── */}
      <div className="no-print" style={{
        background: "white",
        borderBottom: `2px solid ${B.teal}`,
        padding: "12px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "12px",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <ShieldLogo size={28} />
          <div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "14px", fontWeight: 700, color: B.purple }}>
              Document Engine
            </div>
            <div style={{ fontSize: "10px", color: B.muted }}>Branded PDF generator</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* Template selector */}
          <select
            value={templateKey}
            onChange={e => switchTemplate(e.target.value)}
            aria-label="Document template"
            style={{
              padding: "6px 12px", borderRadius: "6px",
              border: `1px solid ${B.border}`, fontSize: "12px",
              background: "white", color: B.body, cursor: "pointer",
              minHeight: "36px",
            }}
          >
            {Object.entries(TEMPLATES).map(([key, t]) => (
              <option key={key} value={key}>{t.name}</option>
            ))}
          </select>

          {/* View toggles */}
          <div style={{ display: "flex", border: `1px solid ${B.border}`, borderRadius: "6px", overflow: "hidden" }}>
            {[
              { key: "editor", label: "Edit" },
              { key: "split", label: "Split" },
              { key: "preview", label: "Preview" },
            ].map(v => (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                aria-label={`${v.label} view`}
                style={{
                  padding: "6px 14px", border: "none", cursor: "pointer",
                  fontSize: "11px", fontWeight: 600, minHeight: "36px",
                  background: view === v.key ? B.teal : "white",
                  color: view === v.key ? "white" : B.body,
                  transition: "all 150ms",
                }}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Print button */}
          <button
            onClick={handlePrint}
            style={{
              padding: "6px 18px", borderRadius: "6px", border: "none",
              background: B.purple, color: "white", fontSize: "12px",
              fontWeight: 700, cursor: "pointer", minHeight: "36px",
              letterSpacing: "0.02em",
            }}
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div style={{
        display: "flex", gap: 0, minHeight: "calc(100vh - 70px)",
      }}>
        {/* Editor panel */}
        {showEditor && (
          <div className="editor-panel" style={{
            flex: view === "split" ? "0 0 45%" : "1",
            padding: "20px",
            overflowY: "auto",
            maxHeight: "calc(100vh - 70px)",
            borderRight: view === "split" ? `1px solid ${B.border}` : "none",
            background: "white",
          }}>
            <div style={{ maxWidth: "560px" }}>
              <p style={{ fontSize: "11px", color: B.muted, marginBottom: "16px" }}>
                Fill in your content below. Use Markdown in the body field: <code style={{ fontSize: "10px", background: B.copyBg, padding: "1px 4px", borderRadius: "2px" }}>## Heading</code>, <code style={{ fontSize: "10px", background: B.copyBg, padding: "1px 4px", borderRadius: "2px" }}>### Subheading</code>, <code style={{ fontSize: "10px", background: B.copyBg, padding: "1px 4px", borderRadius: "2px" }}>&gt; Quote</code>, <code style={{ fontSize: "10px", background: B.copyBg, padding: "1px 4px", borderRadius: "2px" }}>[Label]: Copy text</code> for branded copy blocks, and <code style={{ fontSize: "10px", background: B.copyBg, padding: "1px 4px", borderRadius: "2px" }}>✗ Don't | ✓ Do</code> for comparison rows.
              </p>

              {template.sections.map(section => (
                <div key={section.id} style={{ marginBottom: "16px" }}>
                  <label
                    htmlFor={`field-${section.id}`}
                    style={{
                      display: "block", fontSize: "11px", fontWeight: 700,
                      color: B.body, marginBottom: "4px",
                      textTransform: "uppercase", letterSpacing: "0.04em",
                    }}
                  >
                    {section.label}
                  </label>

                  {section.type === "text" ? (
                    <input
                      id={`field-${section.id}`}
                      type="text"
                      value={data[section.id] || ""}
                      onChange={e => updateField(section.id, e.target.value)}
                      placeholder={section.placeholder}
                      style={{
                        width: "100%", padding: "8px 12px", borderRadius: "6px",
                        border: `1px solid ${B.border}`, fontSize: "13px",
                        fontFamily: "inherit", color: B.body,
                        outline: "none", minHeight: "40px",
                      }}
                    />
                  ) : (
                    <textarea
                      id={`field-${section.id}`}
                      value={data[section.id] || ""}
                      onChange={e => updateField(section.id, e.target.value)}
                      placeholder={section.placeholder}
                      rows={section.type === "richtext" ? 20 : 4}
                      style={{
                        width: "100%", padding: "10px 12px", borderRadius: "6px",
                        border: `1px solid ${B.border}`, fontSize: "12px",
                        fontFamily: section.type === "richtext" ? "'JetBrains Mono', monospace" : "inherit",
                        color: B.body, lineHeight: "20px",
                        resize: "vertical", outline: "none",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview panel */}
        {showPreview && (
          <div className="preview-wrapper" style={{
            flex: 1, padding: "24px 20px",
            overflowY: "auto", maxHeight: "calc(100vh - 70px)",
            background: B.bgWarm,
          }}>
            <div style={{
              background: "white",
              maxWidth: "680px",
              margin: "0 auto",
              padding: "40px 48px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
              borderRadius: "4px",
              minHeight: "800px",
            }}>
              <DocumentPreview data={data} template={templateKey} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════
   SECURE PRIDE — BRANDED DOCUMENT ENGINE
   Submit copy → receive branded, print-ready PDF output.
   Use Cmd/Ctrl+P from preview to generate PDF.
   Print styles live in ToolLayout.astro.
   Fonts: self-hosted Inter + Rajdhani, loaded by ToolLayout.astro.
   ═══════════════════════════════════════════════════════════════ */

// ─── BRAND TOKENS ────────────────────────────────────────────
const B = {
  teal:      "#0a7e74",
  tealLight: "#e6f7f5",
  purple:    "#3a2a5e",
  cyan:      "#06d6e0",
  pink:      "#ff2d95",
  body:      "#2a2a3e",
  muted:     "#6b6b80",
  border:    "#d4cfc7",
  bg:        "#ffffff",
  bgWarm:    "#faf8f5",
  copyBg:    "#f4f3f8",
};

// Font stacks — no external requests
const FONT_HEADING = "'Rajdhani', 'Inter', system-ui, sans-serif";
const FONT_BODY    = "'Inter', system-ui, sans-serif";
const FONT_MONO    = "ui-monospace, 'Cascadia Code', 'Fira Code', monospace";

// ─── SHIELD-PADLOCK SVG ──────────────────────────────────────
function ShieldLogo({ size = 48, variant = "color" }) {
  const mono = variant === "mono";
  const uid  = `sh${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none"
         xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={uid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={B.cyan} />
          <stop offset="50%"  stopColor="#b24bf3" />
          <stop offset="100%" stopColor={B.pink} />
        </linearGradient>
      </defs>
      <path d="M32 4 L8 16 L8 32 C8 46 18.5 56.5 32 60 C45.5 56.5 56 46 56 32 L56 16 Z"
            fill={mono ? "#f0f0f0" : B.bgWarm}
            stroke={mono ? B.muted : `url(#${uid})`}
            strokeWidth="2.5"/>
      <rect x="22" y="30" width="20" height="15" rx="3"
            fill={mono ? B.muted : B.teal}/>
      <path d="M26 30 L26 25 C26 20.5 28.7 18 32 18 C35.3 18 38 20.5 38 25 L38 30"
            stroke={mono ? "#999" : B.purple}
            strokeWidth="3" strokeLinecap="round" fill="none"/>
      <circle cx="32" cy="36.5" r="2.5" fill="white"/>
      <rect x="31" y="36.5" width="2" height="4.5" rx="1" fill="white"/>
    </svg>
  );
}

// ─── DOCUMENT TEMPLATES ──────────────────────────────────────
const TEMPLATES = {
  brand_guide: {
    name: "Brand Guide",
    sections: [
      { id: "title",    label: "Document Title", type: "text",     placeholder: "Secure Pride Brand Voice Guide", default: "Secure Pride Brand Voice Guide" },
      { id: "subtitle", label: "Subtitle",       type: "text",     placeholder: "v1.0 · March 2026",             default: "v1.0 · March 2026" },
      { id: "intro",    label: "Introduction",   type: "textarea", placeholder: "Brief overview...",              default: "This guide defines how Secure Pride speaks across every surface: website, dashboard UI, social media, email, documentation, and partner communications." },
      { id: "body",     label: "Main Content (Markdown-style)", type: "richtext", placeholder: "## Section Heading\n\nBody paragraph...", default: "" },
    ],
  },
  report: {
    name: "Report / Proposal",
    sections: [
      { id: "title",    label: "Document Title",         type: "text",     placeholder: "Q2 2026 Project Update",     default: "" },
      { id: "subtitle", label: "Subtitle / Date",        type: "text",     placeholder: "Prepared for [stakeholder]", default: "" },
      { id: "summary",  label: "Executive Summary",      type: "textarea", placeholder: "Brief summary...",           default: "" },
      { id: "body",     label: "Report Body (Markdown)", type: "richtext", placeholder: "## Background\n\nContext...", default: "" },
    ],
  },
  documentation: {
    name: "Technical Documentation",
    sections: [
      { id: "title",    label: "Document Title",                type: "text",     placeholder: "DLP Scanner Setup Guide",          default: "" },
      { id: "subtitle", label: "Version / Date",                type: "text",     placeholder: "v1.0 · For system administrators", default: "" },
      { id: "intro",    label: "Overview",                      type: "textarea", placeholder: "What this document covers...",      default: "" },
      { id: "body",     label: "Documentation Body (Markdown)", type: "richtext", placeholder: "## Prerequisites\n\n- Item",       default: "" },
    ],
  },
  onepager: {
    name: "One-Pager / Fact Sheet",
    sections: [
      { id: "title",    label: "Title",              type: "text",     placeholder: "Secure Pride — At a Glance",     default: "" },
      { id: "subtitle", label: "Tagline",            type: "text",     placeholder: "Where we draw the line online.", default: "Where we draw the line online." },
      { id: "body",     label: "Content (Markdown)", type: "richtext", placeholder: "## What We Do\n\nBrief desc.",   default: "" },
    ],
  },
};

// ─── MARKDOWN PARSER ─────────────────────────────────────────
function parseMarkdown(text) {
  if (!text) return [];
  const lines = text.split("\n");
  const blocks = [];
  let current = null;
  let inCode = false, codeContent = "", codeLang = "";

  const flush = () => {
    if (!current) return;
    if (current.type === "paragraph" || current.type === "list")
      current.content = current.content?.trim();
    if (current.content || current.items?.length) blocks.push(current);
    current = null;
  };

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inCode) { blocks.push({ type: "code", content: codeContent.trim(), lang: codeLang }); inCode = false; codeContent = ""; codeLang = ""; }
      else { flush(); inCode = true; codeLang = line.trim().replace("```", ""); }
      continue;
    }
    if (inCode) { codeContent += line + "\n"; continue; }

    if (line.trim() === "---" || line.trim() === "***") { flush(); blocks.push({ type: "hr" }); continue; }

    const h3 = line.match(/^### (.+)/); if (h3) { flush(); blocks.push({ type: "h3", content: h3[1] }); continue; }
    const h2 = line.match(/^## (.+)/);  if (h2) { flush(); blocks.push({ type: "h2", content: h2[1] }); continue; }
    const h1 = line.match(/^# (.+)/);   if (h1) { flush(); blocks.push({ type: "h1", content: h1[1] }); continue; }

    if (line.trim().startsWith("> ")) { flush(); blocks.push({ type: "quote", content: line.trim().replace(/^>\s*/, "") }); continue; }

    if ((line.includes("✗") || line.includes("✘")) && line.includes("|") && (line.includes("✓") || line.includes("✔"))) {
      flush();
      const [left, right] = line.split("|").map(s => s.trim());
      blocks.push({ type: "comparison", dont: left.replace(/^[✗✘]\s*/, ""), do: right.replace(/^[✓✔]\s*/, "") });
      continue;
    }

    if (line.trim().match(/^[-*•]\s/) || line.trim().match(/^\d+\.\s/)) {
      if (!current || current.type !== "list") { flush(); current = { type: "list", items: [], ordered: !!line.trim().match(/^\d+\./), content: "list" }; }
      current.items.push(line.trim().replace(/^[-*•]\s+/, "").replace(/^\d+\.\s+/, ""));
      continue;
    }

    const copyMatch = line.match(/^\[(.+?)\]:\s*(.+)/);
    if (copyMatch) { flush(); blocks.push({ type: "copyblock", label: copyMatch[1], content: copyMatch[2] }); continue; }

    if (line.trim() === "") { flush(); continue; }

    if (!current || current.type !== "paragraph") { flush(); current = { type: "paragraph", content: "" }; }
    current.content += (current.content ? " " : "") + line.trim();
  }
  flush();
  if (inCode && codeContent) blocks.push({ type: "code", content: codeContent.trim(), lang: codeLang });
  return blocks;
}

// ─── INLINE MARKDOWN ─────────────────────────────────────────
function InlineMarkdown({ text }) {
  if (!text) return null;
  const parts = [];
  let remaining = text, key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const codeMatch = remaining.match(/`(.+?)`/);
    let firstMatch = null, firstIndex = remaining.length;
    if (boldMatch && boldMatch.index < firstIndex) { firstMatch = { type: "bold", match: boldMatch }; firstIndex = boldMatch.index; }
    if (codeMatch && codeMatch.index < firstIndex) { firstMatch = { type: "code", match: codeMatch }; firstIndex = codeMatch.index; }

    if (!firstMatch) { parts.push(<span key={key++}>{remaining}</span>); break; }
    if (firstIndex > 0) parts.push(<span key={key++}>{remaining.slice(0, firstIndex)}</span>);

    if (firstMatch.type === "bold") {
      parts.push(<strong key={key++} style={{ fontWeight: 700 }}>{firstMatch.match[1]}</strong>);
    } else {
      parts.push(<code key={key++} style={{ fontFamily: FONT_MONO, fontSize: "0.88em", background: B.copyBg, padding: "1px 5px", borderRadius: "3px", color: B.teal }}>{firstMatch.match[1]}</code>);
    }
    remaining = remaining.slice(firstIndex + firstMatch.match[0].length);
  }
  return <>{parts}</>;
}

// ─── RENDERED BLOCK ──────────────────────────────────────────
function RenderedBlock({ block }) {
  const base = { fontFamily: FONT_BODY, color: B.body };
  switch (block.type) {
    case "h1":
      return <h1 className="avoid-break" style={{ ...base, fontFamily: FONT_HEADING, fontSize: "22px", fontWeight: 700, color: B.purple, marginTop: "28px", marginBottom: "8px", lineHeight: 1.2 }}><InlineMarkdown text={block.content} /></h1>;
    case "h2":
      return (
        <div className="avoid-break" style={{ marginTop: "24px", marginBottom: "10px" }}>
          <h2 style={{ ...base, fontFamily: FONT_HEADING, fontSize: "16px", fontWeight: 700, color: B.teal, letterSpacing: "0.01em", marginBottom: "4px" }}><InlineMarkdown text={block.content} /></h2>
          <div style={{ width: "40px", height: "2px", background: B.teal, borderRadius: "1px" }} />
        </div>
      );
    case "h3":
      return <h3 className="avoid-break" style={{ ...base, fontSize: "13px", fontWeight: 700, color: B.body, marginTop: "18px", marginBottom: "6px" }}><InlineMarkdown text={block.content} /></h3>;
    case "paragraph":
      return <p style={{ ...base, fontSize: "10.5px", lineHeight: "18px", marginBottom: "10px", textAlign: "justify" }}><InlineMarkdown text={block.content} /></p>;
    case "quote":
      return <blockquote className="avoid-break" style={{ ...base, borderLeft: `3px solid ${B.teal}`, paddingLeft: "14px", margin: "12px 0", fontSize: "10.5px", fontStyle: "italic", color: B.teal, lineHeight: "17px" }}><InlineMarkdown text={block.content} /></blockquote>;
    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag style={{ ...base, fontSize: "10.5px", lineHeight: "18px", paddingLeft: "24px", marginBottom: "10px" }}>
          {(block.items || []).map((item, i) => <li key={i} style={{ marginBottom: "4px" }}><InlineMarkdown text={item} /></li>)}
        </Tag>
      );
    }
    case "code":
      return <pre className="avoid-break" style={{ fontFamily: FONT_MONO, fontSize: "9px", lineHeight: "15px", background: "#1a1a2e", color: "#06d6e0", padding: "12px 14px", borderRadius: "6px", margin: "10px 0", overflowX: "auto", whiteSpace: "pre-wrap" }}>{block.content}</pre>;
    case "hr":
      return <hr style={{ border: "none", borderTop: `1px solid ${B.border}`, margin: "20px 0" }} />;
    case "copyblock":
      return (
        <div className="avoid-break" style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "8px", fontWeight: 700, color: B.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>{block.label}</div>
          <div style={{ background: B.copyBg, borderLeft: `3px solid ${B.teal}`, borderRadius: "4px", padding: "10px 14px", fontSize: "10.5px", lineHeight: "17px", color: B.body }}><InlineMarkdown text={block.content} /></div>
        </div>
      );
    case "comparison":
      return (
        <div className="avoid-break" style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
          <div style={{ flex: 1, background: "#fff0f0", borderLeft: `3px solid ${B.pink}`, borderRadius: "4px", padding: "8px 10px", fontSize: "9px", lineHeight: "14px" }}>
            <span style={{ fontWeight: 700, color: B.pink, fontSize: "7px", display: "block", marginBottom: "3px" }}>✗ DON'T</span>
            <span style={{ color: "#993333" }}>{block.dont}</span>
          </div>
          <div style={{ flex: 1, background: B.tealLight, borderLeft: `3px solid ${B.teal}`, borderRadius: "4px", padding: "8px 10px", fontSize: "9px", lineHeight: "14px" }}>
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
function DocumentPreview({ data }) {
  const title      = data.title || "Untitled Document";
  const subtitle   = data.subtitle || "";
  const intro      = data.intro || data.summary || "";
  const bodyBlocks = parseMarkdown(data.body || "");

  return (
    <div className="doc-preview" style={{ background: "white", maxWidth: "680px", margin: "0 auto", fontFamily: FONT_BODY, color: B.body, lineHeight: 1.6 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `2px solid ${B.teal}`, paddingBottom: "10px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ShieldLogo size={32} />
          <div>
            <div style={{ fontFamily: FONT_HEADING, fontSize: "11px", fontWeight: 700, color: B.purple, letterSpacing: "0.06em", textTransform: "uppercase", lineHeight: 1.2 }}>Secure Pride</div>
            <div style={{ fontSize: "7.5px", color: B.muted }}>Where we draw the line online</div>
          </div>
        </div>
        <div style={{ fontSize: "7px", color: B.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>securepride.org</div>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: FONT_HEADING, fontSize: "28px", fontWeight: 700, color: B.purple, lineHeight: 1.15, marginBottom: "6px" }}>{title}</h1>
        {subtitle && <p style={{ fontSize: "12px", color: B.muted, marginBottom: "4px" }}>{subtitle}</p>}
        <div style={{ width: "60px", height: "3px", borderRadius: "1.5px", background: `linear-gradient(90deg, ${B.teal}, ${B.purple})`, marginTop: "10px" }} />
      </div>

      {intro && (
        <div style={{ fontSize: "11px", lineHeight: "19px", color: B.body, marginBottom: "20px", paddingBottom: "16px", borderBottom: `1px solid ${B.border}` }}>
          {intro}
        </div>
      )}

      <div>{bodyBlocks.map((block, i) => <RenderedBlock key={i} block={block} />)}</div>

      <div style={{ marginTop: "36px", paddingTop: "12px", borderTop: `1px solid ${B.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <ShieldLogo size={16} variant="mono" />
          <span style={{ fontSize: "7.5px", color: B.muted }}>&copy; 2026 Secure Pride &middot; CC BY 4.0</span>
        </div>
        <span style={{ fontSize: "7.5px", color: B.muted }}>securepride.org</span>
      </div>
    </div>
  );
}

// ─── SAMPLE CONTENT ──────────────────────────────────────────
const SAMPLE = `## Who We're Talking To

Our primary audience is community organization leaders at LGBTQ+ nonprofits, community centers, advocacy groups, health clinics, and mutual aid networks.

They have 15 minutes between meetings. They need tools that respect their intelligence without demanding their expertise.

## Voice Principles

### 1. Calm confidence

We speak from a place of competence, not alarm. We are the steady hand, not the siren.

### 2. Culturally competent

We speak as members of the community, not as outsiders offering charity.

### 3. Approachable professional

We are experts who don't need jargon to prove it.

---

## Website Copy

[Headline]: Cybersecurity for the organizations that protect our communities.

[Subheadline]: Secure Pride scans your AI workflows for hidden threats and sensitive data leaks.

[CTA]: Get protected

[Trust bar]: Built by LGBTQ+ technologists. Open source. Your data never leaves your infrastructure.

---

## Pricing

[Community Tier]: Free for organizations with fewer than 10 staff. Full scanner. Full dashboard. No feature gates.

[Organization]: $200/month for teams of 10-50. Priority support, custom policy templates, audit log exports.

[Coalition]: Custom pricing for networks of organizations. Talk to us.`;

// ═══════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════════════
export default function SecurePrideDocEngine() {
  const [templateKey, setTemplateKey] = useState("brand_guide");
  const [data, setData] = useState({
    title:    "Secure Pride Brand Voice Guide",
    subtitle: "v1.0 · March 2026 · Internal & Agency Reference",
    intro:    "This guide defines how Secure Pride speaks across every surface: website, dashboard UI, social media, email, documentation, and partner communications.",
    body:     SAMPLE,
  });
  const [view, setView] = useState("split");

  const template    = TEMPLATES[templateKey];
  const showEditor  = view === "editor"  || view === "split";
  const showPreview = view === "preview" || view === "split";

  const updateField    = (id, val) => setData(prev => ({ ...prev, [id]: val }));
  const switchTemplate = (key) => {
    setTemplateKey(key);
    const next = {};
    TEMPLATES[key].sections.forEach(s => { next[s.id] = s.default || ""; });
    setData(next);
  };

  return (
    <div style={{ minHeight: "100vh", background: B.bgWarm, fontFamily: FONT_BODY }}>
      {/* TOOLBAR */}
      <div className="no-print" role="toolbar" aria-label="Document engine controls" style={{
        background: "white", borderBottom: `2px solid ${B.teal}`, padding: "12px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "12px", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <ShieldLogo size={28} />
          <div>
            <div style={{ fontFamily: FONT_HEADING, fontSize: "14px", fontWeight: 700, color: B.purple }}>Document Engine</div>
            <div style={{ fontSize: "10px", color: B.muted }}>Branded PDF generator · no tracking</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <label htmlFor="tmpl-select" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>Template</label>
          <select id="tmpl-select" value={templateKey} onChange={e => switchTemplate(e.target.value)}
            style={{ padding: "6px 12px", borderRadius: "6px", border: `1px solid ${B.border}`, fontSize: "12px", background: "white", color: B.body, cursor: "pointer", minHeight: "36px" }}>
            {Object.entries(TEMPLATES).map(([k, t]) => <option key={k} value={k}>{t.name}</option>)}
          </select>

          <div role="group" aria-label="View mode" style={{ display: "flex", border: `1px solid ${B.border}`, borderRadius: "6px", overflow: "hidden" }}>
            {[{ key: "editor", label: "Edit" }, { key: "split", label: "Split" }, { key: "preview", label: "Preview" }].map(v => (
              <button key={v.key} onClick={() => setView(v.key)} aria-pressed={view === v.key}
                style={{ padding: "6px 14px", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 600, minHeight: "36px", background: view === v.key ? B.teal : "white", color: view === v.key ? "white" : B.body, transition: "all 150ms" }}>
                {v.label}
              </button>
            ))}
          </div>

          <button onClick={() => window.print()}
            style={{ padding: "6px 18px", borderRadius: "6px", border: "none", background: B.purple, color: "white", fontSize: "12px", fontWeight: 700, cursor: "pointer", minHeight: "36px" }}>
            Export PDF
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ display: "flex", minHeight: "calc(100vh - 70px)" }}>
        {showEditor && (
          <div className="editor-panel" style={{
            flex: view === "split" ? "0 0 45%" : "1", padding: "20px", overflowY: "auto",
            maxHeight: "calc(100vh - 70px)", borderRight: view === "split" ? `1px solid ${B.border}` : "none", background: "white",
          }}>
            <div style={{ maxWidth: "560px" }}>
              <p style={{ fontSize: "11px", color: B.muted, marginBottom: "16px" }}>
                Use Markdown in the body: <code style={{ fontSize: "10px", background: B.copyBg, padding: "1px 4px", borderRadius: "2px" }}>## Heading</code>,{" "}
                <code style={{ fontSize: "10px", background: B.copyBg, padding: "1px 4px", borderRadius: "2px" }}>[Label]: text</code> for copy blocks.
              </p>

              {template.sections.map(s => (
                <div key={s.id} style={{ marginBottom: "16px" }}>
                  <label htmlFor={`f-${s.id}`} style={{ display: "block", fontSize: "11px", fontWeight: 700, color: B.body, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {s.label}
                  </label>
                  {s.type === "text" ? (
                    <input id={`f-${s.id}`} type="text" value={data[s.id] || ""} onChange={e => updateField(s.id, e.target.value)} placeholder={s.placeholder}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: `1px solid ${B.border}`, fontSize: "13px", fontFamily: FONT_BODY, color: B.body, outline: "none", minHeight: "40px" }} />
                  ) : (
                    <textarea id={`f-${s.id}`} value={data[s.id] || ""} onChange={e => updateField(s.id, e.target.value)} placeholder={s.placeholder} rows={s.type === "richtext" ? 20 : 4}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: `1px solid ${B.border}`, fontSize: "12px", fontFamily: s.type === "richtext" ? FONT_MONO : FONT_BODY, color: B.body, lineHeight: "20px", resize: "vertical", outline: "none" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {showPreview && (
          <div className="preview-wrapper" style={{ flex: 1, padding: "24px 20px", overflowY: "auto", maxHeight: "calc(100vh - 70px)", background: B.bgWarm }}>
            <div style={{ background: "white", maxWidth: "680px", margin: "0 auto", padding: "40px 48px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderRadius: "4px", minHeight: "800px" }}>
              <DocumentPreview data={data} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

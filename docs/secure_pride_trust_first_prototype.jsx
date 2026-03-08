export default function SecurePrideTrustFirstPrototype() {
  const principles = [
    {
      title: "Calm, not coercive",
      body: "The interface should reduce panic and increase agency. Security is serious; the UI does not need to cosplay as a breach movie trailer.",
    },
    {
      title: "Evidence over mystique",
      body: "Every score, label, and recommendation should point back to observable checks, not branded black-box machinery.",
    },
    {
      title: "Consent before inspection",
      body: "Sensitive categories are opt-in, plainly described, and processed locally unless the user chooses otherwise.",
    },
    {
      title: "Protective, not punitive",
      body: "Findings explain risk in plain English and emphasize remediation paths instead of shame-inducing posture labels.",
    },
  ];

  const checks = [
    "Credential hygiene",
    "Certificate trust and expiry",
    "Browser and storage exposure",
    "Device security settings",
    "Legacy crypto and protocol usage",
    "Recovery code handling",
  ];

  const findings = [
    {
      title: "Outdated TLS profile",
      status: "Needs attention",
      detail: "One endpoint still negotiates legacy cipher suites. Modern clients may downgrade or fail closed.",
      action: "Disable legacy TLS and rotate the certificate chain.",
    },
    {
      title: "Recovery codes stored as plain text",
      status: "High priority",
      detail: "Recovery material appears outside encrypted storage. This increases account takeover risk if the device is exposed.",
      action: "Move codes into encrypted storage and remove local plaintext copies.",
    },
    {
      title: "SSH key posture",
      status: "Healthy",
      detail: "Modern key type detected with no immediate structural issue visible from this audit layer.",
      action: "Keep rotation and passphrase policy in place.",
    },
  ];

  const pillars = [
    {
      eyebrow: "Runs locally",
      title: "Your secrets stay on your device unless you choose otherwise.",
      body: "Secure Pride should lead with local-first analysis, explicit permission boundaries, and inspectable scope. Trust is built by refusing unnecessary access.",
    },
    {
      eyebrow: "Inspectable method",
      title: "Every result should answer: what was checked, why it matters, and what to do next.",
      body: "No ornamental certainty. No haunted percentages from the void. Findings are grounded in observable evidence and linked remediation paths.",
    },
  ];

  const designLanguage = [
    "Protective minimalism",
    "High-contrast typography with soft surfaces",
    "Dense information, calm pacing",
    "Muted urgency reserved for verified risk",
    "System diagrams and checklists over theatrical chrome",
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <header className="mb-12 flex flex-col gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
              Secure Pride — Trust-first audit concept
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
              Know your security posture <span className="text-emerald-300">without handing over your secrets.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300 md:text-lg">
              A calmer, more credible interface for security review: local-first, consent-aware, evidence-based, and built to protect people who already have enough chaos in their lives.
            </p>
          </div>

          <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 backdrop-blur md:min-w-[320px]">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <span className="text-sm text-zinc-400">Audit state</span>
              <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-200">Not run yet</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
              <span className="text-sm text-emerald-100">Processing mode</span>
              <span className="text-sm font-medium text-emerald-300">Local device analysis</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <span className="text-sm text-zinc-400">Sensitive categories</span>
              <span className="text-sm font-medium text-zinc-100">Opt-in only</span>
            </div>
            <button className="mt-1 rounded-2xl bg-emerald-300 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:scale-[1.01]">
              Review scope before starting
            </button>
          </div>
        </header>

        <section className="mb-12 grid gap-4 lg:grid-cols-2">
          {pillars.map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">{item.eyebrow}</div>
              <h2 className="mt-3 text-2xl font-semibold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-300">{item.body}</p>
            </div>
          ))}
        </section>

        <section className="mb-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">What the product signals</div>
                <h2 className="mt-2 text-2xl font-semibold text-white">Design language</h2>
              </div>
              <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300">Protective minimalism</div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {designLanguage.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-200">
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {principles.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-zinc-900/80 p-5">
                  <h3 className="text-base font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-emerald-400/10 to-transparent p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Before an audit begins</div>
            <h2 className="mt-2 text-2xl font-semibold text-white">Scope should be visible and legible.</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-300">
              Users should know exactly what categories are checked, what permissions are needed, and what never leaves the device. Security UX should feel like a clear contract, not a ritual.
            </p>
            <div className="mt-6 space-y-3">
              {checks.map((check) => (
                <div key={check} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm">
                  <span className="text-zinc-200">{check}</span>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-zinc-300">Optional / explained</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-12 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Audit preview</div>
              <h2 className="mt-2 text-2xl font-semibold text-white">Findings should read like a clinician’s notes, not a haunted dashboard.</h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-300">
              Scores are derived from visible checks and weighted risk classes.
            </div>
          </div>

          <div className="grid gap-4">
            {findings.map((finding) => (
              <div key={finding.title} className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{finding.title}</h3>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-300">{finding.detail}</p>
                  </div>
                  <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-200">
                    {finding.status}
                  </span>
                </div>
                <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                  Recommended action: <span className="font-medium text-emerald-300">{finding.action}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Opinionated direction</div>
            <h2 className="mt-2 text-2xl font-semibold text-white">The brand should feel like a shield with a nervous system.</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-300">
              Not sterile enterprise chrome. Not cyberpunk melodrama. Secure Pride should signal human protection, technical seriousness, and emotional steadiness at the same time.
            </p>
            <div className="mt-5 space-y-3 text-sm text-zinc-300">
              <p><span className="font-medium text-white">Color:</span> charcoal and graphite foundations, restrained emerald or teal for trust, rare amber for caution, rare crimson only for verified severe risk.</p>
              <p><span className="font-medium text-white">Typography:</span> clean grotesk or neo-grotesk sans with generous spacing; use strong hierarchy instead of neon spectacle.</p>
              <p><span className="font-medium text-white">Motion:</span> subtle confirmation, not ambient intimidation. Movement should clarify state changes, not dramatize danger.</p>
              <p><span className="font-medium text-white">Language:</span> “what we checked,” “why it matters,” “recommended action,” “processed locally,” “permission required.” The UI should sound like it respects the user’s time and nervous system.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">North star</div>
            <h2 className="mt-2 text-3xl font-semibold text-white">Protection should feel legible.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-100/90">
              The strongest version of Secure Pride is a product that can be trusted by people who already have reasons to distrust vague systems. Every screen should quietly answer three questions: what is happening, why is it needed, and how much control do I have?
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button className="rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.01]">
                Start with a visible scope review
              </button>
              <button className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                Read the audit method
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

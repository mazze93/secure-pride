'use strict';

// ==========================================
// Confidence Gauge
// ==========================================
function updateGauge(percent) {
    const circle = document.getElementById('confidenceGauge');
    const circumference = 2 * Math.PI * 70;
    circle.style.strokeDashoffset = circumference - (percent / 100) * circumference;
    document.getElementById('confidenceValue').textContent = `${Math.round(percent)}%`;

    const postureEl = document.getElementById('postureStatus');
    if (percent < 20)       postureEl.textContent = 'Fragile';
    else if (percent < 50)  postureEl.textContent = 'Vulnerable';
    else if (percent < 75)  postureEl.textContent = 'Baseline';
    else                    postureEl.textContent = 'Robust';
}

// ==========================================
// Finding card builder (reused for real results)
// ==========================================
function buildFindingCard(item) {
    const scoreClass = item.status === 'pass' ? 'score-pass'
                     : item.status === 'warn' ? 'score-warn'
                     : 'score-fail';

    const name = document.createElement('div');
    name.className = 'finding-name';
    name.textContent = item.name;

    const detail = document.createElement('div');
    detail.className = 'finding-detail';
    detail.textContent = item.detail;

    const body = document.createElement('div');
    body.className = 'finding-body';
    body.appendChild(name);
    body.appendChild(detail);

    const pill = document.createElement('span');
    pill.className = `status-pill ${item.status}`;
    pill.textContent = item.status.toUpperCase();

    const header = document.createElement('div');
    header.className = 'finding-item-header';
    header.appendChild(body);
    header.appendChild(pill);

    const score = document.createElement('div');
    score.className = `finding-score ${scoreClass}`;
    score.textContent = `Score: ${item.score > 0 ? '+' : ''}${item.score}`;

    const card = document.createElement('div');
    card.className = 'finding-item';
    card.appendChild(header);
    card.appendChild(score);

    return card;
}

// ==========================================
// Render real DLP scan results
// ==========================================
function renderScanResults(result) {
    const feed = document.getElementById('auditFeed');
    feed.replaceChildren();

    if (result.blocked) {
        const banner = document.createElement('div');
        banner.className = 'scan-blocked-banner';
        banner.setAttribute('role', 'alert');
        banner.textContent = 'Scan blocked — sensitive content detected. Do not send this text to an AI service.';
        feed.appendChild(banner);
    }

    result.injections.forEach((inj, i) => {
        const status = (inj.severity === 'critical' || inj.severity === 'high') ? 'fail' : 'warn';
        const score  = inj.severity === 'critical' ? -25 : inj.severity === 'high' ? -20 : -10;
        setTimeout(() => {
            feed.appendChild(buildFindingCard({
                name:   inj.pattern_name.replace(/_/g, ' ').toUpperCase(),
                detail: inj.description,
                status,
                score,
            }));
        }, i * 120);
    });

    const offset = result.injections.length;
    result.pii_matches.forEach((pii, i) => {
        setTimeout(() => {
            feed.appendChild(buildFindingCard({
                name:   pii.pii_type.replace(/_/g, ' ').toUpperCase(),
                detail: `Masked: ${pii.masked}`,
                status: 'warn',
                score:  -8,
            }));
        }, (offset + i) * 120);
    });

    if (!result.blocked && result.injection_count === 0 && result.pii_count === 0) {
        feed.appendChild(buildFindingCard({
            name:   'No threats detected',
            detail: 'Text is safe to use with AI services',
            status: 'pass',
            score:  30,
        }));
    }

    // Update sidebar stats
    document.getElementById('totalCreds').textContent =
        result.injection_count + result.pii_count;

    const legacySpan = document.createElement('span');
    legacySpan.className = 'text-magenta';
    legacySpan.textContent = result.injection_count;
    document.getElementById('legacyCount').replaceChildren(legacySpan);

    // Gauge target — delayed until cards finish animating in
    const gaugeTarget = result.blocked ? 20 : result.pii_count > 0 ? 55 : 85;
    const delay = (result.injection_count + result.pii_count) * 120 + 100;
    setTimeout(() => updateGauge(gaugeTarget), delay);
}

// ==========================================
// Inline error display
// ==========================================
function renderError(message) {
    const feed = document.getElementById('auditFeed');
    const p = document.createElement('p');
    p.className = 'scan-placeholder-text';
    p.textContent = message;
    const card = document.createElement('div');
    card.className = 'scan-placeholder';
    card.appendChild(p);
    feed.replaceChildren(card);
    updateGauge(0);
}

// ==========================================
// Main scan — calls live /api/scan
// ==========================================
async function startAudit() {
    const textarea = document.getElementById('scanInput');
    const btn      = document.getElementById('initScanBtn');
    const text     = textarea.value.trim();
    if (!text) return;

    // Loading state
    const feed = document.getElementById('auditFeed');
    const loadingText    = document.createElement('p');
    loadingText.className = 'scan-placeholder-text';
    loadingText.textContent = 'Scanning…';
    const loadingSubtext    = document.createElement('p');
    loadingSubtext.className = 'scan-placeholder-subtext';
    loadingSubtext.textContent = 'Checking for PII and injection patterns';
    const placeholder    = document.createElement('div');
    placeholder.className = 'scan-placeholder pulse';
    placeholder.appendChild(loadingText);
    placeholder.appendChild(loadingSubtext);
    feed.replaceChildren(placeholder);

    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    updateGauge(0);

    try {
        const response = await fetch('/api/scan', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ text, actor_id: 'anonymous' }),
        });

        if (response.status === 429) {
            renderError('Too many requests — please wait a moment and try again.');
            return;
        }
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            renderError(err.detail || 'Scanner error — please try again.');
            return;
        }

        const result = await response.json();
        renderScanResults(result);
    } catch {
        renderError('Scanner unavailable — check your connection.');
    } finally {
        btn.disabled = false;
        btn.setAttribute('aria-busy', 'false');
    }
}

// ==========================================
// Clear handler
// ==========================================
function clearScanner() {
    document.getElementById('scanInput').value = '';
    document.getElementById('initScanBtn').disabled = true;
    updateGauge(0);
    document.getElementById('totalCreds').textContent = '--';
    document.getElementById('legacyCount').textContent = '--';

    const p1 = document.createElement('p');
    p1.className = 'scan-placeholder-text';
    p1.textContent = 'Paste text above to begin scanning';
    const p2 = document.createElement('p');
    p2.className = 'scan-placeholder-subtext';
    p2.textContent = 'Detects PII, credentials, and prompt injection patterns';
    const placeholder = document.createElement('div');
    placeholder.className = 'scan-placeholder';
    placeholder.appendChild(p1);
    placeholder.appendChild(p2);
    document.getElementById('auditFeed').replaceChildren(placeholder);
}

// ==========================================
// Init
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    updateGauge(0);

    const textarea = document.getElementById('scanInput');
    const btn      = document.getElementById('initScanBtn');

    textarea.addEventListener('input', () => {
        btn.disabled = textarea.value.trim().length === 0;
    });

    btn.addEventListener('click', startAudit);
    document.getElementById('clearBtn').addEventListener('click', clearScanner);
});

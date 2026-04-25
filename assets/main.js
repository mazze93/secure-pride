'use strict';

// ==========================================
// Mock Audit Data: Secure Pride Standards
// ==========================================
const mockData = [
    { id: "CERT_001", name: "Legacy TLS Profile",       detail: "SHA-1 / RSA-1024",          status: "fail", score: -15 },
    { id: "PROT_001", name: "Corporate Intranet",        detail: "Insecure Protocol (HTTP)",   status: "warn", score:  -5 },
    { id: "CERT_002", name: "Apple Root CA",             detail: "System Verified",            status: "pass", score:  10 },
    { id: "KEY_882",  name: "Development SSH Key",       detail: "ED25519 (Modern)",           status: "pass", score:  20 },
    { id: "NOTE_01",  name: "Financial Recovery Codes",  detail: "Unencrypted Note",           status: "fail", score: -20 },
];

// ==========================================
// Bayesian Confidence Gauge Update
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
// Build a single finding card via DOM API
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
// Audit Feed Renderer
// ==========================================
function renderAuditFeed() {
    const feed = document.getElementById('auditFeed');
    feed.replaceChildren();

    let totalScore = 40; // Base confidence
    let legacyCount = 0;

    mockData.forEach((item, index) => {
        if (item.status !== 'pass') legacyCount++;

        setTimeout(() => {
            feed.appendChild(buildFindingCard(item));
            totalScore = Math.max(0, Math.min(100, totalScore + item.score));
            updateGauge(totalScore);
        }, index * 150);
    });

    setTimeout(() => {
        document.getElementById('totalCreds').textContent = mockData.length;

        const legacySpan = document.createElement('span');
        legacySpan.className = 'text-magenta';
        legacySpan.textContent = legacyCount;
        document.getElementById('legacyCount').replaceChildren(legacySpan);
    }, mockData.length * 150);
}

// ==========================================
// Async Scan Simulation with Bayesian Processing
// ==========================================
async function startAudit() {
    const feed = document.getElementById('auditFeed');

    const text = document.createElement('p');
    text.className = 'scan-placeholder-text';
    text.textContent = 'Starting credential scan...';

    const subtext = document.createElement('p');
    subtext.className = 'scan-placeholder-subtext';
    subtext.textContent = 'Bayesian inference in progress';

    const placeholder = document.createElement('div');
    placeholder.className = 'scan-placeholder pulse';
    placeholder.appendChild(text);
    placeholder.appendChild(subtext);

    feed.replaceChildren(placeholder);

    await new Promise(r => setTimeout(r, 800));
    renderAuditFeed();
}

// ==========================================
// Initialization
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    updateGauge(0);
    document.getElementById('initScanBtn').addEventListener('click', startAudit);
});

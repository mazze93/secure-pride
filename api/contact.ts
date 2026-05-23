import type { VercelRequest, VercelResponse } from '@vercel/node';

// Rate limiting — simple in-memory store (resets on cold start, sufficient for low volume)
const submissions = new Map<string, number[]>();
const RATE_LIMIT = 3;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const times = (submissions.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (times.length >= RATE_LIMIT) return true;
  submissions.set(ip, [...times, now]);
  return false;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many submissions. Please try again later.' });
  }

const { name, email, organization, message } = req.body ?? {};

  // 1. Type Check: Ensure all required fields are actual strings
  if (
    typeof name !== 'string' || 
    typeof email !== 'string' || 
    typeof message !== 'string'
  ) {
    return res.status(400).json({ error: 'Invalid input types.' });
  }

  // 2. Presence Check: Ensure they aren't just empty spaces
  if (!name.trim() || !email.trim() || !message.trim()) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  // 3. Optimized Regex Format Check (Prevents Polynomial ReDoS)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }
  // Field length limits
  if (name.length > 100 || email.length > 254 || message.length > 5000) {
    return res.status(400).json({ error: 'Input exceeds allowed length.' });
  }

  // Forward to Cloudflare Worker or other email endpoint
  // Set CONTACT_ENDPOINT in Vercel env vars pointing to your CF Worker URL
  const endpoint = process.env.CONTACT_ENDPOINT;

  if (endpoint) {
    try {
      const upstream = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, organization: organization ?? '', message }),
      });

      if (!upstream.ok) {
        console.error('Upstream contact endpoint returned', upstream.status);
        return res.status(502).json({ error: 'Failed to send message. Please try again.' });
      }
    } catch (err) {
      console.error('Contact endpoint error:', err);
      return res.status(502).json({ error: 'Failed to send message. Please try again.' });
    }
  } else {
    // No endpoint configured — log and acknowledge
    // Replace with direct email sending (e.g. Resend, Nodemailer) if not using CF Worker
    console.log('[contact form]', { name, email, organization, message: message.slice(0, 100) });
  }

  return res.status(200).json({ ok: true });
}

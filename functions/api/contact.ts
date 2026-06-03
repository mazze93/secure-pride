interface Env {
  CONTACT_ENDPOINT?: string;
  RESEND_API_KEY?: string;
}

interface ContactBody {
  name?: unknown;
  email?: unknown;
  organization?: unknown;
  message?: unknown;
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const { request, env } = context;

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return Response.json({ error: 'Invalid content type.' }, { status: 400 });
  }

  let body: ContactBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { name, email, organization, message } = body;

  if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
    return Response.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  if (!name.trim() || !email.trim() || !message.trim()) {
    return Response.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  if (name.length > 100 || email.length > 254 || message.length > 5000) {
    return Response.json({ error: 'Input exceeds allowed length.' }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Invalid email address.' }, { status: 400 });
  }

  const org = typeof organization === 'string' ? organization.slice(0, 200) : '';

  // Option 1: Forward to a custom endpoint
  if (env.CONTACT_ENDPOINT) {
    try {
      const upstream = await fetch(env.CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, organization: org, message }),
      });
      if (!upstream.ok) {
        return Response.json({ error: 'Failed to send message. Please try again.' }, { status: 502 });
      }
    } catch {
      return Response.json({ error: 'Failed to send message. Please try again.' }, { status: 502 });
    }
    return Response.json({ ok: true });
  }

  // Option 2: Send directly via Resend
  if (env.RESEND_API_KEY) {
    const subject = org
      ? `Contact from ${name} (${org})`
      : `Contact from ${name}`;

    const text = [
      `Name: ${name}`,
      `Email: ${email}`,
      org ? `Organization: ${org}` : null,
      '',
      message,
    ].filter(Boolean).join('\n');

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'contact-form@securepride.org',
          to: 'hello@securepride.org',
          reply_to: email,
          subject,
          text,
        }),
      });

      if (!res.ok) {
        console.error('Resend error', res.status);
        return Response.json({ error: 'Failed to send message. Please try again.' }, { status: 502 });
      }
    } catch (err) {
      console.error('Resend error', err);
      return Response.json({ error: 'Failed to send message. Please try again.' }, { status: 502 });
    }

    return Response.json({ ok: true });
  }

  // No delivery method configured — log and acknowledge so the form still works during setup
  console.log('[contact-form]', { name, email, org, preview: message.slice(0, 80) });
  return Response.json({ ok: true });
}

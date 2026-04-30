import React, { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  organization: string;
  message: string;
  consent: boolean;
  honeypot: string;
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    organization: '',
    message: '',
    consent: false,
    honeypot: '',
  });

  const [status, setStatus] = useState<FormStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type, value, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.honeypot) {
      setStatus('success');
      setStatusMessage('Thanks for your message!');
      setTimeout(() => setStatus('idle'), 5000);
      return;
    }

    if (!formData.name || !formData.email || !formData.message || !formData.consent) {
      setStatus('error');
      setStatusMessage('Please fill in all required fields and accept the privacy policy.');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          organization: formData.organization,
          message: formData.message,
        }),
      });

      if (response.ok) {
        setStatus('success');
        setStatusMessage("Thanks for your message! We'll be in touch soon.");
        setFormData({ name: '', email: '', organization: '', message: '', consent: false, honeypot: '' });
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        setStatusMessage('Something went wrong. Please try again later.');
      }
    } catch {
      setStatus('error');
      setStatusMessage('Something went wrong. Please try again later.');
    }
  };

  return (
    <form name="contact" onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Honeypot — hidden from real users */}
      <input
        type="text"
        name="honeypot"
        value={formData.honeypot}
        onChange={handleChange}
        style={{ display: 'none' }}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div>
        <label htmlFor="name" className="block text-sm font-heading font-bold text-text-primary mb-2">
          Your Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-dark-border bg-dark-surface px-4 py-2 text-text-primary placeholder-text-secondary transition-colors duration-250 focus:border-neon-cyan focus:outline-none"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-heading font-bold text-text-primary mb-2">
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-dark-border bg-dark-surface px-4 py-2 text-text-primary placeholder-text-secondary transition-colors duration-250 focus:border-neon-cyan focus:outline-none"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="organization" className="block text-sm font-heading font-bold text-text-primary mb-2">
          Organization
        </label>
        <input
          type="text"
          id="organization"
          name="organization"
          value={formData.organization}
          onChange={handleChange}
          className="w-full rounded-lg border border-dark-border bg-dark-surface px-4 py-2 text-text-primary placeholder-text-secondary transition-colors duration-250 focus:border-neon-cyan focus:outline-none"
          placeholder="Your organization (optional)"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-heading font-bold text-text-primary mb-2">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          className="w-full rounded-lg border border-dark-border bg-dark-surface px-4 py-2 text-text-primary placeholder-text-secondary transition-colors duration-250 focus:border-neon-cyan focus:outline-none"
          placeholder="Tell us about your needs..."
        />
      </div>

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="consent"
          name="consent"
          checked={formData.consent}
          onChange={handleChange}
          required
          className="mt-1 h-4 w-4 rounded border-dark-border accent-neon-cyan focus:outline-neon-cyan"
        />
        <label htmlFor="consent" className="text-sm text-text-secondary">
          I agree that SecurePride may contact me about this request. We respect your privacy
          and will never share your information with third parties. *
        </label>
      </div>

      {status === 'success' && (
        <div className="rounded-lg bg-neon-cyan/10 border border-neon-cyan p-4 text-neon-cyan" role="alert">
          {statusMessage}
        </div>
      )}
      {status === 'error' && (
        <div className="rounded-lg bg-neon-pink/10 border border-neon-pink p-4 text-neon-pink" role="alert">
          {statusMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full rounded-lg bg-neon-cyan px-6 py-3 font-heading font-bold text-dark-bg transition-all duration-250 hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed focus:outline-2 focus:outline-offset-2 focus:outline-neon-cyan"
      >
        {status === 'loading' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}

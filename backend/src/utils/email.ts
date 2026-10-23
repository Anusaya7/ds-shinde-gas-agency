import config from '../config/index.js';

export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html: string;
}

function logDevEmail(to: string, subject: string, body: string): void {
  console.log('----------------------------------------------------');
  console.log(`[DEV EMAIL] To: ${to}`);
  console.log(`[DEV EMAIL] Subject: ${subject}`);
  console.log(`[DEV EMAIL] Body:\n${body}`);
  console.log('----------------------------------------------------');
}

async function sendWithResend(options: SendEmailOptions): Promise<boolean> {
  const { to, subject, text, html } = options;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.resend.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: config.resend.from,
      to: [to],
      subject,
      html,
      text: text || undefined,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend ${response.status}: ${details}`);
  }

  return true;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const { to, subject, text, html } = options;

  if (!config.resend.apiKey) {
    if (config.isDev) {
      logDevEmail(to, subject, text || html);
      return true;
    }
    console.error('Email is not configured. Set RESEND_API_KEY.');
    return false;
  }

  try {
    await sendWithResend(options);
    return true;
  } catch (error) {
    console.error('Failed to send email via Resend:', error);
    if (config.isDev) {
      logDevEmail(to, subject, text || html);
      return true;
    }
    return false;
  }
}

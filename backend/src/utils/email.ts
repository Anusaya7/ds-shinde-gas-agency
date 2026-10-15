import nodemailer from 'nodemailer';
import config from '../config/index.js';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: config.smtp.user
        ? {
            user: config.smtp.user,
            pass: config.smtp.pass,
          }
        : undefined,
    });
  }
  return transporter;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const { to, subject, text, html } = options;

  // In development mode or if SMTP is unconfigured, log to console
  if (config.isDev && !config.smtp.user) {
    console.log('----------------------------------------------------');
    console.log(`[DEV EMAIL] To: ${to}`);
    console.log(`[DEV EMAIL] Subject: ${subject}`);
    console.log(`[DEV EMAIL] Body:\n${text || html}`);
    console.log('----------------------------------------------------');
    return true;
  }

  try {
    const client = getTransporter();
    await client.sendMail({
      from: config.smtp.from,
      to,
      subject,
      text,
      html,
    });
    return true;
  } catch (error) {
    console.error('Failed to send email via SMTP:', error);
    // In dev mode, don't break flow even if SMTP fails
    if (config.isDev) {
      console.log(`[DEV FALLBACK] Email would have been sent to ${to}: ${subject}`);
      return true;
    }
    return false;
  }
}

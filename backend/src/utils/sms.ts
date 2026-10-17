import config from '../config/index.js';

export interface SendSmsOptions {
  phone: string;
  message: string;
}

/**
 * Normalize an Indian mobile number to MSG91's 10-digit format
 * Accepts: 9876543210, +919876543210, 919876543210, 09876543210
 */
function normalizeIndianMobile(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10 && /^[6-9]/.test(digits)) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return null;
}

/**
 * Send OTP SMS via MSG91 transactional route.
 * MSG91 flow: create an OTP template in the MSG91 panel (DLT approved),
 * set MSG91_AUTH_KEY + MSG91_OTP_TEMPLATE_ID in .env, and the template's
 * {#var#} placeholder receives the 6-digit code.
 */
async function sendViaMsg91(phone: string, message: string): Promise<boolean> {
  const { authKey, templateId } = config.sms.msg91;
  const mobile = normalizeIndianMobile(phone);

  if (!authKey || !templateId) {
    console.warn(
      '[SMS] MSG91 selected but MSG91_AUTH_KEY / MSG91_OTP_TEMPLATE_ID missing. SMS not sent.'
    );
    return false;
  }
  if (!mobile) {
    console.warn(`[SMS] Invalid Indian mobile number: ${phone}`);
    return false;
  }

  // Extract the 6-digit OTP from the message body
  const otpMatch = message.match(/\b\d{6}\b/);
  const otp = otpMatch ? otpMatch[0] : '';

  try {
    const res = await fetch('https://control.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: {
        'authkey': authKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template_id: templateId,
        short_url: '0',
        recipients: [{ mobiles: `91${mobile}`, OTP: otp }],
      }),
    });

    const data = (await res.json()) as { type?: string; message?: string };

    if (res.ok && data.type === 'success') {
      return true;
    }
    console.error('[SMS] MSG91 error:', data.message || data);
    return false;
  } catch (error) {
    console.error('[SMS] MSG91 request failed:', error);
    return false;
  }
}

export async function sendSms(options: SendSmsOptions): Promise<boolean> {
  const { phone, message } = options;

  // Always log in dev so OTP is visible in the console for testing
  if (config.isDev) {
    console.log('----------------------------------------------------');
    console.log(`[DEV SMS] Sender: ${config.sms.senderId}`);
    console.log(`[DEV SMS] To: ${phone}`);
    console.log(`[DEV SMS] Message: ${message}`);
    console.log('----------------------------------------------------');
  }

  // Real SMS delivery when MSG91 is configured (dev or production)
  if (config.sms.provider === 'msg91') {
    return sendViaMsg91(phone, message);
  }

  if (!config.isDev) {
    console.error(
      `SMS delivery is unavailable for provider "${config.sms.provider}". Configure MSG91 (SMS_PROVIDER=msg91) before enabling SMS notifications.`
    );
  }
  // mock provider in dev: treat as delivered so the OTP flow completes
  return config.isDev;
}

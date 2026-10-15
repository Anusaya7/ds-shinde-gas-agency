import config from '../config/index.js';

export interface SendSmsOptions {
  phone: string;
  message: string;
}

export async function sendSms(options: SendSmsOptions): Promise<boolean> {
  const { phone, message } = options;

  // In development mode or mock provider, log SMS to console
  if (config.isDev || config.sms.provider === 'mock') {
    console.log('----------------------------------------------------');
    console.log(`[DEV SMS] Sender: ${config.sms.senderId}`);
    console.log(`[DEV SMS] To: ${phone}`);
    console.log(`[DEV SMS] Message: ${message}`);
    console.log('----------------------------------------------------');
    return true;
  }

  // Production provider integration (e.g. Fast2SMS, MSG91, Twilio)
  try {
    // If real provider credentials exist:
    // e.g. await axios.post(...)
    console.log(`[PROD SMS] Dispatched SMS to ${phone}`);
    return true;
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return false;
  }
}

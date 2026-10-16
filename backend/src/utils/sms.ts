import config from '../config/index.js';

export interface SendSmsOptions {
  phone: string;
  message: string;
}

export async function sendSms(options: SendSmsOptions): Promise<boolean> {
  const { phone, message } = options;

  if (config.isDev && config.sms.provider === 'mock') {
    console.log('----------------------------------------------------');
    console.log(`[DEV SMS] Sender: ${config.sms.senderId}`);
    console.log(`[DEV SMS] To: ${phone}`);
    console.log(`[DEV SMS] Message: ${message}`);
    console.log('----------------------------------------------------');
    return true;
  }

  console.error(
    `SMS delivery is unavailable for provider "${config.sms.provider}". Configure a real SMS gateway before enabling SMS notifications.`
  );
  return false;
}

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { AppError, BadRequestError } from './errors.js';

const FORMAT = Buffer.from('DSD1');
const NONCE_LENGTH = 12;
const TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const configuredKey = process.env.DOCUMENT_ENCRYPTION_KEY;
  if (!configuredKey || !/^[a-fA-F0-9]{64}$/.test(configuredKey)) {
    throw new AppError(
      'Document storage is not configured. Set DOCUMENT_ENCRYPTION_KEY to a random 32-byte hexadecimal key before uploading documents.'
      , 503
    );
  }
  return Buffer.from(configuredKey, 'hex');
}

export function encryptDocument(document: Buffer): Buffer {
  const nonce = randomBytes(NONCE_LENGTH);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), nonce);
  const ciphertext = Buffer.concat([cipher.update(document), cipher.final()]);
  return Buffer.concat([FORMAT, nonce, cipher.getAuthTag(), ciphertext]);
}

export function decryptDocument(encryptedDocument: Uint8Array): Buffer {
  const payload = Buffer.from(encryptedDocument);
  const headerLength = FORMAT.length + NONCE_LENGTH + TAG_LENGTH;
  if (payload.length <= headerLength || !payload.subarray(0, FORMAT.length).equals(FORMAT)) {
    throw new BadRequestError('Document encryption format is invalid.');
  }

  const nonceStart = FORMAT.length;
  const tagStart = nonceStart + NONCE_LENGTH;
  const ciphertextStart = tagStart + TAG_LENGTH;
  const decipher = createDecipheriv(
    'aes-256-gcm',
    getEncryptionKey(),
    payload.subarray(nonceStart, tagStart)
  );
  decipher.setAuthTag(payload.subarray(tagStart, ciphertextStart));
  return Buffer.concat([
    decipher.update(payload.subarray(ciphertextStart)),
    decipher.final(),
  ]);
}

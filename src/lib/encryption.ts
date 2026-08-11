import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = (import.meta as any).env.VITE_ENCRYPTION_KEY || 'development-fallback-key-please-replace-in-production';

if (!(import.meta as any).env.VITE_ENCRYPTION_KEY) {
  console.warn('VITE_ENCRYPTION_KEY is not defined. Using a fallback key for development.');
}

export const encryptData = (data: string): string => {
  if (data.startsWith("ENC:")) return data;
  return "ENC:" + CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

export const decryptData = (ciphertext: string): string => {
  try {
    if (!ciphertext) return '';
    if (!ciphertext.startsWith("ENC:")) return ciphertext;

    const encryptedData = ciphertext.substring(4);
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    
    if (decryptedText && /^[\x00-\xFF\u0000-\uFFFF]*$/.test(decryptedText)) {
      return decryptedText;
    }
    return ciphertext;
  } catch (e) {
    console.error("Failed to decrypt data", e);
    return ciphertext;
  }
};

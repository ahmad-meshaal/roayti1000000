import { resizeAndCompressImage } from '../utils/image';

/**
 * Uploads a base64 image via the api-server to Firebase Storage.
 * Falls back to returning the compressed base64 directly if the upload fails,
 * so the caller can store it in Firestore instead.
 */
export const uploadBase64Image = async (base64Data: string, _path: string): Promise<string> => {
  const uploadUrl = `${(import.meta.env.BASE_URL as string) || '/'}api/upload`.replace('//', '/');

  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Data, path: _path }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.url) return data.url as string;
    }
  } catch {
    // Network error or server unavailable — fall through to base64 fallback
  }

  // Fallback: return the base64 data itself so the caller can store it in Firestore
  return base64Data;
};

/**
 * Uploads a raw File object. Falls back to base64 Firestore storage if needed.
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
  const compressed = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  }).then(b64 => resizeAndCompressImage(b64, 800, 800, 0.7)).catch(async () => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  });

  return uploadBase64Image(compressed, path);
};

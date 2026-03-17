import { Buffer } from 'buffer';

export async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  let attempt = 0;
  let delay = 500;

  while (attempt < retries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s

      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        return res;
      }
      
      // If 5xx or 429, throw to trigger retry
      if (res.status >= 500 || res.status === 429 || res.status === 503) {
        throw new Error(`HTTP Error: ${res.status}`);
      } else {
        return res; 
      }
    } catch (error) {
      attempt++;
      if (attempt >= retries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; 
    }
  }
  throw new Error('Max retries reached');
}

export async function detectImageWithHF(imageBuffer: Buffer, token: string) {
  // prithivMLmods/Deep-Fake-Detector-v2-Model
  const url = "https://api-inference.huggingface.co/models/prithivMLmods/Deep-Fake-Detector-v2-Model";
  
  const res = await fetchWithRetry(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/octet-stream",
    },
    body: imageBuffer as any,
  });

  if (!res.ok) {
    throw new Error(`HF API failed: ${res.statusText}`);
  }

  const result = await res.json();
  /*
    Expected HF format for classification:
    [
      { label: "Realism" / "Deepfake" / "Real" / "Fake", score: 0.99 },
      ...
    ]
  */
  return result;
}

export async function detectAudioWithHF(audioBuffer: Buffer, token: string) {
  // Melina/deepfake-audio-detection
  const url = "https://api-inference.huggingface.co/models/Melina/deepfake-audio-detection";
  
  const res = await fetchWithRetry(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/octet-stream",
    },
    body: audioBuffer as any,
  });

  if (!res.ok) {
    throw new Error(`HF API failed: ${res.statusText}`);
  }

  return await res.json();
}

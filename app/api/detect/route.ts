import { NextResponse } from 'next/server';
import { detectImageWithHF, detectAudioWithHF } from '@/lib/apiClient';
import { computeImageFallback } from '@/lib/fallbackImage';
import { computeAudioFallback } from '@/lib/fallbackAudio';

export const maxDuration = 60; // Allow sufficient time for large file uploads & API calls

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const hfTokenRaw = process.env.HF_API_KEY || process.env.DEEPFAKE_API_KEY;
    const hfToken = hfTokenRaw ? hfTokenRaw.trim() : undefined;

    let resultData;

    // Detect if Audio or Image
    if (type === 'audio' || file.type.startsWith('audio/')) {
      if (hfToken) {
        try {
          const hfRes = await detectAudioWithHF(buffer, hfToken);
          // Expected: [{ label: 'fake', score: 0.99 }]
          if (Array.isArray(hfRes) && hfRes.length > 0 && hfRes[0].score !== undefined) {
             const top = hfRes[0];
             const isFake = top.label.toLowerCase().includes('fake');
             resultData = {
               result: isFake ? "Fake" : "Real",
               confidence: Math.round(top.score * 100),
               explanation: [`Primary API pattern found: ${top.label}`, `High certainty derived from audio features.`],
               source: "primary-api"
             };
          }
        } catch (err) {
          console.warn('Primary Audio API failed, falling back to OSS heuristic.', err);
        }
      }
      
      if (!resultData) {
        resultData = await computeAudioFallback(buffer);
      }
      
    } else {
      // Default: Image Detection
      if (hfToken) {
        try {
          const hfRes = await detectImageWithHF(buffer, hfToken);
          if (Array.isArray(hfRes) && hfRes.length > 0 && hfRes[0].score !== undefined) {
             const topLabel = hfRes[0].label.toLowerCase();
             let resultFlag = "Suspicious";
             
             if (topLabel.includes("deepfake") || topLabel.includes("fake")) resultFlag = "Fake";
             if (topLabel.includes("realism") || topLabel.includes("real")) resultFlag = "Real";
             
             resultData = {
               result: resultFlag,
               confidence: Math.round(hfRes[0].score * 100),
               explanation: [`Primary ML model classified image as: ${hfRes[0].label}`, `Confidence score: ${Math.round(hfRes[0].score * 100)}%`],
               source: "primary-api"
             };
          }
        } catch (err) {
          console.warn('Primary Image API failed, falling back to OSS heuristic.', err);
        }
      }

      if (!resultData) {
        resultData = await computeImageFallback(buffer);
      }
    }

    if (!resultData) {
      // Final Deterministic Heuristic
      resultData = {
        result: "Suspicious",
        confidence: 60,
        explanation: ["Fallback mode: network/API unavailable", "Please retry or test with another file"],
        source: "fallback-heuristic"
      };
    }

    return NextResponse.json(resultData, { status: 200 });

  } catch (error: any) {
    console.error('API /detect Error:', error);
    
    // Final Heuristic on Catastrophic Failure
    return NextResponse.json({
      result: "Suspicious",
      confidence: 60,
      explanation: ["Analysis failed due to error", error?.message || "Unknown error", "Please retry with a valid image or audio file."],
      source: "fallback-heuristic"
    }, { status: 500 }); // Status 500 but returns the valid heuristic payload
  }
}

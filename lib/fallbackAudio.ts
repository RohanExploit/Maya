// @ts-ignore
import WavDecoder from 'wav-decoder';
import { Buffer } from 'buffer';

export async function computeAudioFallback(audioBuffer: Buffer) {
  try {
    // 1. Decode Audio
    const audioData = await WavDecoder.decode(audioBuffer);
    const channelData = audioData.channelData[0]; // get first channel
    
    // 2. Compute RMS (Root Mean Square) energy
    let sumSquares = 0;
    for (let i = 0; i < channelData.length; i++) {
        sumSquares += channelData[i] * channelData[i];
    }
    const rms = Math.sqrt(sumSquares / channelData.length);
    
    // 3. Compute simple Zero-Crossing Rate (ZCR) 
    // AI voices often have abnormally consistent ZCR or lacks natural variation.
    let zeroCrossings = 0;
    for (let i = 1; i < channelData.length; i++) {
        if ((channelData[i] > 0 && channelData[i-1] <= 0) || (channelData[i] < 0 && channelData[i-1] >= 0)) {
            zeroCrossings++;
        }
    }
    const zcrRate = zeroCrossings / channelData.length;

    let result = "Suspicious";
    let confidence = 65;
    let explanation = [];

    // Basic heuristic: extremely flat/consistent RMS or unusual ZCR rate
    if (rms < 0.01) {
       result = "Suspicious";
       confidence = 70;
       explanation.push("Extremely low energy (RMS). Hard to verify naturalness.");
    } else if (zcrRate < 0.05 || zcrRate > 0.4) {
       result = "Fake";
       confidence = 80;
       explanation.push("Unnatural zero-crossing rate detected (common in synthesized speech).");
    } else {
       result = "Real";
       confidence = 65;
       explanation.push("Acoustic energy and zero-crossings are within normal human ranges.");
    }

    return {
        result,
        confidence,
        explanation,
        source: "fallback-oss"
    };

  } catch (error) {
    console.error("Audio fallback error:", error);
    // Final deterministic fallback
    return {
      result: "Suspicious",
      confidence: 60,
      explanation: ["Fallback mode: network/API unavailable", "Please retry or test with another file"],
      source: "fallback-heuristic"
    };
  }
}

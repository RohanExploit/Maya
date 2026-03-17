# DeepShield AI 🛡️

A production-ready Next.js web application for Image and Audio Deepfake Detection. Built for high reliability using a multi-tier fallback inference strategy, DeepShield AI never crashes during a demo.

## Features
- **Primary Inference:** Uses HuggingFace APIs for state-of-the-art Deepfake Detection. 
- **Robust Fallbacks:** Node.js heuristics based on Laplacian Variance (image blur handling) and Audio Zero-Crossing Rate to guarantee an inference result even when external APIs fail or timeout.
- **Premium UX:** Sleek, dark-mode glassmorphism UI with drag-and-drop file analysis and animated state transitions.
- **Serverless Ready:** Built on Next.js App Router, completely deployable on Vercel without heavy Python or GPU limitations.

## Open-Source Attribution & Vetting
We scoured GitHub and HuggingFace for effective, permissively licensed open-source deepfake detection inference repositories.
1. **Primary Image Model:** `prithivMLmods/Deep-Fake-Detector-v2-Model` (Hosted on HuggingFace Inference API). License: Apache 2.0.
2. **Primary Audio Model:** `Melina/deepfake-audio-detection` (Hosted on HuggingFace Inference API).
3. **Fallback Image Inference:** Inspired by OpenCV's Laplacian Variance but rewritten in pure TypeScript using `jimp` (MIT License) to ensure Vercel Node Serverless compatibility without huge model weights.
4. **Fallback Audio Inference:** Uses `audio-decode` (MIT License) and pure TypeScript math to compute Root Mean Square (RMS) energy and Zero-Crossing Rates for suspicious synthetic voice markers.

## Local Setup
1. Clone the repository and navigate into the folder:
   ```bash
   git clone https://github.com/RohanExploit/Maya.git
   cd Maya/deepshield-ai
   ```
   *(Or fork the project and deploy it yourself!)*
2. Install dependencies:
   ```bash
   npm install
   ```
   *(or `pnpm i` / `yarn`)*
3. Create a `.env.local` file in the root directory and add your keys:
   ```env
   HF_API_KEY=<YOUR_HF_TOKEN>
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```

## Demo & Testing
We have included sample media in the `/examples` folder.
* **Test 1 - Real Image:** Upload `examples/real.jpg`. You should receive a "Real" or normal "Suspicious" result depending on the face's natural sharpness.
* **Test 2 - Fake Image:** Upload `examples/fake.jpg`. You should receive a "Fake" or highly "Suspicious" flag.
* **Test 3 - Fallback:** Provide an invalid `HF_API_KEY` (or none) and upload an image. The system will fall back to its internal Laplacian variance heuristic to serve a result without crashing.
* **Test 4 - Invalid File:** Upload a `.txt` file. The frontend will gracefully reject it with a friendly 400 error message.

## Contact
Engineered for Hackathons. Fast, Reliable, and Explorable!

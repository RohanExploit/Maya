# Deployment via Vercel

Deploying DeepShield AI is incredibly straightforward as it leverages Next.js and standard Node Serverless functions. No heavy Docker images or GPU setups are required.

## 1. Push to GitHub
Commit your project and push it to a repository (preferably `RohanExploit/Maya` or a new empty repository).

## 2. Connect to Vercel
1. Go to [Vercel.com](https://vercel.com/) and click **Add New Project**.
2. Select the repository you just pushed.
3. Vercel will auto-detect Next.js framework settings.

## 3. Configure Environment Variables
Before clicking Deploy, expand the **Environment Variables** section and add:
- `HF_API_KEY`: Your HuggingFace Token (e.g. `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

## 4. Deploy
Click Deploy! Once Vercel finishes the build process, you will be given an automatically generated URL (e.g., `https://deepshield-ai.vercel.app`).

**URL Format:** Vercel automatically maps `/api/detect` to your serverless backend route. The frontend communicates with it directly via relative paths, so no absolute URLs or CORS configurations are needed.

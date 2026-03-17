import fs from 'fs';
import path from 'path';

async function runTest(name, filePath, fileType) {
  console.log(`\n\n=== Running Test: ${name} ===`);
  const form = new FormData();
  try {
    if (filePath) {
      const buffer = fs.readFileSync(filePath);
      const blob = new Blob([buffer], { type: fileType });
      form.append('file', blob, path.basename(filePath));
    }
    
    // Default file type tracking
    if (fileType.startsWith('image/')) form.append('type', 'image');
    if (fileType.startsWith('audio/')) form.append('type', 'audio');

    const res = await fetch('http://localhost:3000/api/detect', {
      method: 'POST',
      body: form
    });

    const status = res.status;
    const data = await res.json().catch(() => null);
    
    console.log(`Status: ${status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));

  } catch (err) {
    console.error(`Test failed:`, err.message);
  }
}

async function main() {
  // Test 1: Real Image (Fallback is triggered intentionally locally since no HF token)
  await runTest('Test 1: Real Image (Fallback Triggered)', './examples/real.jpg', 'image/jpeg');
  
  // Test 2: Fake Image (Fallback Triggered)
  await runTest('Test 2: Fake Image (Fallback Triggered)', './examples/fake.jpg', 'image/jpeg');
  
  // Test 4: Unsupported file type -> the API parses anything not audio as image by default, 
  // but let's test a text file to ensure it doesn't crash but falls back to the deterministic heuristic.
  fs.writeFileSync('./examples/test.txt', 'This is a text file.');
  await runTest('Test 4: Unsupported File (Text)', './examples/test.txt', 'text/plain');
}

main();

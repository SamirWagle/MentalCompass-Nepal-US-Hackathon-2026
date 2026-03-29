import dotenv from "dotenv";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import * as path from "path";
import * as fs from "fs";

dotenv.config();

const AZURE_SPEECH_API_KEY = process.env.AZURE_SPEECH_API_KEY;
const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION;

console.log("=== Azure Text-to-Speech (TTS) Connection Test ===\n");
console.log(`Region: ${AZURE_SPEECH_REGION}`);
console.log(`API Key: ${AZURE_SPEECH_API_KEY ? "✓ Set" : "✗ Missing"}\n`);

if (!AZURE_SPEECH_API_KEY || !AZURE_SPEECH_REGION) {
  console.error("ERROR: Missing required environment variables!");
  console.error("  - AZURE_SPEECH_API_KEY");
  console.error("  - AZURE_SPEECH_REGION\n");
  process.exit(1);
}

async function testTTSConnection() {
  try {
    console.log("Testing TTS service connection...\n");

    const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(
      AZURE_SPEECH_API_KEY,
      AZURE_SPEECH_REGION
    );

    // Test 1: Create speech config
    console.log("✓ Step 1: Speech config created successfully");

    // Test 2: Create output path
    const outputDir = path.join(process.cwd(), "test-audio");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const audioFile = path.join(outputDir, "test-tts.wav");

    // Test 3: Attempt synthesis
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFile);
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    console.log("✓ Step 2: Synthesizer instance created");

    // Test 4: Speaking a test phrase
    const ssml = `
      <speak version="1.0" xml:lang="en-US">
        <voice xml:lang="en-US" name="en-US-AriaNeural">
          TTS service is working correctly. This is a test message.
        </voice>
      </speak>`;

    console.log("✓ Step 3: Synthesizing test message...");

    return new Promise((resolve, reject) => {
      synthesizer.speakSsmlAsync(
        ssml,
        (result) => {
          if (result.reason === sdk.SynthesisReason.SynthesizingAudioCompleted) {
            console.log(`✓ Step 4: Audio synthesized (${result.audioData.byteLength} bytes)`);
            console.log(`✓ Step 5: Audio saved to ${audioFile}\n`);

            console.log("TTS Service Status: READY ✓");
            console.log("\nAvailable TTS functions:");
            console.log("  - synthesizeToFile(text, options) — Save speech to audio file");
            console.log("  - synthesizeToBuffer(text, options) — Get audio as Buffer");
            console.log("  - synthesizeStream(text, onData, options) — Stream audio in real-time");
            console.log("  - listAvailableVoices() — Get available voice names\n");

            synthesizer.close();
            resolve();
          } else {
            const error = new Error(
              `Synthesis failed: ${result.errorDetails}`
            );
            synthesizer.close();
            reject(error);
          }
        },
        (err) => {
          synthesizer.close();
          reject(err);
        }
      );
    });
  } catch (error) {
    console.error("✗ ERROR: TTS Connection Failed!\n");
    console.error("Details:");
    console.error(error.message);
    console.error("\nNext steps:");
    console.error("1. Verify AZURE_SPEECH_API_KEY is valid");
    console.error("2. Verify AZURE_SPEECH_REGION is correct (e.g., swedencentral)");
    console.error("3. Check that your subscription has Speech services enabled\n");
    process.exit(1);
  }
}

testTTSConnection().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});

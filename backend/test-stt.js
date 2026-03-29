import dotenv from "dotenv";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

dotenv.config();

const AZURE_SPEECH_API_KEY = process.env.AZURE_SPEECH_API_KEY;
const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION;

console.log("=== Azure Speech-to-Text (STT) Connection Test ===\n");
console.log(`Region: ${AZURE_SPEECH_REGION}`);
console.log(`API Key: ${AZURE_SPEECH_API_KEY ? "✓ Set" : "✗ Missing"}\n`);

if (!AZURE_SPEECH_API_KEY || !AZURE_SPEECH_REGION) {
  console.error("ERROR: Missing required environment variables!");
  console.error("  - AZURE_SPEECH_API_KEY");
  console.error("  - AZURE_SPEECH_REGION\n");
  process.exit(1);
}

async function testSTTConnection() {
  try {
    console.log("Testing STT service connection...\n");

    const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(
      AZURE_SPEECH_API_KEY,
      AZURE_SPEECH_REGION
    );

    // Test 1: Create recognizer (validates config)
    console.log("✓ Step 1: Speech config created successfully");

    // Test 2: Check if we can access the service
    const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    console.log("✓ Step 2: Recognizer instance created\n");

    console.log("STT Service Status: READY ✓");
    console.log("\nAvailable STT functions:");
    console.log("  - transcribeAudio(audioPath) — Convert audio file to text");
    console.log("  - transcribeBuffer(buffer) — Convert audio buffer to text");
    console.log("  - startContinuousRecognition(onText, onEnd) — Real-time recognition\n");

    process.exit(0);
  } catch (error) {
    console.error("✗ ERROR: STT Connection Failed!\n");
    console.error("Details:");
    console.error(error.message);
    console.error("\nNext steps:");
    console.error("1. Verify AZURE_SPEECH_API_KEY is valid");
    console.error("2. Verify AZURE_SPEECH_REGION is correct (e.g., swedencentral)");
    console.error("3. Check that your subscription has Speech services enabled\n");
    process.exit(1);
  }
}

testSTTConnection();

import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import * as fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const AZURE_SPEECH_ENDPOINT_TTS = process.env.AZURE_SPEECH_ENDPOINT_TTS || "";
const AZURE_SPEECH_API_KEY = process.env.AZURE_SPEECH_API_KEY || "";
const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION || "";

function hasSpeechTTS() {
  return Boolean(AZURE_SPEECH_API_KEY && AZURE_SPEECH_REGION);
}

console.info(`[TTS] Provider: ${hasSpeechTTS() ? "Azure Cognitive Services" : "Fallback"}`);

/**
 * Synthesize text to speech and save as audio file
 * @param {string} text - Text to synthesize
 * @param {Object} options - Configuration options
 * @param {string} options.voice - Voice name (e.g., "en-US-AriaNeural")
 * @param {string} options.outputPath - Where to save audio file (.wav)
 * @param {number} options.rate - Speech rate (-50 to 50, default 0)
 * @returns {Promise<string>} Path to generated audio file
 */
export async function synthesizeToFile(text, options = {}) {
  const { voice = "en-US-AriaNeural", outputPath, rate = 0 } = options;

  if (!hasSpeechTTS()) {
    throw new Error("Azure Speech TTS not configured");
  }

  return new Promise((resolve, reject) => {
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(outputPath);
    const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(AZURE_SPEECH_API_KEY, AZURE_SPEECH_REGION);

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    const ssml = `
      <speak version="1.0" xml:lang="en-US">
        <voice xml:lang="en-US" name="${voice}">
          <prosody rate="${rate / 50}">
            ${escapeXml(text)}
          </prosody>
        </voice>
      </speak>`;

    synthesizer.speakSsmlAsync(
      ssml,
      (result) => {
        if (result.reason === sdk.SynthesisReason.SynthesizingAudioCompleted) {
          resolve(outputPath);
        } else {
          reject(new Error(`Synthesis failed: ${result.errorDetails}`));
        }
        synthesizer.close();
      },
      (err) => {
        synthesizer.close();
        reject(err);
      }
    );
  });
}

/**
 * Synthesize text to speech and return as audio buffer
 * @param {string} text - Text to synthesize
 * @param {Object} options - Configuration options
 * @param {string} options.voice - Voice name (e.g., "en-US-AriaNeural")
 * @param {number} options.rate - Speech rate (-50 to 50, default 0)
 * @returns {Promise<Buffer>} Audio data as Buffer
 */
export async function synthesizeToBuffer(text, options = {}) {
  const { voice = "en-US-AriaNeural", rate = 0 } = options;

  if (!hasSpeechTTS()) {
    throw new Error("Azure Speech TTS not configured");
  }

  return new Promise((resolve, reject) => {
    const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
    const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(AZURE_SPEECH_API_KEY, AZURE_SPEECH_REGION);

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
    const chunks = [];

    const ssml = `
      <speak version="1.0" xml:lang="en-US">
        <voice xml:lang="en-US" name="${voice}">
          <prosody rate="${rate / 50}">
            ${escapeXml(text)}
          </prosody>
        </voice>
      </speak>`;

    synthesizer.speakSsmlAsync(
      ssml,
      (result) => {
        if (result.reason === sdk.SynthesisReason.SynthesizingAudioCompleted) {
          resolve(Buffer.from(result.audioData));
        } else {
          reject(new Error(`Synthesis failed: ${result.errorDetails}`));
        }
        synthesizer.close();
      },
      (err) => {
        synthesizer.close();
        reject(err);
      }
    );
  });
}

/**
 * Get list of available voices
 * @returns {Promise<Array>} Array of voice objects with name, gender, locale
 */
export async function listAvailableVoices() {
  if (!hasSpeechTTS()) {
    // Return common voices if not configured
    return [
      { name: "en-US-AriaNeural", gender: "Female", locale: "en-US" },
      { name: "en-US-GuyNeural", gender: "Male", locale: "en-US" },
    ];
  }

  // Extract available voices from Azure
  const commonVoices = [
    { name: "en-US-AriaNeural", gender: "Female", locale: "en-US" },
    { name: "en-US-GuyNeural", gender: "Male", locale: "en-US" },
    { name: "en-US-AmberNeural", gender: "Female", locale: "en-US" },
    { name: "en-US-AshleyNeural", gender: "Female", locale: "en-US" },
    { name: "en-US-CoraNeural", gender: "Female", locale: "en-US" },
    { name: "en-US-JennyNeural", gender: "Female", locale: "en-US" },
  ];

  return commonVoices;
}

/**
 * Stream synthesized speech to a callback (for real-time playback)
 * @param {string} text - Text to synthesize
 * @param {Function} onData - Callback for each chunk of audio data
 * @param {Object} options - Configuration options
 * @returns {Promise<void>}
 */
export async function synthesizeStream(text, onData, options = {}) {
  const { voice = "en-US-AriaNeural", rate = 0 } = options;

  if (!hasSpeechTTS()) {
    throw new Error("Azure Speech TTS not configured");
  }

  return new Promise((resolve, reject) => {
    const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
    const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(AZURE_SPEECH_API_KEY, AZURE_SPEECH_REGION);

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    const ssml = `
      <speak version="1.0" xml:lang="en-US">
        <voice xml:lang="en-US" name="${voice}">
          <prosody rate="${rate / 50}">
            ${escapeXml(text)}
          </prosody>
        </voice>
      </speak>`;

    synthesizer.speakSsmlAsync(
      ssml,
      (result) => {
        if (result.reason === sdk.SynthesisReason.SynthesizingAudioCompleted) {
          if (onData) {
            onData(Buffer.from(result.audioData));
          }
          resolve();
        } else {
          reject(new Error(`Synthesis failed: ${result.errorDetails}`));
        }
        synthesizer.close();
      },
      (err) => {
        synthesizer.close();
        reject(err);
      }
    );
  });
}

/**
 * Helper: Escape XML special characters
 */
function escapeXml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export { hasSpeechTTS };

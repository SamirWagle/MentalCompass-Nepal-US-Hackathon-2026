import * as sdk from "microsoft-cognitiveservices-speech-sdk";

const AZURE_SPEECH_ENDPOINT_STT = process.env.AZURE_SPEECH_ENDPOINT_STT || "";
const AZURE_SPEECH_API_KEY = process.env.AZURE_SPEECH_API_KEY || "";
const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION || "";

function hasSpeechSTT() {
  return Boolean(AZURE_SPEECH_API_KEY && AZURE_SPEECH_REGION);
}

console.info(`[STT] Provider: ${hasSpeechSTT() ? "Azure Cognitive Services" : "Fallback"}`);

/**
 * Convert audio file to text using Azure Speech-to-Text
 * @param {string} audioPath - File path to audio file (.wav, .mp3, etc.)
 * @returns {Promise<string>} Transcribed text
 */
export async function transcribeAudio(audioPath) {
  if (!hasSpeechSTT()) {
    throw new Error("Azure Speech STT not configured");
  }

  return new Promise((resolve, reject) => {
    const audioConfig = sdk.AudioConfig.fromWavFileInput(audioPath);
    const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(AZURE_SPEECH_API_KEY, AZURE_SPEECH_REGION);
    speechConfig.speechRecognitionLanguage = "en-US";

    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizeOnceAsync(
      (result) => {
        if (result.reason === sdk.ResultReason.RecognizedSpeech) {
          resolve(result.text);
        } else if (result.reason === sdk.ResultReason.NoMatch) {
          reject(new Error("No speech could be recognized"));
        } else if (result.reason === sdk.ResultReason.Canceled) {
          const cancellation = sdk.CancellationDetails.fromResult(result);
          reject(new Error(`Error: ${cancellation.reason} - ${cancellation.errorDetails}`));
        }
      },
      (err) => {
        reject(err);
      }
    );
  });
}

/**
 * Convert audio buffer to text using Azure Speech-to-Text
 * @param {Buffer} audioBuffer - Audio data as Buffer
 * @param {string} format - Audio format (e.g., "wav", "mp3")
 * @returns {Promise<string>} Transcribed text
 */
export async function transcribeBuffer(audioBuffer, format = "wav") {
  if (!hasSpeechSTT()) {
    throw new Error("Azure Speech STT not configured");
  }

  return new Promise((resolve, reject) => {
    const pushStream = sdk.AudioInputStream.createPushStream();
    pushStream.write(audioBuffer);
    pushStream.close();

    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(AZURE_SPEECH_API_KEY, AZURE_SPEECH_REGION);
    speechConfig.speechRecognitionLanguage = "en-US";

    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizeOnceAsync(
      (result) => {
        if (result.reason === sdk.ResultReason.RecognizedSpeech) {
          resolve(result.text);
        } else if (result.reason === sdk.ResultReason.NoMatch) {
          reject(new Error("No speech could be recognized"));
        } else if (result.reason === sdk.ResultReason.Canceled) {
          const cancellation = sdk.CancellationDetails.fromResult(result);
          reject(new Error(`Error: ${cancellation.reason} - ${cancellation.errorDetails}`));
        }
      },
      (err) => {
        reject(err);
      }
    );
  });
}

/**
 * Real-time continuous speech recognition
 * @param {Function} onText - Callback when text is recognized
 * @param {Function} onEnd - Callback when session ends
 * @returns {Object} Recognizer instance with stop() method
 */
export function startContinuousRecognition(onText, onEnd) {
  if (!hasSpeechSTT()) {
    throw new Error("Azure Speech STT not configured");
  }

  const audioConfig = sdk.AudioConfig.getDefaultMicrophoneInput();
  const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(AZURE_SPEECH_API_KEY, AZURE_SPEECH_REGION);
  speechConfig.speechRecognitionLanguage = "en-US";

  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

  recognizer.recognizing = (s, e) => {
    if (onText) {
      onText({ interim: e.result.text, isFinal: false });
    }
  };

  recognizer.recognized = (s, e) => {
    if (e.result.reason === sdk.ResultReason.RecognizedSpeech && onText) {
      onText({ interim: "", final: e.result.text, isFinal: true });
    }
  };

  recognizer.sessionStopped = (s, e) => {
    if (onEnd) {
      onEnd();
    }
  };

  recognizer.startContinuousRecognitionAsync(
    () => console.log("[STT] Continuous recognition started"),
    (err) => console.error("[STT] Error starting recognition:", err)
  );

  return {
    stop: () => {
      recognizer.stopContinuousRecognitionAsync(
        () => console.log("[STT] Continuous recognition stopped"),
        (err) => console.error("[STT] Error stopping recognition:", err)
      );
    },
  };
}

export { hasSpeechSTT };

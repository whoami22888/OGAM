"use strict";

// Static `exports.X =` so Metro ESM named imports resolve. A bare
// `module.exports = { ... }` object is fine too, but keep assignments explicit.

exports.__esModule = true;

class SpeechSession {
  constructor() { this.active = false; }
  start() { this.active = true; return Promise.resolve(); }
  stop() { this.active = false; return Promise.resolve(); }
  cancel() { this.active = false; return Promise.resolve(); }
}
class StreamingSttSession extends SpeechSession {}
class NativeSttSession extends SpeechSession {}
class WhisperCppSession extends SpeechSession {}
class VadController {
  start() {}
  stop() {}
  isSpeech() { return false; }
}

function transcribe() { return Promise.resolve(""); }
function startSpeech() { return Promise.resolve(new SpeechSession()); }
function stopSpeech() { return Promise.resolve(); }
function listVoices() { return []; }
function ttsSpeak() { return Promise.resolve(); }
function ttsStop() { return Promise.resolve(); }
function isSpeechAvailable() { return false; }

const DEFAULT_SILENCE_AFTER_SPEECH_MS = 800;
const DEFAULT_SPEAKER_DRAIN_MS = 300;
const SILENCE_AFTER_SPEECH_CHOICES_MS = [400, 600, 800, 1000, 1500, 2000];
const SPEAKER_DRAIN_CHOICES_MS = [0, 150, 300, 500, 800];
const SPEECH_ONSET_LOOKBACK_MS = 300;
const WAV_HEADER_BYTES = 44;
const WAV_HEADER_SCAN_BYTES = 4096;

const VOICE_TURN_LABELS = {
  tap: { label: "Tap", description: "Hold or tap to talk. You decide when the turn ends." },
  silence: { label: "Silence", description: "Stops listening after a short pause." },
  handsfree: { label: "Hands-free", description: "Listens when you start speaking and stops after a pause." },
};

const VOICE_DELAY_LABELS = {
  silenceAfterSpeech: {
    label: "Pause to end turn",
    description: "How long to wait after you stop talking before the turn ends.",
  },
  speakerDrain: {
    label: "Speaker drain",
    description: "Brief wait after the assistant finishes speaking before the mic opens again.",
  },
};

function secondsLabel(ms) {
  const n = Number(ms) || 0;
  if (n >= 1000 && n % 1000 === 0) return `${n / 1000}s`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}s`;
  return `${n}ms`;
}

function transcriptionLanguages(engine, _modelId) {
  const common = [
    { code: "auto", label: "Auto" },
    { code: "en", label: "English" },
    { code: "es", label: "Spanish" },
    { code: "fr", label: "French" },
    { code: "de", label: "German" },
    { code: "zh", label: "Chinese" },
    { code: "ja", label: "Japanese" },
    { code: "ko", label: "Korean" },
    { code: "pt", label: "Portuguese" },
    { code: "it", label: "Italian" },
    { code: "ru", label: "Russian" },
    { code: "ar", label: "Arabic" },
    { code: "hi", label: "Hindi" },
  ];
  if (engine === "qwen3-asr") {
    return common.map((l) => (
      l.code === "en" ? { code: "en", label: "English" } : l
    ));
  }
  return common;
}

class SpeechEndpointTimer {
  constructor(_onSilence, _onLog) {
    this._startedAt = 0;
  }
  begin(startedAt, _opts) {
    this._startedAt = startedAt || Date.now();
  }
  observeLevel(_rms) {
    return { speech: false };
  }
  cancel() {}
  quietTailSeconds() { return 0; }
}

function initialVoiceSession(_handsFree) {
  return { state: "idle", phase: "idle" };
}

function nextVoiceSession(before, event, _handsFree) {
  const prev = before && typeof before === "object" ? before : initialVoiceSession(false);
  const ev = String(event || "");
  if (/stop|end|cancel|idle/i.test(ev)) return { ...prev, state: "idle", phase: "idle" };
  if (/speak|reply|tts|assistant/i.test(ev)) return { ...prev, state: "speak", phase: "speaking" };
  if (/speech|heard|talk/i.test(ev)) return { ...prev, state: "listen", phase: "recording" };
  if (/listen|start|mic|begin/i.test(ev)) return { ...prev, state: "listen", phase: "listening" };
  return { ...prev };
}

function micShouldBeOpen(session) {
  return !!(session && session.state === "listen");
}

function speechMayPlay(session) {
  return !!(session && session.state === "speak");
}

function planWavTrim(_head, _front, _fileBytes, _tail) {
  // Skip trim in the stub — keep the original recording.
  return null;
}

exports.SpeechSession = SpeechSession;
exports.StreamingSttSession = StreamingSttSession;
exports.NativeSttSession = NativeSttSession;
exports.WhisperCppSession = WhisperCppSession;
exports.VadController = VadController;
exports.transcribe = transcribe;
exports.startSpeech = startSpeech;
exports.stopSpeech = stopSpeech;
exports.listVoices = listVoices;
exports.ttsSpeak = ttsSpeak;
exports.ttsStop = ttsStop;
exports.isSpeechAvailable = isSpeechAvailable;
exports.DEFAULT_SILENCE_AFTER_SPEECH_MS = DEFAULT_SILENCE_AFTER_SPEECH_MS;
exports.DEFAULT_SPEAKER_DRAIN_MS = DEFAULT_SPEAKER_DRAIN_MS;
exports.SILENCE_AFTER_SPEECH_CHOICES_MS = SILENCE_AFTER_SPEECH_CHOICES_MS;
exports.SPEAKER_DRAIN_CHOICES_MS = SPEAKER_DRAIN_CHOICES_MS;
exports.SPEECH_ONSET_LOOKBACK_MS = SPEECH_ONSET_LOOKBACK_MS;
exports.WAV_HEADER_BYTES = WAV_HEADER_BYTES;
exports.WAV_HEADER_SCAN_BYTES = WAV_HEADER_SCAN_BYTES;
exports.VOICE_TURN_LABELS = VOICE_TURN_LABELS;
exports.VOICE_DELAY_LABELS = VOICE_DELAY_LABELS;
exports.secondsLabel = secondsLabel;
exports.transcriptionLanguages = transcriptionLanguages;
exports.SpeechEndpointTimer = SpeechEndpointTimer;
exports.initialVoiceSession = initialVoiceSession;
exports.nextVoiceSession = nextVoiceSession;
exports.micShouldBeOpen = micShouldBeOpen;
exports.speechMayPlay = speechMayPlay;
exports.planWavTrim = planWavTrim;

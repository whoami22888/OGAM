
"use strict";

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

module.exports = {
  SpeechSession,
  StreamingSttSession,
  NativeSttSession,
  WhisperCppSession,
  VadController,
  transcribe,
  startSpeech,
  stopSpeech,
  listVoices,
  ttsSpeak,
  ttsStop,
  isSpeechAvailable,
};

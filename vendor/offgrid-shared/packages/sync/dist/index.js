
"use strict";

// Chat-critical grammar. Mirrors the contract described in OGAM src/utils/messageContent.ts:
// openers/closers for Gemma-native tool calls, plus XML-style <function=NAME> blocks.
const TOOL_CALL_OPENERS = ["<|tool_call>", "<tool_call:", "<tool_call>"];
const TOOL_CALL_CLOSERS = ["</tool_call>", "<|tool_call|>", "</|tool_call|>"];
const XML_TOOL_CALL_FUNCTION_MARKER = "<function=(\\w+)>";
const XML_TOOL_CALL_PARAMETER_MARKER = "<parameter=(\\w+)>";

const REASONING_DELIMITERS = [
  { open: "<think>", close: "</think>", label: "Thinking" },
  { open: "<reasoning>", close: "</reasoning>", label: "Reasoning" },
  { open: "<thought>", close: "</thought>", label: "Thought" },
];

const CONTROL_TOKEN_RE = /<\|(?:im_start|im_end|endoftext|eot_id|start_header_id|end_header_id|eom_id|reserved[^|]*)\|>/g;

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripToolCallBlocks(text) {
  let out = String(text ?? "");
  const closers = TOOL_CALL_CLOSERS.map(escapeRegExp).join("|");
  for (const open of TOOL_CALL_OPENERS) {
    out = out.replace(new RegExp(`${escapeRegExp(open)}[\\s\\S]*?(?:${closers})\\s*`, "g"), "");
    // unclosed tail at EOS
    out = out.replace(new RegExp(`${escapeRegExp(open)}[\\s\\S]*$`), "");
  }
  out = out.replace(/<function=\w+>[\s\S]*?<\/function>\s*/g, "");
  out = out.replace(/<function=\w+>[\s\S]*$/, "");
  out = out.replace(/<parameter=\w+>[\s\S]*?(?=<\/|$)/g, "");
  return out;
}

function stripChatControlTokens(text) {
  return String(text ?? "").replace(CONTROL_TOKEN_RE, "").replace(/\u200b/g, "");
}

function extractReasoning(content) {
  const src = String(content ?? "");
  for (const d of REASONING_DELIMITERS) {
    const openIdx = src.indexOf(d.open);
    if (openIdx === -1) continue;
    const closeIdx = src.indexOf(d.close, openIdx + d.open.length);
    if (closeIdx === -1) {
      const reasoning = src.slice(openIdx + d.open.length);
      const before = src.slice(0, openIdx);
      return { reasoning, answer: before, isReasoningComplete: false, reasoningLabel: d.label };
    }
    const reasoning = src.slice(openIdx + d.open.length, closeIdx);
    const answer = (src.slice(0, openIdx) + src.slice(closeIdx + d.close.length));
    return { reasoning, answer, isReasoningComplete: true, reasoningLabel: d.label };
  }
  return { reasoning: null, answer: src, isReasoningComplete: true };
}

function parseChatThinkingContent(content) {
  const { reasoning, answer, isReasoningComplete, reasoningLabel } = extractReasoning(content);
  return {
    thinking: reasoning,
    response: answer,
    isThinkingComplete: isReasoningComplete,
    thinkingLabel: reasoningLabel,
  };
}

function parseChatModelOutput(content, reasoningContent) {
  const extracted = extractReasoning(content);
  const reasoning = (reasoningContent && String(reasoningContent).trim())
    ? String(reasoningContent)
    : extracted.reasoning;
  let answer = extracted.answer;
  answer = stripToolCallBlocks(answer);
  answer = stripChatControlTokens(answer).trim();
  return {
    reasoning: reasoning && String(reasoning).trim() ? String(reasoning).trim() : null,
    answer,
    isReasoningComplete: reasoningContent ? true : extracted.isReasoningComplete,
    reasoningLabel: extracted.reasoningLabel,
  };
}

function partialTagSuffix(buffer, tag) {
  const buf = String(buffer ?? "");
  const t = String(tag ?? "");
  const max = Math.min(buf.length, t.length - 1);
  for (let n = max; n > 0; n--) {
    if (t.startsWith(buf.slice(-n))) return n;
  }
  return 0;
}

function maxPartialTagSuffix(buffer, tags) {
  let m = 0;
  for (const tag of tags || []) m = Math.max(m, partialTagSuffix(buffer, tag));
  return m;
}

// ---- No-op mesh / sync networking (stubbed; not required for on-device chat) ----
class SyncEngine {
  constructor(opts) { this.opts = opts || {}; this.started = false; }
  async start() { this.started = true; }
  async stop() { this.started = false; }
  async connect() { return { ok: false, reason: "stub" }; }
  async disconnect() {}
  async pair() { return { ok: false, reason: "stub" }; }
  async unpair() {}
  on() { return () => {}; }
  off() {}
  getState() { return { status: "idle", peers: [] }; }
}

class MultiTransport {
  constructor() {}
  start() {}
  stop() {}
  send() { return Promise.resolve(false); }
}

class WebSocketTransport {
  constructor() { this.connected = false; }
  connect() { return Promise.resolve(); }
  disconnect() {}
  send() { return Promise.resolve(false); }
}

class MessageRouter {
  constructor() {}
  route() { return null; }
}

class VerificationCode {
  constructor(code) { this.code = code || ""; }
  toString() { return this.code; }
}

const MeshMembershipRole = { owner: "owner", member: "member", guest: "guest" };

class MeshAdmission {
  constructor() {}
  admit() { return Promise.resolve({ ok: false }); }
}

class MeshAdmissionError extends Error {}
class MeshHeartbeatMissedError extends Error {}
class PendingPairingAttemptStore {
  constructor() { this.items = []; }
  list() { return this.items; }
  add(x) { this.items.push(x); }
  clear() { this.items = []; }
}

function hashValue(s) { return String(s || ""); }
function generateNonce() { return Math.random().toString(36).slice(2); }
function generateIdentity() { return { id: "local-stub", publicKey: "" }; }
function generatePairingSecret() { return "stub-secret"; }
function derivePairingKey() { return Buffer.alloc ? Buffer.alloc(32) : new Uint8Array(32); }
function deriveSharedSecret() { return new Uint8Array(32); }
function publicKeyRaw() { return new Uint8Array(0); }
function identityKeyId() { return "stub-key"; }
function fingerprintPublicKey() { return "stub-fp"; }
function encryptJson() { return ""; }
function decryptJson() { return {}; }
function wrapContentKey() { return ""; }
function unwrapContentKey() { return ""; }
function wrapPayload() { return ""; }
function unwrapPayload() { return ""; }
function hmacHex() { return ""; }
function encodeEnvelope() { return ""; }
function decodeEnvelope() { return {}; }
function packFileMeta() { return {}; }
function parseFileMeta() { return {}; }

function canonicalEvent() { return {}; }
function eventChecksum() { return ""; }
function newEventId() { return "evt-" + Date.now(); }
function encodeEvent() { return ""; }
function decodeEvent() { return {}; }
function eventHasValidChecksum() { return true; }
function eventRowToSyncEvent() { return {}; }
function appendEvent() { return Promise.resolve(); }
function applyEvent() { return Promise.resolve(); }
function getChangesSince() { return Promise.resolve([]); }
function getHeads() { return Promise.resolve([]); }
function getNewEvents() { return Promise.resolve([]); }
function getEventsById() { return Promise.resolve([]); }
function getLastApplied() { return Promise.resolve(0); }
function persistCursor() { return Promise.resolve(); }
function persistAck() { return Promise.resolve(); }
function persistSecret() { return Promise.resolve(); }
function persistWrappedContentKey() { return Promise.resolve(); }
function persistTicket() { return Promise.resolve(); }
function persistPairings() { return Promise.resolve(); }
function persistTrusted() { return Promise.resolve(); }
function persistTombstone() { return Promise.resolve(); }
function persistMembership() { return Promise.resolve(); }
function persistInbox() { return Promise.resolve(); }
function persistPairingAttempt() { return Promise.resolve(); }
function persistPeer() { return Promise.resolve(); }
function persistPeerAddr() { return Promise.resolve(); }
function persistDevice() { return Promise.resolve(); }
function persistIdentity() { return Promise.resolve(); }
function loadPairings() { return Promise.resolve([]); }
function loadTrusted() { return Promise.resolve([]); }
function loadTombstones() { return Promise.resolve([]); }
function loadMemberships() { return Promise.resolve([]); }
function loadInbox() { return Promise.resolve([]); }
function loadPairingAttempts() { return Promise.resolve([]); }
function loadPeers() { return Promise.resolve([]); }
function loadPeerAddrs() { return Promise.resolve([]); }
function loadDevices() { return Promise.resolve([]); }
function loadIdentity() { return Promise.resolve(null); }
function loadCursor() { return Promise.resolve(0); }
function loadAck() { return Promise.resolve(0); }
function loadSecret() { return Promise.resolve(null); }
function loadWrappedContentKey() { return Promise.resolve(null); }
function loadTicket() { return Promise.resolve(null); }
function loadPeer() { return Promise.resolve(null); }
function loadDevice() { return Promise.resolve(null); }
function deletePairing() { return Promise.resolve(); }
function deleteTrusted() { return Promise.resolve(); }
function deletePeer() { return Promise.resolve(); }
function evictStale() { return Promise.resolve(); }
function listCursors() { return Promise.resolve([]); }
function listTrust() { return Promise.resolve([]); }
function listInbox() { return Promise.resolve([]); }
function upsertDevice() { return Promise.resolve(); }
function upsertPeer() { return Promise.resolve(); }

const SYNC_TABLES = [];
function migrateSyncTables() { return Promise.resolve(); }
function normalizeSchema() { return []; }
function bootstrapSchema() { return Promise.resolve(); }
function openSqlite() { return Promise.resolve(null); }
function closeSqlite() { return Promise.resolve(); }
function sqliteFilename() { return "sync-stub.db"; }

function peerUrl() { return ""; }
function getLanIps() { return []; }
function getDefaultName() { return "this device"; }
function parseHttpUrls() { return []; }
function isReachable() { return Promise.resolve(false); }
function pickRelay() { return null; }
function signalUrl() { return ""; }
function syncUrl() { return ""; }
function parseWsUrl() { return ""; }
function tcpPort() { return 0; }
function advertised() { return []; }
function makeAdvertisement() { return {}; }
function observedService() { return null; }
function resolveService() { return Promise.resolve(null); }

function createMessage() { return { id: newEventId(), content: "" }; }
function parseMessage() { return {}; }
function handleMessage() { return Promise.resolve(); }
function sendHello() { return Promise.resolve(); }
function sendSync() { return Promise.resolve(); }
function sendAck() { return Promise.resolve(); }
function sendEvent() { return Promise.resolve(); }
function sendFile() { return Promise.resolve(); }
function receiveEvent() { return Promise.resolve(); }

function hasProAccess() { return false; }
function isPaired() { return false; }
function isOnline() { return false; }

function bytesToHex(buf) {
  return Array.from(buf || []).map((b) => b.toString(16).padStart(2, "0")).join("");
}

class NoopTransport {
  start() {}
  stop() {}
  send() { return Promise.resolve(false); }
}

module.exports = {
  TOOL_CALL_OPENERS,
  TOOL_CALL_CLOSERS,
  XML_TOOL_CALL_FUNCTION_MARKER,
  XML_TOOL_CALL_PARAMETER_MARKER,
  REASONING_DELIMITERS,
  stripChatControlTokens,
  parseChatThinkingContent,
  parseChatModelOutput,
  partialTagSuffix,
  maxPartialTagSuffix,
  SyncEngine,
  MultiTransport,
  WebSocketTransport,
  MessageRouter,
  VerificationCode,
  MeshMembershipRole,
  MeshAdmission,
  MeshAdmissionError,
  MeshHeartbeatMissedError,
  PendingPairingAttemptStore,
  hashValue,
  generateNonce,
  generateIdentity,
  generatePairingSecret,
  derivePairingKey,
  deriveSharedSecret,
  publicKeyRaw,
  identityKeyId,
  fingerprintPublicKey,
  encryptJson,
  decryptJson,
  wrapContentKey,
  unwrapContentKey,
  wrapPayload,
  unwrapPayload,
  hmacHex,
  encodeEnvelope,
  decodeEnvelope,
  packFileMeta,
  parseFileMeta,
  canonicalEvent,
  eventChecksum,
  newEventId,
  encodeEvent,
  decodeEvent,
  eventHasValidChecksum,
  eventRowToSyncEvent,
  appendEvent,
  applyEvent,
  getChangesSince,
  getHeads,
  getNewEvents,
  getEventsById,
  getLastApplied,
  persistCursor,
  persistAck,
  persistSecret,
  persistWrappedContentKey,
  persistTicket,
  persistPairings,
  persistTrusted,
  persistTombstone,
  persistMembership,
  persistInbox,
  persistPairingAttempt,
  persistPeer,
  persistPeerAddr,
  persistDevice,
  persistIdentity,
  loadPairings,
  loadTrusted,
  loadTombstones,
  loadMemberships,
  loadInbox,
  loadPairingAttempts,
  loadPeers,
  loadPeerAddrs,
  loadDevices,
  loadIdentity,
  loadCursor,
  loadAck,
  loadSecret,
  loadWrappedContentKey,
  loadTicket,
  loadPeer,
  loadDevice,
  deletePairing,
  deleteTrusted,
  deletePeer,
  evictStale,
  listCursors,
  listTrust,
  listInbox,
  upsertDevice,
  upsertPeer,
  SYNC_TABLES,
  migrateSyncTables,
  normalizeSchema,
  bootstrapSchema,
  openSqlite,
  closeSqlite,
  sqliteFilename,
  peerUrl,
  getLanIps,
  getDefaultName,
  parseHttpUrls,
  isReachable,
  pickRelay,
  signalUrl,
  syncUrl,
  parseWsUrl,
  tcpPort,
  advertised,
  makeAdvertisement,
  observedService,
  resolveService,
  createMessage,
  parseMessage,
  handleMessage,
  sendHello,
  sendSync,
  sendAck,
  sendEvent,
  sendFile,
  receiveEvent,
  hasProAccess,
  isPaired,
  isOnline,
  bytesToHex,
  NoopTransport,
};

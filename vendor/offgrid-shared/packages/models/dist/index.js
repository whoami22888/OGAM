
"use strict";

const CATALOG = [];

const PHONE_FIT_BUDGET = { soft: 0.45, hard: 0.72 };
function phoneFitBudget(platform) {
  return platform === "ios" ? { soft: 0.5, hard: 0.78 } : { ...PHONE_FIT_BUDGET };
}
function fitTier(sizeGB, ramGB, budget) {
  const b = budget || PHONE_FIT_BUDGET;
  if (!ramGB || ramGB <= 0) return "wontFit";
  const ratio = sizeGB / ramGB;
  if (ratio > (b.hard ?? 0.72)) return "wontFit";
  if (ratio > (b.soft ?? 0.45)) return "tight";
  return "fits";
}
function isLoadableOnDevice(sizeGB, ramGB, budget) {
  return fitTier(sizeGB, ramGB, budget) !== "wontFit";
}
function fitLabel(tier) {
  return tier === "wontFit" ? "Too big" : tier === "tight" ? "Tight fit" : "Runs well";
}

function extractQuantization(name) {
  const n = String(name || "");
  const m = n.match(/(Q\d[_A-Z0-9]*|IQ\d[_A-Z0-9]*|F16|F32|BF16)/i);
  return m ? m[1].toUpperCase() : "unknown";
}
function cleanModelName(name) {
  return String(name || "")
    .replace(/\.(gguf|litertlm|safetensors)$/i, "")
    .replace(/[-_.]?(Q\d[_A-Z0-9]*|IQ\d[_A-Z0-9]*|F16|F32|BF16)$/i, "")
    .trim();
}
function isCompanionFile(name) {
  const n = String(name || "").toLowerCase();
  return n.includes("mmproj") || n.includes("projector") || n.includes("mm-proj");
}
function isDraftModelFile(name) {
  return /draft/i.test(String(name || ""));
}
function isMtpHeadFile(name) {
  return /mtp/i.test(String(name || ""));
}
function isImatrixFile(name) {
  return /imatrix/i.test(String(name || ""));
}
function isRawModelName(name) {
  return /\.(safetensors|bin|pth)$/i.test(String(name || ""));
}
function splitGgufPartNames(pathName) {
  const p = String(pathName || "");
  const m = p.match(/^(.*-)(\d{5})-of-(\d{5})(\.gguf)$/i);
  if (!m) return [p];
  const total = parseInt(m[3], 10);
  const out = [];
  for (let i = 1; i <= total; i++) {
    out.push(`${m[1]}${String(i).padStart(m[2].length, "0")}-of-${m[3]}${m[4]}`);
  }
  return out;
}
function splitGgufModelName(name) {
  return splitGgufPartNames(name);
}
function collapseSplitGgufParts(files) {
  const seen = new Map();
  for (const f of files || []) {
    const key = splitGgufPartNames(f.name || f.path || "")[0] || f.name;
    if (!seen.has(key)) seen.set(key, f);
  }
  return [...seen.values()];
}
function formatFileSize(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
}
function prefersQ4_0(platform, backend) {
  return platform === "android" && (backend === "cpu" || backend === "npu" || backend === "htp");
}
function baseModelKey(id) {
  return String(id || "").replace(/[-_.]?(GGUF|gguf)$/i, "").toLowerCase();
}
function isOffGridHfRepo(id) {
  return String(id || "").toLowerCase().startsWith("off-grid-ai/") || String(id || "").toLowerCase().startsWith("offgrid/");
}
function determineCredibility(author) {
  const a = String(author || "").toLowerCase();
  if (a.includes("offgrid") || a === "off-grid-ai") return "offgrid";
  if (a.includes("lmstudio")) return "lmstudio";
  return "community";
}
function modelDisplayName(entry) {
  return (entry && (entry.name || entry.id)) || "Model";
}
function modelIdentityStem(name) {
  return cleanModelName(name).toLowerCase();
}
function parseMoeParams(text) {
  const m = String(text || "").match(/([\d.]+)\s*B/i);
  return m ? Number(m[1]) : 0;
}

const DEFAULT_MAX_TOOL_CALLS = 8;
const MIN_MAX_TOOL_CALLS = 1;
const MAX_MAX_TOOL_CALLS = 32;
const MAX_TOOL_RESULT_CHARS = 4000;
function normalizeMaxToolCalls(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return DEFAULT_MAX_TOOL_CALLS;
  return Math.min(MAX_MAX_TOOL_CALLS, Math.max(MIN_MAX_TOOL_CALLS, Math.round(v)));
}
function callsWithinToolBudget(used, max) {
  return used < normalizeMaxToolCalls(max);
}
function toolPromptChars() { return 2000; }
function toolResultCharBudget() { return MAX_TOOL_RESULT_CHARS; }
function boundToolResult(text) {
  const s = String(text ?? "");
  return s.length > MAX_TOOL_RESULT_CHARS ? s.slice(0, MAX_TOOL_RESULT_CHARS) + "…" : s;
}
function finalResponseFromToolResults() {
  return "I used the available tools and that is as far as I can go in this turn.";
}
function toolLimitFinalAnswerInstruction() {
  return "You have reached the tool-call limit. Answer with what you have, and do not call more tools.";
}

const REASONING_BUDGET_AUTO = "auto";
const REASONING_BUDGET_OPTIONS = ["auto", "low", "medium", "high"];
function reasoningBudgetLabel(v) { return String(v || "auto"); }
function thinkingBudgetPayload() { return {}; }
function reasoningBudgetPayload() { return {}; }
function openRouterReasoningPayload() { return {}; }
function modelCardDeniesReasoning() { return false; }
function modelCardUrl(id) { return id ? `https://huggingface.co/${id}` : ""; }

function mtpHeadForPrimaryFile() { return null; }
function mtpHeadForModel() { return null; }
function projectorsFor() { return []; }
function getModelFiles() { return []; }
function getModelType() { return "text"; }

function searchHuggingFace() { return Promise.resolve([]); }
function resolveHuggingFaceModel() { return Promise.resolve(null); }
function refreshRemoteCatalog() { return Promise.resolve({ text: [], image: [], stt: [] }); }
function loadCachedCatalog() { return Promise.resolve(null); }
function mergeCatalogEntries(a, b) { return [...(a || []), ...(b || [])]; }
function diffMergedCatalog() { return { added: [], removed: [] }; }
function parseMobileCatalogSections() { return { text: [], image: [], stt: [] }; }
function mobileCatalogKey() { return "mobile-catalog"; }
const MOBILE_CATALOG_URL = "";

const BOOST_PROMO = { visible: false };
function boostPromoCopy() { return { title: "", body: "", cta: "" }; }
function boostPromoLink() { return ""; }
function boostPromoVisible() { return false; }

const MOBILE_BACKEND_ROWS = [];
const MOBILE_DEVICE_ROWS = [];
const MOBILE_MTP_DRAFT_TOKENS = 32;
const IPHONE_INFERENCE_THREADS = 4;
function androidInferenceThreads() { return 4; }
function mobileUseMmap() { return false; }
function classifyMobileDevice() { return "phone"; }
function fastestBenchedBackend() { return "cpu"; }
function planMobileFastestSettings() { return { backend: "cpu", threads: 4 }; }
function isTranscriptionEngineAvailableOn() { return false; }
function transcriptionEngineOf() { return null; }

const IMAGE_STYLES = [];
const VIDEO_STYLES = [];
const VIDEO_SETTING_KEYS = [];
function mediaStyle() { return "default"; }
function effectiveImageParameter(_, fallback) { return fallback; }
function resolveImageParameters(p) { return p || {}; }
function setImageParameterOverride() {}
function imageEngineSettings() { return {}; }
function isCompleteSDCheckpointHeader() { return false; }
function isImageWeightAvailableOn() { return false; }
function isSDImageWeight() { return false; }
function isVideoWeightAvailableOn() { return false; }
function isVideoRequest() { return false; }
function videoArchitecture() { return null; }
function videoModelDefaults() { return {}; }
function videoPackError() { return null; }
function videoTakesStartImage() { return false; }
function acceptsVideoSetting() { return false; }
function standardImageModelDefaults() { return {}; }
function sdImagePackFor() { return null; }
const QWEN_IMAGE_21_WEIGHT = "";
const SD_CHECKPOINT_HEADER_BYTES = 0;

function stateCacheBudgetMb() { return 512; }
function admissionBudgetMB(total) { return Math.floor((total || 0) * 0.6); }
function dirtyHeadroomMB() { return 512; }
function hasDirtyPressure() { return false; }
function exceedsDirtyCeiling() { return false; }
function fitsWithoutEviction() { return true; }
function memoryWarningVictims() { return []; }
function freesIdleSpeechForGeneration() { return false; }
function planEviction() { return []; }
function pickModelsForDevice(models) { return models || []; }

const MOBILE_GUIDE_GROUPS = [];
const GUIDE_FIRST_LOOK = [];
const GUIDE_STARTERS = [];
const GUIDE_LINKS = [];
const GUIDE_KB_VECTOR_MODEL = "";
function guideTopicsFor() { return []; }
function guideAnswerParts() { return []; }
function guideAnswerBlocks() { return []; }
function guideAnswerLength() { return 0; }
function guideAnswerReveal() { return ""; }
function guideTypingMs() { return 12; }
function guideFlowAnswer() { return ""; }
function guideFlowAnswerById() { return ""; }
function guideGrounding() { return []; }
function guideStarterAnswer() { return ""; }
function guideTurnsToSend() { return []; }
function guideWhereLabel() { return ""; }

module.exports = {
  CATALOG,
  PHONE_FIT_BUDGET,
  phoneFitBudget,
  fitTier,
  isLoadableOnDevice,
  fitLabel,
  extractQuantization,
  cleanModelName,
  isCompanionFile,
  isDraftModelFile,
  isMtpHeadFile,
  isImatrixFile,
  isRawModelName,
  splitGgufPartNames,
  splitGgufModelName,
  collapseSplitGgufParts,
  formatFileSize,
  prefersQ4_0,
  baseModelKey,
  isOffGridHfRepo,
  determineCredibility,
  modelDisplayName,
  modelIdentityStem,
  parseMoeParams,
  DEFAULT_MAX_TOOL_CALLS,
  MIN_MAX_TOOL_CALLS,
  MAX_MAX_TOOL_CALLS,
  MAX_TOOL_RESULT_CHARS,
  normalizeMaxToolCalls,
  callsWithinToolBudget,
  toolPromptChars,
  toolResultCharBudget,
  boundToolResult,
  finalResponseFromToolResults,
  toolLimitFinalAnswerInstruction,
  REASONING_BUDGET_AUTO,
  REASONING_BUDGET_OPTIONS,
  reasoningBudgetLabel,
  thinkingBudgetPayload,
  reasoningBudgetPayload,
  openRouterReasoningPayload,
  modelCardDeniesReasoning,
  modelCardUrl,
  mtpHeadForPrimaryFile,
  mtpHeadForModel,
  projectorsFor,
  getModelFiles,
  getModelType,
  searchHuggingFace,
  resolveHuggingFaceModel,
  refreshRemoteCatalog,
  loadCachedCatalog,
  mergeCatalogEntries,
  diffMergedCatalog,
  parseMobileCatalogSections,
  mobileCatalogKey,
  MOBILE_CATALOG_URL,
  BOOST_PROMO,
  boostPromoCopy,
  boostPromoLink,
  boostPromoVisible,
  MOBILE_BACKEND_ROWS,
  MOBILE_DEVICE_ROWS,
  MOBILE_MTP_DRAFT_TOKENS,
  IPHONE_INFERENCE_THREADS,
  androidInferenceThreads,
  mobileUseMmap,
  classifyMobileDevice,
  fastestBenchedBackend,
  planMobileFastestSettings,
  isTranscriptionEngineAvailableOn,
  transcriptionEngineOf,
  IMAGE_STYLES,
  VIDEO_STYLES,
  VIDEO_SETTING_KEYS,
  mediaStyle,
  effectiveImageParameter,
  resolveImageParameters,
  setImageParameterOverride,
  imageEngineSettings,
  isCompleteSDCheckpointHeader,
  isImageWeightAvailableOn,
  isSDImageWeight,
  isVideoWeightAvailableOn,
  isVideoRequest,
  videoArchitecture,
  videoModelDefaults,
  videoPackError,
  videoTakesStartImage,
  acceptsVideoSetting,
  standardImageModelDefaults,
  sdImagePackFor,
  QWEN_IMAGE_21_WEIGHT,
  SD_CHECKPOINT_HEADER_BYTES,
  stateCacheBudgetMb,
  admissionBudgetMB,
  dirtyHeadroomMB,
  hasDirtyPressure,
  exceedsDirtyCeiling,
  fitsWithoutEviction,
  memoryWarningVictims,
  freesIdleSpeechForGeneration,
  planEviction,
  pickModelsForDevice,
  MOBILE_GUIDE_GROUPS,
  GUIDE_FIRST_LOOK,
  GUIDE_STARTERS,
  GUIDE_LINKS,
  GUIDE_KB_VECTOR_MODEL,
  guideTopicsFor,
  guideAnswerParts,
  guideAnswerBlocks,
  guideAnswerLength,
  guideAnswerReveal,
  guideTypingMs,
  guideFlowAnswer,
  guideFlowAnswerById,
  guideGrounding,
  guideStarterAnswer,
  guideTurnsToSend,
  guideWhereLabel,
};

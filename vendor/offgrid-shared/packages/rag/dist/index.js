"use strict";

// Explicit named `exports.X =` assignments (not `module.exports = { ... }` or
// `module.exports = require(...)`) so Metro's ESM interop can resolve
// `import { X } from '@offgrid/rag/documents'`. A require-reexport is treated
// as default-only, leaving named imports undefined. Hermes then throws
// "Cannot read property 'prototype' of undefined" on `new DocumentIngestService`.

exports.__esModule = true;

class DocumentIngestService {
  constructor(_opts) {}
  ingest() { return Promise.resolve({ ok: false, reason: "rag-stub" }); }
  remove() { return Promise.resolve(); }
  collectGarbage() { return Promise.resolve(); }
}

class DocumentTurnService {
  constructor(_opts) {}
  prepare() {
    return Promise.resolve(null);
  }
  searchForTool() {
    return Promise.resolve({ text: "", sources: [] });
  }
}

class DocumentTextExtractor {
  extract() { return Promise.resolve(""); }
}
class TxtExtractor extends DocumentTextExtractor {}
class PdfExtractor extends DocumentTextExtractor {}
class MarkdownExtractor extends DocumentTextExtractor {}
class HtmlExtractor extends DocumentTextExtractor {}
class DocxExtractor extends DocumentTextExtractor {}
class OpenOfficeExtractor extends DocumentTextExtractor {}
class RecollIndexer {
  index() { return Promise.resolve(); }
  search() { return Promise.resolve([]); }
}
class RetrievalQueryService {
  query() { return Promise.resolve([]); }
}
class RetrievalReranker {
  rerank(items) { return items || []; }
}
class RetrievalCache {
  get() { return null; }
  set() {}
  clear() {}
}
class EmbeddingPipeline {
  embed() { return Promise.resolve([]); }
}
class ChunkStore {
  add() { return Promise.resolve(); }
  search() { return Promise.resolve([]); }
  clear() { return Promise.resolve(); }
}
class QueryAnalyzer {
  analyze() { return { terms: [] }; }
}
class RecollSnippetFormatter {
  format(s) { return String(s || ""); }
}

function chunkText(text) { return String(text || "").split(/\n{2,}/).filter(Boolean); }
function embedQuery() { return Promise.resolve([]); }
function searchChunks() { return Promise.resolve([]); }
function ingestDocument() { return Promise.resolve({ ok: false }); }
function listDocuments() { return Promise.resolve([]); }
function deleteDocument() { return Promise.resolve(); }
function ragStatus() { return { ready: false, stub: true }; }
function tokenize(text) { return String(text || "").split(/\s+/).filter(Boolean); }
function snippetOf(s) { return String(s || "").slice(0, 200); }

function estimateTokens(text) {
  const s = typeof text === "string" ? text : String(text || "");
  return Math.max(0, Math.ceil(s.length / 4));
}

function describeTurnStatus(status) {
  if (status == null) return "";
  if (typeof status === "string") return status;
  if (typeof status === "object") {
    return String(status.message || status.phase || status.status || "Preparing documents");
  }
  return "Preparing documents";
}

function contentTerms(text) {
  return String(text || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter((t) => t.length > 1);
}

function indexedText(name, chunk) {
  const body = chunk && typeof chunk === "object"
    ? (chunk.text || chunk.body || "")
    : String(chunk || "");
  return `${name || ""} ${body}`.trim();
}

function textParts(text) {
  const raw = String(text || "");
  if (!raw) return [];
  const chunks = raw.split(/\n{2,}/);
  const parts = [];
  let page = 1;
  let buf = "";
  const flush = () => {
    if (buf.trim()) {
      parts.push({ page: page++, text: buf.trim() });
      buf = "";
    }
  };
  for (const c of chunks) {
    if ((buf + "\n\n" + c).length > 4000) flush();
    buf = buf ? buf + "\n\n" + c : c;
  }
  flush();
  return parts;
}

function splitCitations(text) {
  const raw = String(text || "");
  const re = /\[S(\d+)\]/g;
  const segments = [];
  let last = 0;
  let m;
  while ((m = re.exec(raw))) {
    if (m.index > last) segments.push({ kind: "text", text: raw.slice(last, m.index) });
    segments.push({ kind: "citation", index: Number(m[1]) });
    last = m.index + m[0].length;
  }
  if (last < raw.length) segments.push({ kind: "text", text: raw.slice(last) });
  if (!segments.length && raw) segments.push({ kind: "text", text: raw });
  return segments;
}

function parseSearchBlock(content) {
  const raw = String(content || "");
  const passages = [];
  const re = /<source\b[^>]*>([\s\S]*?)<\/source>/gi;
  let m;
  while ((m = re.exec(raw))) {
    const block = m[1];
    const doc = (/document="([^"]+)"/.exec(m[0]) || /data-document="([^"]+)"/.exec(m[0]) || [])[1]
      || (/^#\s*(.+)$/m.exec(block) || [])[1]
      || "document";
    passages.push({ document: doc, text: block.trim() });
  }
  return passages;
}

function searchRemoteComputer() {
  return Promise.resolve({ status: "unavailable", message: "Remote search is not available in this build.", results: [] });
}

function withoutChatsOnDevice(results, _chatsListed) {
  return Array.isArray(results) ? results : [];
}


exports.DocumentIngestService = DocumentIngestService;
exports.DocumentTurnService = DocumentTurnService;
exports.DocumentTextExtractor = DocumentTextExtractor;
exports.TxtExtractor = TxtExtractor;
exports.PdfExtractor = PdfExtractor;
exports.MarkdownExtractor = MarkdownExtractor;
exports.HtmlExtractor = HtmlExtractor;
exports.DocxExtractor = DocxExtractor;
exports.OpenOfficeExtractor = OpenOfficeExtractor;
exports.RecollIndexer = RecollIndexer;
exports.RetrievalQueryService = RetrievalQueryService;
exports.RetrievalReranker = RetrievalReranker;
exports.RetrievalCache = RetrievalCache;
exports.EmbeddingPipeline = EmbeddingPipeline;
exports.ChunkStore = ChunkStore;
exports.QueryAnalyzer = QueryAnalyzer;
exports.RecollSnippetFormatter = RecollSnippetFormatter;
exports.chunkText = chunkText;
exports.embedQuery = embedQuery;
exports.searchChunks = searchChunks;
exports.ingestDocument = ingestDocument;
exports.listDocuments = listDocuments;
exports.deleteDocument = deleteDocument;
exports.ragStatus = ragStatus;
exports.tokenize = tokenize;
exports.snippetOf = snippetOf;
exports.estimateTokens = estimateTokens;
exports.describeTurnStatus = describeTurnStatus;
exports.contentTerms = contentTerms;
exports.indexedText = indexedText;
exports.textParts = textParts;
exports.splitCitations = splitCitations;
exports.parseSearchBlock = parseSearchBlock;
exports.searchRemoteComputer = searchRemoteComputer;
exports.withoutChatsOnDevice = withoutChatsOnDevice;

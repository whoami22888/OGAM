
"use strict";

class DocumentIngestService {
  constructor() {}
  ingest() { return Promise.resolve({ ok: false, reason: "rag-stub" }); }
  remove() { return Promise.resolve(); }
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
function tokenize() { return []; }
function snippetOf(s) { return String(s || "").slice(0, 200); }

module.exports = {
  DocumentIngestService,
  DocumentTextExtractor,
  TxtExtractor,
  PdfExtractor,
  MarkdownExtractor,
  HtmlExtractor,
  DocxExtractor,
  OpenOfficeExtractor,
  RecollIndexer,
  RetrievalQueryService,
  RetrievalReranker,
  RetrievalCache,
  EmbeddingPipeline,
  ChunkStore,
  QueryAnalyzer,
  RecollSnippetFormatter,
  chunkText,
  embedQuery,
  searchChunks,
  ingestDocument,
  listDocuments,
  deleteDocument,
  ragStatus,
  tokenize,
  snippetOf,
};

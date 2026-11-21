# Vendored `@offgrid/*` stubs

The official `off-grid-ai/shared` monorepo is private (not on GitHub as a
public repo, not published to npm). A normal `npm install` of OGAM therefore
fails at the `file:../shared/packages/*` dependencies.

This tree is a **local stand-in** so `Jarvis_liquid_agent` can compile and run
**core on-device GGUF chat** (import a model, load LFM3, use the Jarvis system
prompt) without that private repo. Heavier product features are deliberately
stubbed.

## Implemented well enough for core chat

- **`@offgrid/models`**: GGUF helpers (`splitGgufPartNames`, quantization /
  companion / MTP / draft / imatrix detection, `cleanModelName`,
  `formatFileSize`), phone fit/RAM (`PHONE_FIT_BUDGET`, `phoneFitBudget`,
  `fitTier`, `isLoadableOnDevice`, `fitLabel`), tool-call budget
  (`normalizeMaxToolCalls`, `callsWithinToolBudget`, result bounds).
  `CATALOG` is an empty array — the app prepends `JARVIS_DEFAULT_MODEL`
  (AtomicChat LFM3-1.7B-Uncensored Q4_K_M). Hugging Face search / remote catalog
  refresh are no-ops (local file import still works). Image/video/guide/boost
  promo helpers are thin stubs.
- **`@offgrid/design`**: `FONTS`, `TYPOGRAPHY` (h1–h3, display, body, label,
  meta), `SPACING`, `RADIUS`, `LIVING_FIELD`, `ALIVE`, `COLORS_LIGHT`,
  `COLORS_DARK` with the token keys the app actually reads.
- **`@offgrid/sync` (chat-critical parsers)**: `parseChatModelOutput`,
  `parseChatThinkingContent`, `stripChatControlTokens`, `REASONING_DELIMITERS`
  (`<think>`, `<reasoning>`, `<thought>`), `TOOL_CALL_OPENERS` /
  `TOOL_CALL_CLOSERS`, `XML_TOOL_CALL_FUNCTION_MARKER` / `PARAMETER_MARKER`,
  `partialTagSuffix`, `maxPartialTagSuffix`. These must be behaviorally correct
  or streaming/tool-call stripping will leak markup.

## Stubbed / no-op (app should still build)

- **`@offgrid/sync` networking**: `SyncEngine`, transports, pairing, encryption,
  mesh, SQLite event log — no-ops. RN adapters `@offgrid/sync/rn` and
  `@offgrid/sync/rn-discovery` exist as empty shells so Metro can resolve them.
- **`@offgrid/rag`** and `@offgrid/rag/documents`: ingest/search no-ops.
- **`@offgrid/speech`**: STT/TTS sessions no-op (`isSpeechAvailable` = false).
- **`@offgrid/ui`**: thin `sampleProgressRate` / `projectProgress` only.
- **`@offgrid/notes`**, **`@offgrid/notes-editor`**, **`@offgrid/writing`**,
  **`@offgrid/automation`**: empty / no-op (little or no app `src/` usage).

Voice and video Pro features still depend on the closed-source `pro/`
submodule and are **not** unlocked here.

If you later obtain the real `shared` tree, place it at `../shared` (sibling
of this repo). Metro prefers that path when `packages/models` exists there.

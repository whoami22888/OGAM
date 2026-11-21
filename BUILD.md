# Jarvis_liquid_agent on a Galaxy S23 — build and install


> **Build without the private monorepo:** this fork vendors stub implementations
> of the private `@offgrid/*` packages under `vendor/offgrid-shared/` (see that
> README). `npm install` resolves `file:./vendor/offgrid-shared/packages/*`.
> Core on-device GGUF chat (model import, LFM3, Jarvis system prompt) is the
> supported path. Sync/RAG/speech/notes/writing are no-ops. The LFM3 GGUF is
> **not** bundled — import it on-device after install.


This branch turns [Off Grid AI (OGAM)](https://github.com/off-grid-ai/OGAM) into a standalone phone-native app named **Jarvis_liquid_agent**: local GGUF chat, the coworker persona, and the existing on-device tools. No Linxr, no VM, no Docker, no terminal once the APK is installed.

| | This fork | Official Off Grid AI |
|---|---|---|
| Launcher label | **Jarvis_liquid_agent** (debug: **Jarvis_liquid_agent (Debug)**) | Off Grid AI |
| Android `applicationId` | **`ai.jarvisliquidagent.app`** | `ai.offgridmobile` / `ai.offgridmobile.dev` |
| iOS bundle id | `ai.jarvisliquidagent.app` (debug: `.debug`) | `ai.offgridmobile` |

The two apps can be installed side by side. The Gradle `namespace` stays `ai.offgridmobile` so the existing Kotlin packages and `BuildConfig` imports still compile; only the **install identity** (`applicationId`) changed. FileProvider authorities are derived from `applicationId`, so they do not collide.

Base: **upstream Off Grid AI v0.0.125**. The inference engine is `npm:@ogai/llama.rn@0.13.0-b12415` (llama.cpp **b12415**). LFM3 support landed in llama.cpp **b11938**.

Default model: **AtomicChat/LFM3-1.7B-Uncensored-GGUF** file `LFM3-1.7B-Uncensored-AD-Q4_K_M.gguf` (1,132,208,000 bytes, SHA256 `b22df65673b54ed326f18f74826d76f3b65dadc237ffd6306cd52be04544827d`).

## Local import and Hub downloads are free

**Models → Import local file** is not paywalled in this fork. The upload action is always shown (including when the Models list is embedded in onboarding). Hugging Face catalog / Hub downloads for text models were already free in core; they stay free. Voice TTS and Video tabs are still upstream Pro features (closed-source `pro/` package) and are unchanged.

If you previously hit a Pro gate, that was almost certainly the official Play Store / GitHub APK (`ai.offgridmobile`), which ships the private Pro package. This fork's APK (`ai.jarvisliquidagent.app`) does not include that gate on local import.

This development box could not produce an APK: no JDK, no Android SDK, and `off-grid-ai/shared` (the `@offgrid/models` etc. monorepo OGAM needs at `../shared`) is a **private** repository. Follow the build path below on a machine that has those.

## Build this branch

On a Linux or macOS machine with a normal Android toolchain:

```bash
# 1. Sources. This branch lives on the whoami22888/OGAM fork.
git clone https://github.com/whoami22888/OGAM.git
cd OGAM
git checkout feat/jarvis-s23-native

# 2. The private shared monorepo MUST sit next to this checkout.
#    You need access to https://github.com/off-grid-ai/shared
git clone https://github.com/off-grid-ai/shared.git ../shared
npm --prefix ../shared ci
npm --prefix ../shared/packages/sync run build
npm --prefix ../shared/packages/rag run build
npm --prefix ../shared/packages/models run build
npm --prefix ../shared/packages/speech run build
npm --prefix ../shared/packages/ui run build

# 3. App dependencies (Node 20+; 24 is fine). Do not initialise the
#    private `pro/` submodule — the free stub is enough, and local import
#    stays ungated without it.
npm install

# 4. Android SDK + JDK 17. Accept licenses. NDK is pulled by the project.
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

# 5. Debug or release APK (both install as ai.jarvisliquidagent.app):
cd android
./gradlew :app:assembleDebug
# or, in Android Studio: open the android/ folder (or the repo root) and
# Run / Build > Build Bundle(s) / APK(s) > Build APK(s).
```

APK path:

```text
android/app/build/outputs/apk/debug/app-debug.apk
# release (if you run assembleRelease):
android/app/build/outputs/apk/release/app-release.apk
```

Install:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
# or copy the APK to the phone and open it in My Files.
```

Launch **Jarvis_liquid_agent**. On first run, the Models list should lead with **Jarvis_liquid_agent LFM3 1.7B**. Download that Q4_K_M file in-app, or **Import local file** if you already copied the GGUF onto the phone. The Jarvis_liquid_agent system prompt is the default; Settings still lets you edit it.

## If LFM3 will not load

This branch is on llama.cpp b12415, which should load arch `lfm3`. If the on-device load still errors, import a widely supported 1–2B Q4 instead (Qwen 3.5 0.8B/2B or MiniCPM5 2B). Do not use an 8B model as the always-on model on an S23.

## On-device expectations (S23, 8 GB, no VM)

- Weights: 1.13 GB on internal storage, plus a few hundred MB of KV at the app's default 4096 context.
- Runtime RAM: plan on ~2–3.5 GB while the model is loaded. Use the in-app Model Loading policy (Lean is safest).
- Speed: upstream quotes **15–30 tok/s CPU** and **20–40 tok/s Adreno OpenCL** on Snapdragon 8 Gen 2/3. Prefer OpenCL; Hexagon NPU does not accelerate Q4_K_M.

## Tools and approval

Built-in tools (calculator, date/time, device info, knowledge-base search, web search, read URL) stay enabled. The persona tells the model to **ask once** before any network or state-changing tool, then continue when you agree. There is no extra refusal filter on top of the uncensored weights.

## License

OGAM is MIT. LFM3 weights are LFM Open License v1.0 (commercial cap applies). Do not publish the GGUF inside the APK.

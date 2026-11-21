# Jarvis on a Galaxy S23 — build and install

This branch turns [Off Grid AI (OGAM)](https://github.com/off-grid-ai/OGAM) into a phone-native Jarvis: local GGUF chat, the coworker persona, and the existing on-device tools. No Linxr, no VM, no Docker, no terminal once the APK is installed.

Base: **upstream Off Grid AI v0.0.125**. The inference engine is `npm:@ogai/llama.rn@0.13.0-b12415` (llama.cpp **b12415**). LFM3 support landed in llama.cpp **b11938** (PR #31252), so this build is new enough to load arch `lfm3`. The older 0.0.111 fork (`llama.rn` 0.13.0-rc.4 / b11010) could not.

Default model: **AtomicChat/LFM3-1.7B-Uncensored-GGUF** file `LFM3-1.7B-Uncensored-AD-Q4_K_M.gguf` (1,132,208,000 bytes, SHA256 `b22df65673b54ed326f18f74826d76f3b65dadc237ffd6306cd52be04544827d`).

This development box could not produce an APK: no JDK, no Android SDK, and `off-grid-ai/shared` (the `@offgrid/models` etc. monorepo OGAM needs at `../shared`) is a **private** repository. Follow one of the two paths below.

## Path A — Use it today (no source build)

The official engine already runs GGUF on a Snapdragon 8 Gen 2 (S23) over CPU/Adreno, offline, with tool calling.

1. Install **Off Grid AI 0.0.125** from [Google Play](https://play.google.com/store/apps/details?id=ai.offgridmobile) or the GitHub release APK: [OffgridMobile-0.0.125.apk](https://github.com/off-grid-ai/OGAM/releases/download/v0.0.125/OffgridMobile-0.0.125.apk) (~304 MB). Side-load: open the APK in **My Files**, allow that one source to install unknown apps if Android asks, tap Install.
2. On the phone, download the GGUF (Wi-Fi):  
   https://huggingface.co/AtomicChat/LFM3-1.7B-Uncensored-GGUF/resolve/main/LFM3-1.7B-Uncensored-AD-Q4_K_M.gguf
3. In the app: **Models** → **Import local file** → pick that `.gguf`. Then set it as the active text model.
4. **Model settings → System prompt**: paste the prompt in `resources/jarvis-persona.md` (or leave it if you later install this branch's debug APK, which already bakes it in).
5. Open Chat and talk. Grant microphone only if you want Whisper. Stay on airplane mode if you want a hard offline guarantee; network tools (web search, read URL) will then be unavailable.

The official APK is still named "Off Grid AI" and uses `applicationId ai.offgridmobile`. This branch's debug APK is named **Jarvis (Debug)** and uses `ai.offgridmobile.dev`, so it can sit beside the Play Store app.

## Path B — Build this branch (Jarvis defaults baked in)

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
#    private `pro/` submodule — the free stub is enough.
npm install

# 4. Android SDK + JDK 17. Accept licenses. NDK is pulled by the project.
#    ANDROID_HOME must point at the SDK.
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

# 5. Debug APK (safe to install next to the Play Store app):
cd android
./gradlew :app:assembleDebug
```

APK path:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Install:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
# or copy the APK to the phone and open it in My Files, same as Path A.
```

Launch **Jarvis (Debug)**. On first run, the Models list should lead with **Jarvis LFM3 1.7B**. Download that Q4_K_M file in-app (or Import local file if you already copied the GGUF). The Jarvis system prompt is the default; Settings still lets you edit it.

A release APK (`:app:assembleRelease`) keeps `applicationId ai.offgridmobile` and would fight the Play Store app. Prefer the debug APK for personal sideload, or change `applicationId` first if you want a standalone release.

## If LFM3 will not load

This branch is on llama.cpp b12415, which should load arch `lfm3`. If the on-device load still errors, say so and import a widely supported 1–2B Q4 instead, for example a Qwen 3.5 0.8B/2B or MiniCPM5 2B from the curated list. Speed and RAM on the S23 stay in the 1–2B Q4 class either way. Do not try the 8B Qwen3 on this phone as the always-on model.

## On-device expectations (S23, 8 GB, no VM)

- Weights: 1.13 GB on internal storage, plus a few hundred MB of KV at the app's default 4096 context.
- Runtime RAM: plan on ~2–3.5 GB while the model is loaded. Use the in-app Model Loading policy (Lean is safest). Close other heavy apps.
- Speed: Off Grid AI quotes **15–30 tok/s CPU** and **20–40 tok/s Adreno OpenCL** on Snapdragon 8 Gen 2/3. The S23 is a Snapdragon 8 Gen 2. OpenCL is the better default; Hexagon NPU does **not** accelerate Q4_K_M (it wants Q4_0 / Q8_0) and would fall back to CPU.
- First load is slow. A 1.7B Q4 is the realistic always-on model; an 8B is not.

## Tools and approval

Built-in tools (calculator, date/time, device info, knowledge-base search, web search, read URL) stay enabled. Calendar / email / MCP "draft then approve" actions are a Pro feature of the upstream app and are not required for chat. The Jarvis prompt tells the model to **ask once** before any network or state-changing tool, then continue when you agree. There is no extra refusal filter on top of the uncensored weights.

## License

OGAM is MIT. LFM3 weights are LFM Open License v1.0 (commercial cap applies). Do not publish the GGUF inside the APK.

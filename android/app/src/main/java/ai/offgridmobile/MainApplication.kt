package ai.offgridmobile

import android.app.Application
import android.util.Log
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactPackage
import com.facebook.react.common.assets.ReactFontManager
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import ai.offgridmobile.download.DownloadManagerPackage
import ai.offgridmobile.localdream.LocalDreamPackage
import ai.offgridmobile.pdf.PDFExtractorPackage
import ai.offgridmobile.litert.LiteRTPackage
import ai.offgridmobile.devicememory.DeviceMemoryPackage
import ai.offgridmobile.problemreport.ProblemReportPackage
import ai.offgridmobile.mediashare.MediaSharePackage
import ai.offgridmobile.clipboard.SyncClipboardPackage
import ai.offgridmobile.scribe.ScribeEntryPackage
import ai.offgridmobile.directory.SyncDirectorySourcePackage
import ai.offgridmobile.downloads.SyncDownloadsPackage
import ai.offgridmobile.sync.BlobChannelPackage
import ai.offgridmobile.screenshot.SyncScreenshotPackage
import ai.offgridmobile.sync.MeshResidencyPackage
import ai.offgridmobile.enginepack.EnginePackBoot
import ai.offgridmobile.enginepack.EnginePackPackage

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // A constructor or System.loadLibrary failure in one extra package
          // must not take down llama.rn chat. Autolinked packages (llama.rn,
          // etc.) stay on the list; these are the manually added ones.
          addSafely("DownloadManager") { DownloadManagerPackage() }
          addSafely("LocalDream") { LocalDreamPackage() }
          if (!BuildConfig.SKIP_VIDEO) {
            // Official video JNI (Hexagon/sd.cpp). The Jarvis fork skips this:
            // registering VideoGenerationPackage would System.loadLibrary
            // ("offgrid_video") during RN startup and kill the process if the
            // stub .so cannot be mapped.
            addSafely("VideoGeneration") { ai.offgridmobile.video.VideoGenerationPackage() }
          }
          addSafely("PDFExtractor") { PDFExtractorPackage() }
          addSafely("LiteRT") { LiteRTPackage() }
          addSafely("DeviceMemory") { DeviceMemoryPackage() }
          addSafely("ProblemReport") { ProblemReportPackage() }
          addSafely("MediaShare") { MediaSharePackage() }
          addSafely("SyncClipboard") { SyncClipboardPackage() }
          addSafely("ScribeEntry") { ScribeEntryPackage() }
          addSafely("SyncDirectorySource") { SyncDirectorySourcePackage() }
          addSafely("MeshResidency") { MeshResidencyPackage() }
          addSafely("SyncScreenshot") { SyncScreenshotPackage() }
          addSafely("SyncDownloads") { SyncDownloadsPackage() }
          addSafely("BlobChannel") { BlobChannelPackage() }
          addSafely("EnginePack") { EnginePackPackage() }
        },
      // Do not rethrow: a fatal JS error on a release sideload otherwise
      // presents as "Jarvis_liquid_agent keeps stopping" with no UI.
      exceptionHandler = { error ->
        Log.e(TAG, "Unhandled JS exception (process kept alive)", error)
      },
    )
  }

  override fun onCreate() {
    super.onCreate()
    EnginePackBoot.apply(this)
    try {
      ReactFontManager.getInstance().addCustomFont(this, "Geist", R.font.geist)
      ReactFontManager.getInstance().addCustomFont(this, "Geist Mono", R.font.geist_mono)
    } catch (t: Throwable) {
      Log.e(TAG, "Custom font registration failed", t)
    }
    loadReactNative(this)
  }

  private fun MutableList<ReactPackage>.addSafely(name: String, factory: () -> ReactPackage) {
    try {
      add(factory())
    } catch (t: Throwable) {
      Log.e(TAG, "Skipping native package $name so chat can still start", t)
    }
  }

  private companion object {
    const val TAG = "JarvisApp"
  }
}

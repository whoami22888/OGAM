// Stub offgrid_video library for Jarvis_liquid_agent debug builds that skip
// the Docker/Hexagon stable-diffusion.cpp video runtime. The React Native
// module still loads this library at process start; generation methods throw
// so the JS/Kotlin promise path fails cleanly. On-device GGUF chat is unaffected.
#include <jni.h>

extern "C" JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *) {
  JNIEnv *env = nullptr;
  if (vm->GetEnv(reinterpret_cast<void **>(&env), JNI_VERSION_1_6) != JNI_OK) {
    return JNI_ERR;
  }
  return JNI_VERSION_1_6;
}


static void throwUnavailable(JNIEnv *env) {
  if (env->ExceptionCheck()) return;
  jclass klass = env->FindClass("java/lang/IllegalStateException");
  if (klass) {
    env->ThrowNew(klass,
      "Video/image generation is not included in this Jarvis_liquid_agent build "
      "(the Hexagon/video runtime requires Docker and is skipped). On-device chat still works.");
    env->DeleteLocalRef(klass);
  }
}

extern "C" JNIEXPORT void JNICALL
Java_ai_offgridmobile_video_VideoGenerationModule_nativePrepare(JNIEnv *, jobject) {}

extern "C" JNIEXPORT void JNICALL
Java_ai_offgridmobile_video_VideoGenerationModule_nativeCancel(JNIEnv *, jobject) {}

extern "C" JNIEXPORT void JNICALL
Java_ai_offgridmobile_video_VideoGenerationModule_nativeSetRuntimeDirectory(JNIEnv *, jobject, jstring) {}

extern "C" JNIEXPORT void JNICALL
Java_ai_offgridmobile_video_VideoGenerationModule_nativeGenerate(
    JNIEnv *env, jobject, jstring, jstring, jstring, jstring, jstring,
    jint, jint, jint, jint, jint, jdouble, jdouble, jstring, jstring, jstring, jstring,
    jdouble, jstring, jbyteArray) {
  throwUnavailable(env);
}

extern "C" JNIEXPORT void JNICALL
Java_ai_offgridmobile_video_VideoGenerationModule_nativeLoadImage(
    JNIEnv *env, jobject, jstring, jstring, jstring, jstring, jint, jboolean, jstring, jstring, jstring) {
  throwUnavailable(env);
}

extern "C" JNIEXPORT jstring JNICALL
Java_ai_offgridmobile_video_VideoGenerationModule_nativeImagePath(JNIEnv *env, jobject) {
  return env->NewStringUTF("");
}

extern "C" JNIEXPORT void JNICALL
Java_ai_offgridmobile_video_VideoGenerationModule_nativeUnloadImage(JNIEnv *, jobject) {}

extern "C" JNIEXPORT jlong JNICALL
Java_ai_offgridmobile_video_VideoGenerationModule_nativeUpscalerOpen(JNIEnv *, jobject, jstring, jint) {
  return 0;
}

extern "C" JNIEXPORT void JNICALL
Java_ai_offgridmobile_video_VideoGenerationModule_nativeUpscalerClose(JNIEnv *, jobject, jlong) {}

extern "C" JNIEXPORT jbyteArray JNICALL
Java_ai_offgridmobile_video_VideoGenerationModule_nativeUpscale(
    JNIEnv *, jobject, jlong, jbyteArray, jint, jint, jint) {
  return nullptr;
}

extern "C" JNIEXPORT jbyteArray JNICALL
Java_ai_offgridmobile_video_VideoGenerationModule_nativeGenerateImage(
    JNIEnv *env, jobject, jstring, jstring, jint, jint, jint, jdouble, jdouble, jint) {
  throwUnavailable(env);
  return nullptr;
}

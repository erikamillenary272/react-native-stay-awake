package com.stayawake

import android.app.Activity
import android.view.WindowManager
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.UiThreadUtil

class StayAwakeModule(reactContext: ReactApplicationContext) :
  NativeStayAwakeSpec(reactContext), LifecycleEventListener {

  @Volatile
  private var activated = false

  init {
    reactContext.addLifecycleEventListener(this)
  }

  override fun setActivated(activated: Boolean) {
    this.activated = activated
    applyFlag(activated)
  }

  private fun applyFlag(keepOn: Boolean) {
    // currentActivity can be null during startup or backgrounding; the
    // desired state is re-applied in onHostResume once an activity exists.
    val activity: Activity = reactApplicationContext.currentActivity ?: return
    UiThreadUtil.runOnUiThread {
      if (activity.isFinishing || activity.isDestroyed) return@runOnUiThread
      val window = activity.window ?: return@runOnUiThread
      if (keepOn) {
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
      } else {
        window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
      }
    }
  }

  // FLAG_KEEP_SCREEN_ON is per-window, so re-apply it whenever the host
  // resumes — covers activity recreation and multi-activity apps.
  override fun onHostResume() {
    if (activated) applyFlag(true)
  }

  override fun onHostPause() = Unit

  override fun onHostDestroy() = Unit

  override fun invalidate() {
    // Don't leave the screen pinned awake across reloads.
    activated = false
    applyFlag(false)
    reactApplicationContext.removeLifecycleEventListener(this)
    super.invalidate()
  }

  companion object {
    const val NAME = NativeStayAwakeSpec.NAME
  }
}

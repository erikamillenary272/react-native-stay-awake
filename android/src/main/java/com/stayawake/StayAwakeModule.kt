package com.stayawake

import com.facebook.react.bridge.ReactApplicationContext

class StayAwakeModule(reactContext: ReactApplicationContext) :
  NativeStayAwakeSpec(reactContext) {

  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  companion object {
    const val NAME = NativeStayAwakeSpec.NAME
  }
}

package com.c9up.orbit.clipboard

import android.content.ClipData
import android.content.ClipboardManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.UiThreadUtil

/**
 * The system clipboard, as `@c9up/orbit-clipboard` reads and writes it on a
 * phone: plain text only. Android lets an app read the clipboard only while it
 * has focus (10+) and tells the user when it does (13+), as a browser asks.
 */
class OrbitClipboardModule(context: ReactApplicationContext) : NativeOrbitClipboardSpec(context) {
    override fun getName(): String = NAME

    private fun manager(): ClipboardManager? =
        reactApplicationContext.getSystemService(ClipboardManager::class.java)

    override fun writeText(text: String, promise: Promise) {
        // Some vendors' clipboard services expect the main thread.
        UiThreadUtil.runOnUiThread {
            val clipboard = manager()
            if (clipboard == null) {
                promise.reject(UNAVAILABLE, "this device has no clipboard service")
                return@runOnUiThread
            }
            try {
                clipboard.setPrimaryClip(ClipData.newPlainText("text", text))
                promise.resolve(null)
            } catch (error: SecurityException) {
                promise.reject(DENIED, error.message ?: "writing the clipboard was refused", error)
            }
        }
    }

    override fun readText(promise: Promise) {
        UiThreadUtil.runOnUiThread {
            val clipboard = manager()
            if (clipboard == null) {
                promise.reject(UNAVAILABLE, "this device has no clipboard service")
                return@runOnUiThread
            }
            try {
                val clip = clipboard.primaryClip
                val text =
                    if (clip == null || clip.itemCount == 0) ""
                    else clip.getItemAt(0).coerceToText(reactApplicationContext)?.toString() ?: ""
                promise.resolve(text)
            } catch (error: SecurityException) {
                // Read while the app is not in focus: Android refuses.
                promise.reject(DENIED, error.message ?: "reading the clipboard was refused", error)
            }
        }
    }

    companion object {
        const val NAME = "OrbitClipboard"
        const val UNAVAILABLE = "E_ORBIT_CLIPBOARD_UNAVAILABLE"
        const val DENIED = "E_ORBIT_CLIPBOARD_DENIED"
    }
}

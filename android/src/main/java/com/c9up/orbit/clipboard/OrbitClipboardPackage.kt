package com.c9up.orbit.clipboard

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

/** What React Native's autolinking registers: the OrbitClipboard TurboModule. */
class OrbitClipboardPackage : BaseReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
        if (name == OrbitClipboardModule.NAME) OrbitClipboardModule(reactContext) else null

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider =
        ReactModuleInfoProvider {
            mapOf(
                OrbitClipboardModule.NAME to
                    ReactModuleInfo(
                        OrbitClipboardModule.NAME,
                        OrbitClipboardModule.NAME,
                        false, // canOverrideExistingModule
                        false, // needsEagerInit
                        false, // isCxxModule
                        true, // isTurboModule
                    ),
            )
        }
}

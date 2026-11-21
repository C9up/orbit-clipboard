import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

/**
 * The system clipboard on a phone (android/…/OrbitClipboardModule.kt): the
 * browser's `navigator.clipboard.writeText` / `readText`, plain text only. A
 * refusal rejects with `E_ORBIT_CLIPBOARD_DENIED`, a device without the
 * service with `E_ORBIT_CLIPBOARD_UNAVAILABLE`.
 */
export interface Spec extends TurboModule {
	readonly writeText: (text: string) => Promise<void>;
	readonly readText: () => Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>("OrbitClipboard");

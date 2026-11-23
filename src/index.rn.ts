/**
 * `@c9up/orbit-clipboard` on a phone: the app's OrbitClipboard TurboModule
 * (android/…/OrbitClipboardModule.kt), which React Native's autolinking adds
 * to an app built by `ream android:*`. React Native's bundler takes this file
 * in place of index.ts (the `react-native` condition and field); it exports
 * what index.ts exports.
 */
import type { Exception } from "@c9up/flare";
import {
	E_ORBIT_CLIPBOARD_DENIED,
	E_ORBIT_CLIPBOARD_UNAVAILABLE,
} from "./errors.js";
import { codeOf, messageOf } from "./platform.js";

export * as errors from "./errors.js";

interface NativeClipboard {
	writeText(text: string): Promise<void>;
	readText(): Promise<string>;
}

function isNativeClipboard(value: unknown): value is NativeClipboard {
	return (
		typeof value === "object" &&
		value !== null &&
		typeof Reflect.get(value, "writeText") === "function" &&
		typeof Reflect.get(value, "readText") === "function"
	);
}

/**
 * OrbitClipboard, as TurboModuleRegistry finds a module: the TurboModule
 * proxy, then `nativeModuleProxy` — the only one a bridgeless app installs.
 */
function lookup(): NativeClipboard | undefined {
	const proxy: unknown = Reflect.get(globalThis, "__turboModuleProxy");
	if (typeof proxy === "function") {
		const module: unknown = Reflect.apply(proxy, undefined, ["OrbitClipboard"]);
		if (isNativeClipboard(module)) return module;
	}
	const modules: unknown = Reflect.get(globalThis, "nativeModuleProxy");
	if (typeof modules === "object" && modules !== null) {
		const module: unknown = Reflect.get(modules, "OrbitClipboard");
		if (isNativeClipboard(module)) return module;
	}
	return undefined;
}

let cached: NativeClipboard | undefined;

function native(): NativeClipboard {
	cached ??= lookup();
	if (cached === undefined) {
		throw new E_ORBIT_CLIPBOARD_UNAVAILABLE([
			"the OrbitClipboard module is not in the app: build it with `ream android:*`, whose autolinking adds it",
		]);
	}
	return cached;
}

function refused(error: unknown): Exception {
	const Refusal =
		codeOf(error) === "E_ORBIT_CLIPBOARD_DENIED"
			? E_ORBIT_CLIPBOARD_DENIED
			: E_ORBIT_CLIPBOARD_UNAVAILABLE;
	return new Refusal([messageOf(error)], { cause: error });
}

/** Put `text` on the system clipboard. */
export async function writeText(text: string): Promise<void> {
	const clipboard = native();
	try {
		await clipboard.writeText(text);
	} catch (error) {
		throw refused(error);
	}
}

/** The text on the system clipboard (`""` when it holds none). */
export async function readText(): Promise<string> {
	const clipboard = native();
	try {
		return await clipboard.readText();
	} catch (error) {
		throw refused(error);
	}
}

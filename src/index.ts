/**
 * `@c9up/orbit-clipboard` — the system clipboard, one call in the browser and
 * on a phone:
 *
 *     import { readText, writeText } from '@c9up/orbit-clipboard'
 *     await writeText(safetyCode)
 *     const pasted = await readText()
 *
 * In the browser this is `navigator.clipboard` (a secure page; reading asks
 * the user). On a phone, React Native's bundler takes index.rn.ts instead,
 * which calls the app's OrbitClipboard module. On the server there is no
 * clipboard: both calls reject with `E_ORBIT_CLIPBOARD_UNAVAILABLE`.
 */
import { codeOf, OrbitClipboardError } from "./errors.js";

export { OrbitClipboardError, type OrbitClipboardErrorCode } from "./errors.js";

interface WebClipboard {
	writeText(text: string): Promise<void>;
	readText(): Promise<string>;
}

function isWebClipboard(value: unknown): value is WebClipboard {
	return (
		typeof value === "object" &&
		value !== null &&
		typeof Reflect.get(value, "writeText") === "function" &&
		typeof Reflect.get(value, "readText") === "function"
	);
}

function webClipboard(): WebClipboard {
	const navigator: unknown = Reflect.get(globalThis, "navigator");
	const clipboard: unknown =
		typeof navigator === "object" && navigator !== null
			? Reflect.get(navigator, "clipboard")
			: undefined;
	if (!isWebClipboard(clipboard)) {
		throw new OrbitClipboardError(
			"E_ORBIT_CLIPBOARD_UNAVAILABLE",
			"[orbit-clipboard] no clipboard here: the server, or a page that is not a secure context (https, localhost)",
		);
	}
	return clipboard;
}

function refused(error: unknown): OrbitClipboardError {
	return new OrbitClipboardError(
		codeOf(error) === "NotAllowedError"
			? "E_ORBIT_CLIPBOARD_DENIED"
			: "E_ORBIT_CLIPBOARD_UNAVAILABLE",
		`[orbit-clipboard] ${error instanceof Error ? error.message : String(error)}`,
		{ cause: error },
	);
}

/** Put `text` on the system clipboard. */
export async function writeText(text: string): Promise<void> {
	const clipboard = webClipboard();
	try {
		await clipboard.writeText(text);
	} catch (error) {
		throw refused(error);
	}
}

/** The text on the system clipboard (`""` when it holds none). */
export async function readText(): Promise<string> {
	const clipboard = webClipboard();
	try {
		return await clipboard.readText();
	} catch (error) {
		throw refused(error);
	}
}

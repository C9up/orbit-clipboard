/**
 * orbit-clipboard's errors: a stable `code` (`E_ORBIT_CLIPBOARD_<REASON>`)
 * for a caller to branch on, the same in the browser and on a phone.
 */
export type OrbitClipboardErrorCode =
	/** No clipboard to reach: the server, an insecure page, an app without the native module. */
	| "E_ORBIT_CLIPBOARD_UNAVAILABLE"
	/** The platform refused: no permission, or the page / app was not in focus. */
	| "E_ORBIT_CLIPBOARD_DENIED";

export class OrbitClipboardError extends Error {
	readonly code: OrbitClipboardErrorCode;

	constructor(
		code: OrbitClipboardErrorCode,
		message: string,
		options?: ErrorOptions,
	) {
		super(message, options);
		this.name = "OrbitClipboardError";
		this.code = code;
	}
}

/** The code a platform error carries (a rejected native promise, a DOMException's name). */
export function codeOf(error: unknown): string | undefined {
	if (typeof error !== "object" || error === null) return undefined;
	const code: unknown = Reflect.get(error, "code");
	if (typeof code === "string") return code;
	const name: unknown = Reflect.get(error, "name");
	return typeof name === "string" ? name : undefined;
}

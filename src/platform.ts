/** The code a platform error carries (a rejected native promise, a DOMException's name). */
export function codeOf(error: unknown): string | undefined {
	if (typeof error !== "object" || error === null) return undefined;
	const code: unknown = Reflect.get(error, "code");
	if (typeof code === "string") return code;
	const name: unknown = Reflect.get(error, "name");
	return typeof name === "string" ? name : undefined;
}

/** What a platform error says, for the message of the error that wraps it. */
export function messageOf(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

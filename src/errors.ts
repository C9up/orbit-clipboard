/**
 * orbit-clipboard's errors, one per code: a stable
 * `E_ORBIT_CLIPBOARD_<REASON>` for a caller to branch on, the same in the
 * browser and on a phone.
 */
import { createError } from "@c9up/flare";

/** No clipboard to reach: the server, an insecure page, an app without the native module. */
export const E_ORBIT_CLIPBOARD_UNAVAILABLE = createError<[string]>(
	"[orbit-clipboard] %s",
	"E_ORBIT_CLIPBOARD_UNAVAILABLE",
);

/** The platform refused: no permission, or the page / app was not in focus. */
export const E_ORBIT_CLIPBOARD_DENIED = createError<[string]>(
	"[orbit-clipboard] %s",
	"E_ORBIT_CLIPBOARD_DENIED",
);

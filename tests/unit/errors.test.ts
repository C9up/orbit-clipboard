import { Exception } from "@c9up/flare";
import { describe, expect, it } from "vitest";
import { errors as webErrors } from "../../src/index.js";
import { errors as phoneErrors } from "../../src/index.rn.js";

describe("orbit-clipboard > errors", () => {
	it("exports the same namespace from the browser and the phone entry", () => {
		expect(phoneErrors).toBe(webErrors);
		const error = new webErrors.E_ORBIT_CLIPBOARD_DENIED(["refused"]);
		expect(error).toBeInstanceOf(Exception);
		expect(error.code).toBe("E_ORBIT_CLIPBOARD_DENIED");
		expect(error.status).toBe(500);
		expect(error.message).toBe("[orbit-clipboard] refused");
	});
});

/**
 * One call in the browser and on a phone: the browser's navigator.clipboard,
 * and the app's OrbitClipboard module through React Native's lookup.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
	vi.unstubAllGlobals();
	Reflect.deleteProperty(globalThis, "__turboModuleProxy");
	Reflect.deleteProperty(globalThis, "nativeModuleProxy");
	vi.resetModules();
});

/** A clipboard holding one text, refusing reads when `deny` names the error to throw. */
function fakeClipboard(deny?: { name?: string; code?: string }) {
	let held = "";
	const refuse = () => {
		const error = new Error("refused");
		if (deny?.name) error.name = deny.name;
		if (deny?.code) Object.assign(error, { code: deny.code });
		return error;
	};
	return {
		writeText: async (text: string) => {
			if (deny) throw refuse();
			held = text;
		},
		readText: async () => {
			if (deny) throw refuse();
			return held;
		},
	};
}

describe("in the browser", () => {
	it("writes and reads through navigator.clipboard", async () => {
		vi.stubGlobal("navigator", { clipboard: fakeClipboard() });
		const { readText, writeText } = await import("../../src/index.js");
		await writeText("1234 5678");
		expect(await readText()).toBe("1234 5678");
	});

	it("names a refusal and a missing clipboard", async () => {
		vi.stubGlobal("navigator", {
			clipboard: fakeClipboard({ name: "NotAllowedError" }),
		});
		const web = await import("../../src/index.js");
		await expect(web.readText()).rejects.toMatchObject({
			code: "E_ORBIT_CLIPBOARD_DENIED",
		});
		vi.stubGlobal("navigator", {});
		await expect(web.writeText("x")).rejects.toMatchObject({
			code: "E_ORBIT_CLIPBOARD_UNAVAILABLE",
		});
	});

	it("has no clipboard on the server", async () => {
		vi.stubGlobal("navigator", undefined);
		const { readText } = await import("../../src/index.js");
		await expect(readText()).rejects.toMatchObject({
			code: "E_ORBIT_CLIPBOARD_UNAVAILABLE",
		});
	});
});

describe("on a phone", () => {
	it("exports what the browser entry exports", async () => {
		const web = await import("../../src/index.js");
		const rn = await import("../../src/index.rn.js");
		expect(Object.keys(rn).sort()).toEqual(Object.keys(web).sort());
	});

	it("calls the OrbitClipboard module a bridgeless app exposes on nativeModuleProxy", async () => {
		Reflect.set(globalThis, "nativeModuleProxy", {
			OrbitClipboard: fakeClipboard(),
		});
		const { readText, writeText } = await import("../../src/index.rn.js");
		await writeText("safety 42");
		expect(await readText()).toBe("safety 42");
	});

	it("takes the TurboModule proxy first, as TurboModuleRegistry does", async () => {
		const asked: string[] = [];
		Reflect.set(globalThis, "__turboModuleProxy", (name: string) => {
			asked.push(name);
			return fakeClipboard();
		});
		const { writeText } = await import("../../src/index.rn.js");
		await writeText("x");
		expect(asked).toEqual(["OrbitClipboard"]);
	});

	it("names the module's refusal, and an app built without the module", async () => {
		Reflect.set(globalThis, "nativeModuleProxy", {
			OrbitClipboard: fakeClipboard({ code: "E_ORBIT_CLIPBOARD_DENIED" }),
		});
		const rn = await import("../../src/index.rn.js");
		await expect(rn.readText()).rejects.toMatchObject({
			code: "E_ORBIT_CLIPBOARD_DENIED",
		});
		vi.resetModules();
		Reflect.set(globalThis, "nativeModuleProxy", {});
		const bare = await import("../../src/index.rn.js");
		await expect(bare.writeText("x")).rejects.toMatchObject({
			code: "E_ORBIT_CLIPBOARD_UNAVAILABLE",
			message: expect.stringContaining("ream android:*"),
		});
	});
});

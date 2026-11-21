# @c9up/orbit-clipboard

The system clipboard, one call in the browser and on a phone.

```ts
import { readText, writeText } from "@c9up/orbit-clipboard";

await writeText(safetyCode);
const pasted = await readText(); // "" when it holds no text
```

- **Browser**: `navigator.clipboard` — a secure page (https, localhost);
  reading asks the user.
- **Phone**: an Android TurboModule over `ClipboardManager`
  (`android/`), which React Native's autolinking adds to an app built by
  `ream android:*` — nothing to wire. React Native's bundler takes
  `index.rn` in place of `index` (the `react-native` export condition and
  field). Android lets an app read the clipboard only while it has focus
  (10+) and tells the user when it does (13+).
- **Server**: there is no clipboard; both calls reject.

Plain text only.

## Errors

Every failure is an `OrbitClipboardError` with a `code`:

| Code | Cause |
|---|---|
| `E_ORBIT_CLIPBOARD_UNAVAILABLE` | No clipboard to reach: the server, an insecure page, an app built without the module. |
| `E_ORBIT_CLIPBOARD_DENIED` | The platform refused: no permission, or the page / app was not in focus. |

## License

MIT

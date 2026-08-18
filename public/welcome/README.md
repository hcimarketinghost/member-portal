# /welcome mockup assets

Drop PNGs here. The flow references them by exact filename — no code change
needed once a file lands, and a missing file degrades to an empty frame rather
than a broken image.

Export at 2x (roughly 860x1750 for a full device render) with a transparent
background, since they sit on #000.

| Filename | Used by |
|---|---|
| `activenet-1.png` | ActiveNet walkthrough, step 1 — create the account |
| `activenet-2.png` | ActiveNet walkthrough, step 2 — add family members |
| `activenet-3.png` | ActiveNet walkthrough, step 3 — member pricing |
| `app-home.png` | "Everything lives in the app" screen |
| `keytag-front.svg` | Rotating keytag, front face (hex mark) |
| `keytag-back.svg` | Rotating keytag, back face — the one with the number |

The keytag faces fall back to a drawn approximation until the SVGs land, so the
helper works without them. Export from Figma with a transparent background: the
front face doubles as the mask for the glimmer sweep, so its alpha channel must
be the tag silhouette.

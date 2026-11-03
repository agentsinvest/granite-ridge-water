# Documents tab and a site-wide passcode

Date: 2026-11-03

## Decision

1. The whole site now sits behind one shared passcode, replacing "public, no login".
2. A new Documents screen lets anyone with the passcode upload any file (PDF, Excel, CSV, JPG, HEIC, video, anything) up to 250 MB, name it, add a note, rename it, and move it to a trash that keeps files for 30 days.

## Why

The landscape committee wants one place for every document about neighborhood water. Those documents include bills and account details, which the old public site could not hold. An open upload form on a public site would also invite spam and accidental leaks. So the passcode covers the whole site, not just this tab.

## How it works

* `netlify/edge-functions/gate.ts` runs before everything (pages, scripts, generated data, `/api/*`). Without a valid session cookie it serves a passcode page (pages) or a 401 (API). The cookie is an HMAC of a fixed label keyed by the passcode, is HttpOnly, and lasts 90 days. Changing `SITE_PASSCODE` signs everyone out. A wrong passcode waits 1 second before answering. "Sign out on this device" is in the footer (`/__logout`).
* `netlify/functions/docs.ts` checks the cookie again, then serves `/api/docs` from `netlify/shared/docs-api.ts` over Netlify Blobs (store `documents`, strong consistency).
* Files move in 3 MiB pieces. Netlify Functions cap one request or response at about 6 MB, and binary bodies are base64-encoded on the way through, so 3 MiB pieces leave room. Downloads are reassembled in the browser.
* Finished documents removed by anyone go to the trash. Trash older than 30 days and uploads that never finished within 24 hours are deleted the next time the list loads.

## Setup required (one time, in Netlify)

* Site configuration, Environment variables: add `SITE_PASSCODE` (use a passphrase of several words, not a 4-digit code; there is no lockout beyond the 1 second delay). Optionally add `SESSION_SECRET` (any long random string). Set both for all deploy contexts, or deploy previews will show "passcode has not been set up".
* Netlify Blobs needs no setup.

## Limits and trade-offs

* One shared passcode means no record of who did what beyond the optional "Added by" field, and anyone with the passcode can remove files (the trash makes that recoverable for 30 days).
* Downloads are rebuilt in the browser's memory. A 250 MB file on an older phone may struggle; desktops are fine.
* HEIC photos download rather than open in the browser, because only Safari can show them.
* Netlify Blobs storage and function usage count against the Netlify plan. Not checked against the HOA's current plan.
* The edge function and the Blobs adapter were tested with simulated requests, not on a real Netlify deploy from this session. Verify on the first deploy preview.

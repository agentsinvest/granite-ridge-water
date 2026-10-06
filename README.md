# granite-ridge-water

Water cost and use model for Granite Ridge HOA's four City of Mesa common-area irrigation meters. The full build spec is in `CLAUDE.md`.

* `data/`: the only input to the website. Markdown files, validated on every build.
* `sources/`: complete transcriptions of every shared document. Committed, never deployed.
* `data/INVENTORY.md`: what data is in hand and what is still needed.
* `docs/decisions/`: decision log.

## Commands

```
npm install
npm run dev        # validate data, then start the site locally
npm run build      # validate data, typecheck, build to dist/
npm test           # parser, validator, engine, and privacy checks
```

`npm run build-data` alone validates every file in `data/` and stops with the file and line of the first problem.

# OCR of the City of Mesa bill PDF

How the 2019 to 2026 bills in `data/bills/` were read from the scanned PDF (`Invoices (1)_opt (1).pdf`, 334 pages, no text layer). Kept so the extraction can be audited and rerun.

1. Render each page at 300 dpi and OCR it with Tesseract (`--psm 4`) into `$OCR_WORK/txt/pNNN.txt`. Pages with no readable "Bill Date" get a second OCR of the top strip at 400 dpi (`--psm 6`) into `$OCR_WORK/hdr/hNNN.txt`.
2. `python3 scripts/ocr/assemble.py txt assembled.json` finds each meter's charge block. A block is accepted only when its first lines add up exactly to the printed Total Water Charges. Gallons come from the meter reads (current minus previous equals billed, confirmed by the Superfund charge) or from the water drought charge ($0.08 per thousand gallons above 3,000).
3. `python3 scripts/ocr/write_bills.py assembled.json` writes bill files that do not exist yet. It never overwrites an existing bill. Bills whose period or gallons could not be read are written with `null` and `needs_review: true`.

`OCR_WORK` defaults to `raw/invoices/ocr` (git-ignored). Requires `tesseract` and `pdftoppm`.

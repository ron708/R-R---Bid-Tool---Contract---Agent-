# Reference — Bid Tools

Drop R&R bid tool examples here for pricing analysis.

Supported formats: .xlsx, .xls, .csv, .pdf

## Files in this folder
(Add files here)

## Purpose
These files are used to extract and verify the pricing logic that powers the
pricing engine in `lib/pricing-engine.ts` and the default rate table in
the Solarponics Admin → Pricing page.

Once a bid tool is reviewed, its rates should be entered in the Admin portal
or updated directly in `prisma/seed.ts` under `DefaultPricingConfig`.

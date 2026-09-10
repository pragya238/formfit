# FormFit

A working browser-based utility for preparing images and PDFs for online upload forms. Upload a file, paste requirements or read them from a screenshot, confirm the fields, convert, inspect, and download only after the numerical checks pass.

## Start on your computer

1. Extract the `FormFit` folder to your Desktop.
2. Open that folder in VS Code, then choose **Terminal → New Terminal**.
3. Install Node.js 24 LTS if Node is not installed.
4. Run these commands, one at a time:

```sh
npx --yes pnpm@11.19.0 install --frozen-lockfile
npx --yes pnpm@11.19.0 assets
npx --yes pnpm@11.19.0 dev
```

Open the localhost address printed in the terminal (normally http://localhost:5173). Keep the terminal open while using the app. Stop it with Ctrl+C. No API key is needed for conversion, OCR, or help-note retrieval.

The lockfile and build-script allowlist are included. Tesseract's optional donation-message postinstall script is explicitly disabled; its published runtime assets work without it. Use the pinned package manager and do not replace the lockfile.

## Included features

- JPEG, PNG, and WebP input and output; image-to-PDF conversion.
- PDF structural optimization that preserves text, plus explicit image-based PDF compression.
- File-content signature checks, input limits, and image/PDF previews.
- Local English screenshot OCR with self-hosted Tesseract workers and language data.
- Rules-based extraction of formats, size limits/ranges, and pixel dimensions from pasted text.
- Manual correction before conversion, aspect-ratio preservation, white padding, or center cropping.
- Quality search for JPG/WebP and automatic downscaling only when dimensions are not fixed.
- Verification of encoded output MIME, bytes, decoded image dimensions, and PDF page count.
- No artificial file-size padding, silent success, automatic document submission, or account requirement.
- Retrieval of relevant application help notes when a result fails a check.

## AI, GenAI, and RAG: the precise status

**Working without a key:** Tesseract OCR is ML-based. Requirement parsing is deterministic; it is not an LLM. Help retrieval uses a small original corpus with a term-frequency/inverse-document-frequency score; it is not vector search.

**Implemented but not connected:** `app/api/explain/route.ts` contains an optional retrieval-augmented generation path. When a server-side provider is configured, the route retrieves the top three relevant notes, supplies them as grounding context, and asks a compatible chat-completions API for a short explanation. If configuration is absent or the provider fails, the app displays source notes directly. No live generation provider was configured or tested in this build.

To enable locally, create an ignored `.dev.vars` with the server-only values below for the Cloudflare development runtime. Do not paste keys into frontend code or commit them:

```dotenv
GENERATION_URL=https://YOUR-PROVIDER/COMPLETE-CHAT-ENDPOINT
GENERATION_MODEL=YOUR-MODEL
GENERATION_API_KEY=YOUR-KEY
```

The endpoint must accept `model`, `messages`, `temperature`, and `max_tokens`, returning `choices[0].message.content`. Configure the corresponding secret values in your host for deployment. The help button sends requirements and mismatch notes, never file contents. Review provider retention and usage costs before enabling. This is a small RAG implementation, not a claim of a trained custom model.

## Important limits

- 25 MB per input, 40 megapixels per source image, 24 megapixels per output, maximum output side 8,000 px.
- PDF inputs stay PDFs. Preserve mode supports up to 20 pages; image-based mode up to 10. Password-protected PDFs are not supported.
- Image-based PDF compression removes searchable text, links, forms, signatures, and accessibility structure. It may blur small text. Inspect every page.
- The PDF thumbnail shows page 1; open the output to inspect all pages.
- HEIC, SVG, animated images, automatic background removal, DPI certification, and individual PDF page extraction are not included.
- KB means 1,000 bytes. Requirements mentioning physical dimensions, DPI, alternate formats, or appearance need manual review.
- Passing checks confirms only the selected measurable constraints. It does not guarantee readability or acceptance by the destination website.
- Screenshots are read in English. OCR can misread digits; every extracted field is editable.
- Nothing persists after refresh. The optional help request sends only text to the app server; conversion and OCR remain local.

## Source guide

| File | Responsibility |
|---|---|
| `app/page.tsx` | React interface and workflow |
| `app/globals.css` | Responsive styling |
| `lib/file-engine.ts` | Actual conversion and output checks |
| `lib/requirements.ts` | Parser, constraints, and dimension calculations |
| `lib/help-corpus.ts` | Original help notes and retrieval |
| `app/api/explain/route.ts` | Retrieval and optional GenAI explanation |
| `scripts/prepare-assets.mjs` | Reproducible local PDF/OCR assets |
| `scripts/test-core.mjs` | Core regression checks |

The app uses React, TypeScript, Next.js, Canvas, PDF.js, pdf-lib, and Tesseract.js. It also retains the Cloudflare-compatible tooling used by the original preview, but the standard Next.js scripts now support direct Vercel deployment.

## Verification

```sh
npx --yes pnpm@11.19.0 check
npx --yes pnpm@11.19.0 test
npx --yes pnpm@11.19.0 build
```

## Deploy on Vercel

Import `pragya238/formfit` in Vercel and keep the defaults: framework **Next.js**, install command `pnpm install --frozen-lockfile`, and build command `pnpm build`. Add `GENERATION_URL`, `GENERATION_MODEL`, and `GENERATION_API_KEY` only if you want the optional GenAI explanation; the core app works without them.

Browser end-to-end testing and cross-device visual QA were not run. Core tests and the production build are the initial checks; inspect the sample, your own image, and a multi-page PDF in your target browser before adding portfolio claims.

## Good next portfolio milestones

Gather anonymized upload requirements from a few actual websites. Label expected outputs. Measure extraction accuracy, constraint success rate, processing time, and failure modes. Validate image readability with users rather than reporting a made-up accuracy percentage. Expand the RAG corpus only when actual failures justify it.

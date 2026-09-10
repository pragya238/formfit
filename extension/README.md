# FormFit Companion

FormFit Companion is the desktop browser-extension surface for FormFit. It scans the visible text of the current upload page, extracts likely format/size/dimension constraints, and opens the main FormFit app with the brief prefilled.

## Load it locally

1. Open Chrome or Edge and visit the extensions page (`chrome://extensions` or `edge://extensions`).
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this `extension` folder.
4. Pin FormFit Companion, open an upload page, and click the extension icon.

The extension requests only `activeTab` and `scripting`. It reads visible page text after the user opens the popup; it never reads, uploads, or stores the selected file.

## Point it at your deployment

`popup.js` currently uses the public FormFit preview URL. Replace `FORMFIT_APP_URL` with the Vercel production URL after the Vercel deployment has a stable domain.

The extension intentionally asks the user to review the detected brief. Hidden server-side rules and visual requirements cannot be reliably inferred from a webpage, and browser security may prevent silently replacing a file chooser.

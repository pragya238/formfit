const FORMFIT_APP_URL = "https://formfit-pragya.divyanshkashyap2023.chatgpt.site";

const pageTitle = document.querySelector("#page-title");
const pageHost = document.querySelector("#page-host");
const status = document.querySelector("#status");
const result = document.querySelector("#result");
const chips = document.querySelector("#chips");
const excerpt = document.querySelector("#excerpt");
const inputCount = document.querySelector("#input-count");
let detectedBrief = "";

function parseBrief(text) {
  const normalized = text.toLowerCase().replace(/[–—]/g, "-");
  const values = [];
  const formats = [...normalized.matchAll(/\b(jpe?g|png|webp|pdf)\b/g)].map((match) => match[1] === "jpg" ? "JPG" : match[1].toUpperCase());
  if (formats.length) values.push(`Format · ${[...new Set(formats)].join(" / ")}`);
  const sizes = [...normalized.matchAll(/(\d+(?:\.\d+)?)\s*(kb|mb|kib|mib)\b/g)];
  if (sizes.length) values.push(`Size · ${sizes.map((match) => `${match[1]} ${match[2].toUpperCase()}`).join(" · ")}`);
  const dimensions = normalized.match(/\b(\d{2,5})\s*(?:px|pixels)?\s*(?:x|×|by)\s*(\d{2,5})\s*(?:px|pixels)?\b/);
  if (dimensions) values.push(`Dimensions · ${dimensions[1]} × ${dimensions[2]} px`);
  return values;
}

function extractPageSignals() {
  const body = document.body?.innerText || "";
  const fileInputs = [...document.querySelectorAll('input[type="file"]')];
  const hints = [...document.querySelectorAll("label, small, legend, [role=note], p, li")]
    .map((node) => node.innerText?.trim())
    .filter(Boolean)
    .filter((value) => /upload|file|format|size|dimension|pixel|photo|document|kb|mb|jpg|png|pdf/i.test(value))
    .slice(0, 35);
  return { title: document.title || "Untitled page", url: location.href, text: [hints.join("\n"), body.slice(0, 12000)].filter(Boolean).join("\n"), fileInputs: fileInputs.length };
}

function showError(message) {
  status.textContent = message;
  status.className = "status error";
  result.hidden = true;
}

async function scan() {
  status.textContent = "Looking for visible file requirements.";
  status.className = "status";
  result.hidden = true;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !/^https?:/.test(tab.url || "")) throw new Error("This page does not allow a local scan. Open a normal webpage first.");
    pageTitle.textContent = tab.title || "Current page";
    pageHost.textContent = new URL(tab.url).hostname;
    const [{ result: signals }] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: extractPageSignals });
    const found = parseBrief(signals.text);
    detectedBrief = signals.text.trim().slice(0, 6000);
    inputCount.textContent = `${signals.fileInputs} file input${signals.fileInputs === 1 ? "" : "s"}`;
    chips.innerHTML = (found.length ? found : ["No measurable rule found"]).map((item) => `<span class="chip">${item}</span>`).join("");
    excerpt.textContent = detectedBrief ? detectedBrief.replace(/\s+/g, " ").slice(0, 220) + (detectedBrief.length > 220 ? "…" : "") : "Paste the form’s instructions into FormFit to continue.";
    result.hidden = false;
    status.textContent = found.length ? "A few useful constraints are ready to review." : "The page has no obvious numbers yet. You can still review it in FormFit.";
  } catch (error) {
    showError(error instanceof Error ? error.message : "This page could not be scanned.");
  }
}

document.querySelector("#open").addEventListener("click", () => {
  const url = `${FORMFIT_APP_URL}/?requirements=${encodeURIComponent(detectedBrief)}`;
  chrome.tabs.create({ url });
});

document.querySelector("#copy").addEventListener("click", async (event) => {
  await navigator.clipboard.writeText(detectedBrief);
  event.currentTarget.textContent = "Copied";
  setTimeout(() => { event.currentTarget.textContent = "Copy brief"; }, 1200);
});

document.querySelector("#rescan").addEventListener("click", scan);
scan();

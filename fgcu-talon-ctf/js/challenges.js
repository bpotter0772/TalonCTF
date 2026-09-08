/**
 * Challenge data loader, SHA-256 flag verification (Web Crypto API), and basic markdown rendering.
 * CHALLENGES_EMBEDDED mirrors data/challenges.json for file:// and offline use.
 */

export const CHALLENGES_EMBEDDED = {
  version: 1,
  challenges: [
    {
      id: "001",
      title: "Warm Up",
      category: "general",
      categoryLabel: "General Skills",
      points: 100,
      difficulty: 1,
      flagSha256:
        "7b8613833c1dccb2bdc843cb112ebea7c3bf34b186deee8ce8f80a0077a646cc",
      description:
        "Welcome, Eagle. Every CTF starts with a warmup. The flag for this challenge is literally the FGCU Cybersecurity Concentration's motto, wrapped in the flag format. The motto is: **'Secure The Future'**. Submit it in the standard format, all lowercase, with underscores replacing spaces.",
      hints: [
        "Flag format is always FGCU{...}",
        '"secure the future" → replace spaces with underscores',
      ],
      resources: [],
    },
    {
      id: "002",
      title: "Base Case",
      category: "crypto",
      categoryLabel: "Cryptography",
      points: 200,
      difficulty: 2,
      flagSha256:
        "3d5ea8ecd33dc508756da625b0bb48b372fdcbf8f9d0c843fdf82335a2e476f2",
      description:
        "Our network monitor intercepted this suspicious string. Decode it to reveal the flag:\n\n```\nRkdDVXtiYXNlNjRfaXNfbm90X2VuY3J5cHRpb259\n```",
      hints: [
        "The string contains only alphanumeric characters plus `=` — ring any bells?",
        "It's Base64. Use any online Base64 decoder, or paste it into a browser console with `atob('...')`",
      ],
      resources: [],
    },
    {
      id: "003",
      title: "Source of Truth",
      category: "web",
      categoryLabel: "Web Exploitation",
      points: 200,
      difficulty: 2,
      flagSha256:
        "66cda2183d45473af22e25f67f1ce091aa0fa5b54c8571db669fc63ef3e0f98d",
      description:
        "A developer left something they shouldn't have in the page source of this challenge. The flag is hidden somewhere in the **HTML, CSS, or JavaScript** of this very page. Developers often leave comments they forget to remove...",
      hints: [
        "Right-click → View Page Source, or press Ctrl+U (Cmd+Option+U on macOS)",
        "Use Ctrl+F on the source and search for `FGCU{`",
      ],
      resources: [],
    },
    {
      id: "004",
      title: "Log Jam",
      category: "forensics",
      categoryLabel: "Forensics",
      points: 300,
      difficulty: 3,
      flagSha256:
        "255547d7456f81e51b51a9a72833c5ac2e16d49429a0c55405e25bcff8b7fec4",
      description:
        "An attacker compromised our server. We've pulled the auth logs from the past 24 hours (download below). Find the IP address that successfully logged in **after 5+ failed attempts**. The flag is `FGCU{ip_address_here}` with dots replaced by underscores.",
      hints: [
        'Look for repeated "Failed password" entries from the same IP',
        "Use Ctrl+F to count occurrences, or grep-style thinking: which IP appears in both FAIL and SUCCESS entries?",
      ],
      resources: [
        {
          label: "Download auth.log",
          href: "assets/forensics-challenge.txt",
          download: "forensics-challenge.txt",
        },
      ],
    },
    {
      id: "005",
      title: "Obfuscated",
      category: "reverse",
      categoryLabel: "Reverse Engineering",
      points: 300,
      difficulty: 3,
      flagSha256:
        "a44d8ca787902de2fe01311e19e4dc8e7e2388cec435c54bdb844e9b104a64fd",
      description:
        "One of our interns wrote this 'cleverly hidden' flag checker. Too bad it runs in the browser. Figure out what string makes the function return `true`. Download the file below.",
      hints: [
        "Open browser DevTools console, paste the file contents, and experiment with the `checkFlag()` function",
        "The function reverses the input then XORs each char — work backwards from the hardcoded array",
      ],
      resources: [
        {
          label: "Download reverse-me.js",
          href: "assets/reverse-me.js",
          download: "reverse-me.js",
        },
      ],
    },
    {
      id: "006",
      title: "Breach Report",
      category: "osint",
      categoryLabel: "OSINT",
      points: 500,
      difficulty: 5,
      flagSha256:
        "bb4ca8a3ca36f24e59a156fe23cd484e8cc184369588502faf0e0c143729dcfc",
      description:
        'Your task: use the **Have I Been Pwned** public API to find the breach whose `Name` is **Adobe**. Fetch it live and extract the year it happened (the `BreachDate` field, just the 4-digit year). Then count how many data classes were exposed in that breach (length of the `DataClasses` array). The flag is `FGCU{adobe_YEAR_COUNTclasses}` — e.g. if the breach was in 2013 with 7 data classes, the flag would be `FGCU{adobe_2013_7classes}`.',
      hints: [
        'The endpoint is `https://haveibeenpwned.com/api/v3/breaches` — open it in your browser, or use the "Try it live" button',
        'Search the JSON response for the entry where Name is "Adobe". Look at BreachDate and DataClasses.',
      ],
      resources: [
        {
          label: "HIBP breaches API (opens new tab)",
          href: "https://haveibeenpwned.com/api/v3/breaches",
          external: true,
        },
      ],
    },
  ],
};

export async function loadChallengeBundle() {
  try {
    const res = await fetch(new URL("../data/challenges.json", import.meta.url));
    if (res.ok) return res.json();
  } catch {
    /* file:// or blocked */
  }
  try {
    const res = await fetch("data/challenges.json");
    if (res.ok) return res.json();
  } catch {
    /* offline */
  }
  return CHALLENGES_EMBEDDED;
}

export async function sha256Hex(text) {
  const data = new TextEncoder().encode(text.trim());
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyFlag(submitted, expectedHex) {
  const h = await sha256Hex(submitted);
  return h === expectedHex.toLowerCase();
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatInline(text) {
  let t = escapeHtml(text);
  t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return t;
}

/**
 * Supports fenced ``` code blocks, **bold**, and `inline code`. Paragraphs split by blank lines.
 */
export function renderMarkdownBasic(raw) {
  if (!raw) return "";
  const segments = raw.split(/```/);
  const out = [];
  for (let i = 0; i < segments.length; i++) {
    const chunk = segments[i];
    if (i % 2 === 1) {
      out.push(
        `<pre class="md-code"><code>${escapeHtml(chunk.trim())}</code></pre>`
      );
    } else {
      const paras = chunk.split(/\n\n+/);
      for (const para of paras) {
        if (!para.trim()) continue;
        const lines = para.split("\n").map((line) => formatInline(line));
        out.push(`<p class="md-p">${lines.join("<br />")}</p>`);
      }
    }
  }
  return out.join("");
}

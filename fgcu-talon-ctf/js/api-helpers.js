/**
 * Public, keyless API helpers for the OSINT / breach-report challenge.
 *
 * NOTE: This endpoint requires no auth. If we needed a keyed API, we would route
 * through a serverless proxy — never embed keys client-side.
 */

const HIBP_BREACHES = "https://haveibeenpwned.com/api/v3/breaches";

/** @returns {Promise<object[]>} */
export async function fetchHibpBreaches() {
  const res = await fetch(HIBP_BREACHES, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`HIBP request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Fallback demo (rate-limited): GitHub user profile — for recon-style exercises if HIBP is unreachable.
 * @param {string} username
 */
export async function fetchGitHubUser(username) {
  const u = encodeURIComponent(username.trim());
  const res = await fetch(`https://api.github.com/users/${u}`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) {
    throw new Error(`GitHub request failed: ${res.status}`);
  }
  return res.json();
}

export function formatJsonForDisplay(obj) {
  return JSON.stringify(obj, null, 2);
}

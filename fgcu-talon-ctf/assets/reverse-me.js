/**
 * FGCU Talon CTF — Reverse Engineering practice file
 *
 * How to use: open DevTools (F12) → Console, paste this entire file, press Enter.
 * Then call checkFlag("your guess") — it returns true only for the correct flag string.
 *
 * Educational note: never ship real secrets in client-side code.
 */

(function () {
  const _k = 0x42;
  const _t = [63, 39, 38, 43, 49, 29, 54, 44, 39, 43, 46, 33, 29, 54, 49, 55, 48, 54, 29, 48, 39, 52, 39, 44, 57, 23, 1, 5, 4];

  function _x(s) {
    if (typeof s !== "string") return false;
    const r = s.split("").reverse().join("");
    if (r.length !== _t.length) return false;
    for (let i = 0; i < r.length; i++) {
      if ((r.charCodeAt(i) ^ _k) !== _t[i]) return false;
    }
    return true;
  }

  window.checkFlag = _x;
})();

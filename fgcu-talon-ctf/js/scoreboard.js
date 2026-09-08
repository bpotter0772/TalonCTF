/** @typedef {{ solved: boolean, hintsUsed: number, wrongAttempts: number, lastSolvedAt?: number }} ChallengeProgress */

const HANDLE_KEY = "fgcu_talon_handle";
const PROGRESS_KEY = "fgcu_talon_progress";

const FAKE_HANDLES = [
  "cyber_eagle",
  "shell_shocked",
  "buffer_owl",
  "packet_wizard",
  "talon_blue",
  "zero_trust_zoe",
  "hash_brown",
  "sql_seagull",
];

export function getHandle() {
  try {
    const h = localStorage.getItem(HANDLE_KEY);
    return h && h.trim() ? h.trim() : "anonymous_eagle";
  } catch {
    return "anonymous_eagle";
  }
}

export function setHandle(name) {
  try {
    localStorage.setItem(HANDLE_KEY, name.trim() || "anonymous_eagle");
  } catch {
    /* ignore */
  }
}

/** @returns {Record<string, ChallengeProgress>} */
export function getProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const p = JSON.parse(raw);
    return typeof p === "object" && p ? p : {};
  } catch {
    return {};
  }
}

/** @param {Record<string, ChallengeProgress>} p */
export function saveProgress(p) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function pointsForChallenge(challenge, progress) {
  const pr = progress[challenge.id] || {
    solved: false,
    hintsUsed: 0,
    wrongAttempts: 0,
  };
  if (!pr.solved) return 0;
  const hintCost = challenge.points * 0.1 * Math.min(pr.hintsUsed, 2);
  return Math.max(0, Math.round(challenge.points - hintCost));
}

export function totalStats(challenges) {
  const progress = getProgress();
  let solved = 0;
  let points = 0;
  for (const c of challenges) {
    const pr = progress[c.id];
    if (pr && pr.solved) {
      solved += 1;
      points += pointsForChallenge(c, progress);
    }
  }
  return { solved, points, total: challenges.length };
}

/** @param {{ id: string, points: number }[]} challenges */
export function buildScoreboardRows(challenges) {
  const progress = getProgress();
  const handle = getHandle();
  const rows = [];

  let mySolves = 0;
  let myPoints = 0;
  let myLast = 0;
  for (const c of challenges) {
    const pr = progress[c.id];
    if (pr && pr.solved) {
      mySolves += 1;
      myPoints += pointsForChallenge(c, progress);
      if (pr.lastSolvedAt) myLast = Math.max(myLast, pr.lastSolvedAt);
    }
  }

  rows.push({
    handle,
    solves: mySolves,
    points: myPoints,
    lastSolve: myLast || Date.now() - 600_000,
    isPlayer: true,
    isFake: false,
  });

  const fakeData = [
    { s: 5, p: 920, sol: 5 },
    { s: 4, p: 780, sol: 4 },
    { s: 4, p: 720, sol: 4 },
    { s: 3, p: 610, sol: 3 },
    { s: 3, p: 540, sol: 3 },
    { s: 2, p: 420, sol: 2 },
    { s: 2, p: 380, sol: 2 },
    { s: 1, p: 200, sol: 1 },
  ];

  for (let i = 0; i < FAKE_HANDLES.length; i++) {
    const fd = fakeData[i] || fakeData[fakeData.length - 1];
    rows.push({
      handle: FAKE_HANDLES[i],
      solves: fd.sol,
      points: fd.p - i * 7,
      lastSolve: Date.now() - i * 45_000 - Math.floor(Math.random() * 60_000),
      isFake: true,
    });
  }

  rows.sort((a, b) => b.points - a.points);
  return rows;
}

/** Advance fake last-solve timestamps slightly for a "live" feel */
export function tickFakeLastSolves(rows) {
  const now = Date.now();
  for (const r of rows) {
    if (!r.isFake) continue;
    if (Math.random() < 0.12) {
      r.lastSolve = now - Math.floor(Math.random() * 90_000);
    }
  }
}

export function formatLastSolve(ts) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    month: "short",
    day: "numeric",
  });
}

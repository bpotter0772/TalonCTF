import {
  loadChallengeBundle,
  renderMarkdownBasic,
  verifyFlag,
} from "./challenges.js";
import {
  getHandle,
  setHandle,
  getProgress,
  saveProgress,
  totalStats,
  buildScoreboardRows,
  tickFakeLastSolves,
  formatLastSolve,
  pointsForChallenge,
} from "./scoreboard.js";
import { initMatrixBackground } from "./matrix-bg.js";
import {
  fetchHibpBreaches,
  formatJsonForDisplay,
} from "./api-helpers.js";

/** @type {import('./challenges.js').CHALLENGES_EMBEDDED['challenges']} */
let challenges = [];

let currentCategory = "all";
/** @type {string | null} */
let currentChallengeId = null;
let scoreboardTimer = null;
/** @type {(() => void) | null} */
let matrixCleanup = null;

/** Interval id used to update the visible challenge timer while viewing a challenge */
let challengeTimerInterval = null;

const views = {
  landing: document.getElementById("view-landing"),
  dashboard: document.getElementById("view-dashboard"),
  challenge: document.getElementById("view-challenge"),
  scoreboard: document.getElementById("view-scoreboard"),
};

function showView(name) {
  // If we're leaving the challenge view, pause the running challenge timer
  if (name !== "challenge" && currentChallengeId) {
    pauseChallengeTimer(currentChallengeId);
  }

  Object.entries(views).forEach(([k, el]) => {
    if (!el) return;
    const on = k === name;
    el.hidden = !on;
    el.classList.toggle("view--active", on);
    if (on) {
      el.classList.remove("view-enter");
      void el.offsetWidth;
      el.classList.add("view-enter");
    }
  });
  if (name === "landing") {
    document.body.classList.add("body--landing");
    const canvas = document.getElementById("matrix-canvas");
    if (canvas && !matrixCleanup) {
      matrixCleanup = initMatrixBackground(canvas);
    }
  } else {
    document.body.classList.remove("body--landing");
    if (matrixCleanup) {
      matrixCleanup();
      matrixCleanup = null;
    }
  }
  if (name === "scoreboard") {
    renderScoreboard();
    if (scoreboardTimer) clearInterval(scoreboardTimer);
    scoreboardTimer = setInterval(() => {
      const tbody = document.getElementById("scoreboard-body");
      if (!tbody || views.scoreboard.hidden) return;
      const rows = buildScoreboardRows(challenges);
      tickFakeLastSolves(rows);
      fillScoreboardTable(tbody, rows);
    }, 4000);
  } else if (scoreboardTimer) {
    clearInterval(scoreboardTimer);
    scoreboardTimer = null;
  }
}

function getChallengeById(id) {
  return challenges.find((c) => c.id === id) || null;
}

function challengeStatus(c) {
  const p = getProgress()[c.id];
  if (p && p.solved) return "solved";
  if (p && (p.hintsUsed > 0 || p.wrongAttempts > 0)) return "progress";
  return "unsolved";
}

function matchesFilter(c) {
  if (currentCategory === "all") return true;
  if (currentCategory === "stego") return c.category === "stego";
  if (currentCategory === "crypto") return c.category === "crypto";
  if (currentCategory === "web") return c.category === "web";
  if (currentCategory === "forensics") return c.category === "forensics";
  if (currentCategory === "reverse") return c.category === "reverse";
  if (currentCategory === "osint") return c.category === "osint";
  return true;
}

function renderDashboard() {
  const grid = document.getElementById("challenge-grid");
  const progressEl = document.getElementById("progress-summary");
  if (!grid || !progressEl) return;

  const { solved, points, total } = totalStats(challenges);
  progressEl.textContent = `${solved} / ${total} solved • ${points} points`;

  grid.innerHTML = "";
  const list = challenges.filter(matchesFilter);
  if (list.length === 0) {
    grid.innerHTML =
      '<p class="empty-filter" role="status">No challenges in this category yet.</p>';
    return;
  }

  for (const c of list) {
    const st = challengeStatus(c);
    const card = document.createElement("article");
    card.className = `challenge-card challenge-card--${st}`;
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute(
      "aria-label",
      `Challenge ${c.id} ${c.title}, ${c.points} points`
    );

    const dots = Array.from({ length: 5 }, (_, i) =>
      i < c.difficulty
        ? '<span class="diff-dot diff-dot--on" aria-hidden="true">●</span>'
        : '<span class="diff-dot" aria-hidden="true">○</span>'
    ).join(" ");

    let statusLabel = "Unsolved";
    if (st === "progress") statusLabel = "In progress";
    if (st === "solved") statusLabel = "Solved ✓";

    const progressForCard = getProgress()[c.id] || {};
    const displayPoints = typeof progressForCard.currentPoints === "number" ? progressForCard.currentPoints : c.points;

    card.innerHTML = `
      <div class="challenge-card__head">
        <span class="cat-pill cat-pill--${c.category}">${escapeHtml(c.categoryLabel)}</span>
        <span class="challenge-num">#${c.id}</span>
      </div>
      <h3 class="challenge-card__title">${escapeHtml(c.title)}</h3>
      <div class="challenge-card__meta">
        <span class="points">${displayPoints} pts</span>
        <span class="diff-dots" title="Difficulty ${c.difficulty} of 5">${dots}</span>
      </div>
      <p class="challenge-card__status">
        ${st === "solved" ? '<span class="solved-check" aria-hidden="true">✓</span> ' : ""}
        <span>${statusLabel}</span>
      </p>
    `;

    function openChallenge() {
      openChallengeView(c.id);
    }
    card.addEventListener("click", openChallenge);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openChallenge();
      }
    });
    grid.appendChild(card);
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function openChallengeView(id) {
  currentChallengeId = id;
  const c = getChallengeById(id);
  if (!c) return;

  const pr = ensureProgressEntry(c.id);
  if (pr.currentPoints === null || typeof pr.currentPoints !== "number") {
    // initialize to the challenge's base points
    const progress = { ...getProgress() };
    progress[c.id] = { ...progress[c.id], currentPoints: c.points };
    saveProgress(progress);
  }

  const titleEl = document.getElementById("challenge-title");
  const metaEl = document.getElementById("challenge-meta");
  const bodyEl = document.getElementById("challenge-body");
  const resourcesEl = document.getElementById("challenge-resources");
  const hintsEl = document.getElementById("challenge-hints");
  const flagInput = document.getElementById("flag-input");
  const feedbackEl = document.getElementById("flag-feedback");
  const osintPanel = document.getElementById("osint-live-panel");

  if (titleEl) titleEl.textContent = c.title;
  if (metaEl) {
  const dots = "●".repeat(c.difficulty) + "○".repeat(5 - c.difficulty);

  // Read persisted progress for this challenge and prefer currentPoints if present
  const progress = getProgress();
  const cur = progress[c.id] || {};
  const displayPoints = (typeof cur.currentPoints === "number") ? cur.currentPoints : c.points;

  metaEl.innerHTML = `${escapeHtml(c.categoryLabel)} · ${displayPoints} pts · <span class="diff-inline" title="Difficulty">${escapeHtml(dots)}</span>`;
  }
  if (bodyEl) bodyEl.innerHTML = renderMarkdownBasic(c.description);

  const timerContainer = document.getElementById("challenge-timer-container");
  const timerId = `challenge-timer-${c.id}`;
  let timerEl = timerContainer ? document.getElementById(timerId) : null;

  if (!timerContainer) {
    // Fallback: try inserting after bodyEl if container missing
    // eslint-disable-next-line no-console
    console.warn("challenge-timer-container not found; falling back to bodyEl insertion");
    timerEl = document.getElementById(timerId);
    if (!timerEl && bodyEl && bodyEl.parentNode) {
      timerEl = document.createElement("p");
      timerEl.id = timerId;
      timerEl.className = "challenge-timer flag-feedback";
      bodyEl.parentNode.insertBefore(timerEl, bodyEl.nextSibling);
    }
  } else {
    if (!timerEl) {
      timerEl = document.createElement("p");
      timerEl.id = timerId;
      timerEl.className = "challenge-timer flag-feedback";
      timerContainer.innerHTML = ""; // ensure single child
      timerContainer.appendChild(timerEl);
    }
  }

  // Initialize timer text immediately for this challenge
  updateTimerDisplayForChallenge(c.id);

  const attemptsContainer = document.getElementById("challenge-attempts-container");
  const attemptsId = `challenge-attempts-${c.id}`;
  let attemptsEl = attemptsContainer ? document.getElementById(attemptsId) : null;

  if (!attemptsContainer) {
    // fallback: try inserting after bodyEl if container missing
    attemptsEl = document.getElementById(attemptsId);
    if (!attemptsEl && bodyEl && bodyEl.parentNode) {
      attemptsEl = document.createElement("p");
      attemptsEl.id = attemptsId;
      attemptsEl.className = "challenge-attempts";
      bodyEl.parentNode.insertBefore(attemptsEl, bodyEl.nextSibling);
    }
  } else {
    if (!attemptsEl) {
      attemptsEl = document.createElement("p");
      attemptsEl.id = attemptsId;
      attemptsEl.className = "challenge-attempts";
      attemptsContainer.innerHTML = ""; // ensure single child
      attemptsContainer.appendChild(attemptsEl);
    }
  }

  // Initialize attempts text immediately for this challenge
  updateAttemptsDisplayForChallenge(c.id);

  if (resourcesEl) {
    resourcesEl.innerHTML = "";
    if (c.resources && c.resources.length) {
      const h = document.createElement("h3");
      h.textContent = "Resources";
      resourcesEl.appendChild(h);
      const ul = document.createElement("ul");
      ul.className = "resource-list";
      for (const r of c.resources) {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = r.href;
        a.textContent = r.label;
        if (r.download) a.download = r.download;
        if (r.external) {
          a.target = "_blank";
          a.rel = "noopener noreferrer";
        }
        li.appendChild(a);
        ul.appendChild(li);
      }
      resourcesEl.appendChild(ul);
    }
  }

  if (hintsEl) {
    hintsEl.innerHTML = "";
    const h2 = document.createElement("h3");
    h2.textContent = "Hints";
    hintsEl.appendChild(h2);
    const pr = getProgress()[c.id] || {
      hintsUsed: 0,
      wrongAttempts: 0,
      solved: false,
    };
    const hintCost = Math.round(c.points * 0.1);
    for (let i = 0; i < c.hints.length; i++) {
      const wrap = document.createElement("div");
      wrap.className = "hint-block";
      const revealed = pr.hintsUsed > i;
      if (!revealed) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn-hint";
        btn.textContent = `Reveal hint ${i + 1} (−${hintCost} pts)`;
        btn.addEventListener("click", () => revealHint(c.id, i));
        wrap.appendChild(btn);
      } else {
        const p = document.createElement("p");
        p.className = "hint-text";
        p.innerHTML = formatInlineHints(c.hints[i]);
        wrap.appendChild(p);
      }
      hintsEl.appendChild(wrap);
    }
  }

  if (flagInput) {
    flagInput.value = "";
    flagInput.classList.remove("input-shake", "input-success");
  }
  if (feedbackEl) {
    feedbackEl.textContent = "";
    feedbackEl.className = "flag-feedback";
  }

  if (osintPanel) {
    osintPanel.hidden = c.id !== "031";
    if (c.id === "031") {
      osintPanel.innerHTML = `
        <div class="osint-box">
          <button type="button" class="btn btn-secondary" id="btn-hibp-live">Try it live (fetch breaches JSON)</button>
          <pre class="api-output" id="hibp-output" hidden tabindex="0"></pre>
          <p class="api-note" id="hibp-status" role="status"></p>
        </div>
      `;
      const btn = document.getElementById("btn-hibp-live");
      const out = document.getElementById("hibp-output");
      const st = document.getElementById("hibp-status");
      btn?.addEventListener("click", async () => {
        if (!out || !st) return;
        st.textContent = "Loading…";
        out.hidden = true;
        try {
          const data = await fetchHibpBreaches();
          out.textContent = formatJsonForDisplay(data);
          out.hidden = false;
          st.textContent = `Received ${Array.isArray(data) ? data.length : "?"} breach records.`;
        } catch (e) {
          st.textContent =
            e instanceof Error ? e.message : "Request failed. Check network or try again.";
        }
      });
    }
  }

  showView("challenge");

  // Start or resume the timer for this challenge
  startChallengeTimer(c.id);
}

/* ---------------------------
   Timer helpers and storage
   --------------------------- */

/**
 * Progress entry shape is extended with:
 *  - timeSpentMs: number (accumulated milliseconds)
 *  - timerLastStart: number | null (timestamp ms when timer was last started)
 *
 * These fields are persisted via existing getProgress/saveProgress helpers.
 */

/** Format milliseconds to mm:ss */
function formatMsToMMSS(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function ensureProgressEntry(challengeId) {
  const progress = { ...getProgress() };
  const cur = progress[challengeId] || {
    solved: false,
    hintsUsed: 0,
    wrongAttempts: 0,
    timeSpentMs: 0,
    timerLastStart: null,
    attempts: 0,
    currentPoints: null // will be initialized to challenge.points when we open the challenge
  };
  // Ensure fields exist
  if (typeof cur.timeSpentMs !== "number") cur.timeSpentMs = 0;
  if (!("timerLastStart" in cur)) cur.timerLastStart = null;
  if (typeof cur.attempts !== "number") cur.attempts = 0;
  if (!("currentPoints" in cur)) cur.currentPoints = null;
  progress[challengeId] = cur;
  saveProgress(progress);
  return progress[challengeId];
}

/** Start or resume the timer for a challenge */
function startChallengeTimer(challengeId) {
  // Pause any existing interval to avoid duplicates
  if (challengeTimerInterval) {
    clearInterval(challengeTimerInterval);
    challengeTimerInterval = null;
  }

  const progress = { ...getProgress() };
  const cur = progress[challengeId] || {
    solved: false,
    hintsUsed: 0,
    wrongAttempts: 0,
    timeSpentMs: 0,
    timerLastStart: null,
  };

  // If the challenge is already solved, do not start or resume the timer.
  if (cur.solved) {
    // Ensure timerLastStart is null and display final time
    if (cur.timerLastStart) {
      // finalize any running time just in case
      const elapsed = Date.now() - cur.timerLastStart;
      cur.timeSpentMs = (cur.timeSpentMs || 0) + elapsed;
      cur.timerLastStart = null;
      progress[challengeId] = cur;
      saveProgress(progress);
    }
    updateTimerDisplayForChallenge(challengeId);
    return;
  }

  // If timer is not already running, set last start timestamp
  if (!cur.timerLastStart) {
    cur.timerLastStart = Date.now();
    progress[challengeId] = cur;
    saveProgress(progress);
  }

  // Update display immediately and then every second
  updateTimerDisplayForChallenge(challengeId);
  challengeTimerInterval = setInterval(() => {
    updateTimerDisplayForChallenge(challengeId);
  }, 1000);
}

/** Pause the timer for a challenge and persist accumulated time */
function pauseChallengeTimer(challengeId) {
  if (!challengeId) return;
  // Clear visual interval
  if (challengeTimerInterval) {
    clearInterval(challengeTimerInterval);
    challengeTimerInterval = null;
  }

  const progress = { ...getProgress() };
  const cur = progress[challengeId];
  if (!cur) return;

  if (cur.timerLastStart) {
    const elapsed = Date.now() - cur.timerLastStart;
    cur.timeSpentMs = (cur.timeSpentMs || 0) + elapsed;
    cur.timerLastStart = null;
    progress[challengeId] = cur;
    saveProgress(progress);
  }

  // Update display one last time to show paused time
  updateTimerDisplayForChallenge(challengeId);
}

/** Get total accumulated time (ms) for a challenge, including running interval if active */
function getTotalTimeMsForChallenge(challengeId) {
  const progress = getProgress();
  const cur = progress[challengeId];
  if (!cur) return 0;
  let total = cur.timeSpentMs || 0;
  // If the challenge is solved, do not include any running timer (timerLastStart should be null)
  if (cur.solved) {
    return total;
  }
  if (cur.timerLastStart) {
    total += Date.now() - cur.timerLastStart;
  }
  return total;
}

function getTimerElementForChallenge(challengeId) {
  return document.getElementById(`challenge-timer-${challengeId}`);
}

/** Update the visible timer element for a specific challenge */
function updateTimerDisplayForChallenge(challengeId) {
  const timerEl = document.getElementById(`challenge-timer-${challengeId}`);
  if (!timerEl) {
    // eslint-disable-next-line no-console
    console.warn(`Timer element not found for challenge ${challengeId}`);
    return;
  }
  const totalMs = getTotalTimeMsForChallenge(challengeId);
  const mmss = formatMsToMMSS(totalMs);
  timerEl.textContent = `Time spent solving challenge: ${mmss}`;
}

function updateAttemptsDisplayForChallenge(challengeId) {
  const attemptsEl = document.getElementById(`challenge-attempts-${challengeId}`);
  if (!attemptsEl) {
    // eslint-disable-next-line no-console
    console.warn(`Attempts element not found for challenge ${challengeId}`);
    return;
  }
  const progress = getProgress();
  const cur = progress[challengeId] || { attempts: 0 };
  const attempts = cur.attempts || 0;
  attemptsEl.textContent = `Number of attempts made: ${attempts}`;
}

/* ---------------------------
   End timer helpers
   --------------------------- */

function formatInlineHints(text) {
  let t = escapeHtml(text);
  t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
  return t;
}

function revealHint(challengeId, hintIndex) {
  const c = getChallengeById(challengeId);
  if (!c) return;
  const progress = { ...getProgress() };
  const cur = progress[challengeId] || {
    solved: false,
    hintsUsed: 0,
    wrongAttempts: 0,
    timeSpentMs: 0,
    timerLastStart: null,
  };
  if (cur.hintsUsed <= hintIndex) {
    cur.hintsUsed = hintIndex + 1;
  }
  progress[challengeId] = cur;
  saveProgress(progress);
  openChallengeView(challengeId);
  renderDashboard();
}

async function submitFlag() {
  const c = currentChallengeId ? getChallengeById(currentChallengeId) : null;
  const flagInput = document.getElementById("flag-input");
  const feedbackEl = document.getElementById("flag-feedback");
  if (!c || !flagInput || !feedbackEl) return;

  const raw = flagInput.value;
  const progress = { ...getProgress() };
  const cur = progress[c.id] || {
    solved: false,
    hintsUsed: 0,
    wrongAttempts: 0,
    timeSpentMs: 0,
    timerLastStart: null,
    attempts: 0,
    currentPoints: c.points
  };

  // If already solved, show message and ensure timer/attempts display reflect final state
  if (cur.solved) {
    feedbackEl.textContent = "Already solved.";
    feedbackEl.className = "flag-feedback flag-feedback--info";
    updateTimerDisplayForChallenge(c.id);
    updateAttemptsDisplayForChallenge(c.id);
    return;
  }

  // Count this submission as an attempt (every time they press Submit)
  cur.attempts = (cur.attempts || 0) + 1;

  // Persist attempt increment immediately so UI updates even if validation fails
  progress[c.id] = cur;
  saveProgress(progress);
  updateAttemptsDisplayForChallenge(c.id);

  const flagPattern = /^FGCU\{[^}]+\}$/;
  const trimmed = raw.trim();
  if (!flagPattern.test(trimmed)) {
    // Invalid format counts as an attempt but not a correct flag
    flagInput.classList.add("input-shake");
    setTimeout(() => flagInput.classList.remove("input-shake"), 500);
    feedbackEl.textContent =
      "Invalid format — flags must look like FGCU{...}";
    feedbackEl.className = "flag-feedback flag-feedback--bad";

    // Penalize points for incorrect submission
    cur.wrongAttempts = (cur.wrongAttempts || 0) + 1;
    cur.currentPoints = Math.max(0, (typeof cur.currentPoints === "number" ? cur.currentPoints : c.points) - 10);

    progress[c.id] = cur;
    saveProgress(progress);
    renderDashboard();
    return;
  }

  const ok = await verifyFlag(trimmed, c.flagSha256);
  if (ok) {
    // Finalize and persist timer before marking solved
    if (cur.timerLastStart) {
      const elapsed = Date.now() - cur.timerLastStart;
      cur.timeSpentMs = (cur.timeSpentMs || 0) + elapsed;
      cur.timerLastStart = null;
    }
    cur.solved = true;
    cur.lastSolvedAt = Date.now();
    // Ensure currentPoints is at least 0 and persisted
    if (typeof cur.currentPoints !== "number") cur.currentPoints = c.points;
    progress[c.id] = cur;
    saveProgress(progress);

    // Stop any visible interval and update display to final time
    if (challengeTimerInterval) {
      clearInterval(challengeTimerInterval);
      challengeTimerInterval = null;
    }
    updateTimerDisplayForChallenge(c.id);
    updateAttemptsDisplayForChallenge(c.id);

    flagInput.classList.add("input-success");
    feedbackEl.textContent = "";
    feedbackEl.className = "flag-feedback";
    showSuccessOverlay(c);
    renderDashboard();
  } else {
    // Wrong flag (valid format but incorrect)
    flagInput.classList.add("input-shake");
    setTimeout(() => flagInput.classList.remove("input-shake"), 500);
    feedbackEl.textContent = "Invalid flag — try again";
    feedbackEl.className = "flag-feedback flag-feedback--bad";

    cur.wrongAttempts = (cur.wrongAttempts || 0) + 1;
    cur.currentPoints = Math.max(0, (typeof cur.currentPoints === "number" ? cur.currentPoints : c.points) - 10);

    progress[c.id] = cur;
    saveProgress(progress);
    updateAttemptsDisplayForChallenge(c.id);
    renderDashboard();
  }
}

function showSuccessOverlay(c) {
  const overlay = document.getElementById("success-overlay");
  const banner = document.getElementById("access-banner");
  const pts = document.getElementById("success-points");
  const progress = getProgress();
  const earned = pointsForChallenge(c, progress);
  if (pts) pts.textContent = `+${earned} pts`;
  overlay?.classList.add("success-overlay--show");
  banner?.classList.add("access-banner--show");
  fireConfetti();
  document.body.classList.add("flash-success");
  setTimeout(() => document.body.classList.remove("flash-success"), 350);

  setTimeout(() => {
    overlay?.classList.remove("success-overlay--show");
    banner?.classList.remove("access-banner--show");
    showView("dashboard");
    renderDashboard();
  }, 2000);
}

function fireConfetti() {
  const host = document.getElementById("confetti-host");
  if (!host) return;
  host.innerHTML = "";
  const colors = ["#4ade80", "#00563f", "#0075a8", "#fbbf24", "#f4f7f5"];
  for (let i = 0; i < 48; i++) {
    const p = document.createElement("span");
    p.className = "confetti-piece";
    p.style.left = `${Math.random() * 100}%`;
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = `${Math.random() * 0.3}s`;
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    host.appendChild(p);
  }
  setTimeout(() => {
    host.innerHTML = "";
  }, 2200);
}

function fillScoreboardTable(tbody, rows) {
  tbody.innerHTML = "";
  rows.forEach((row, idx) => {
    const tr = document.createElement("tr");
    if (row.isPlayer) tr.classList.add("score-row--you");
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${escapeHtml(row.handle)}</td>
      <td>${row.solves}</td>
      <td>${row.points}</td>
      <td>${formatLastSolve(row.lastSolve)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderScoreboard() {
  const tbody = document.getElementById("scoreboard-body");
  if (!tbody) return;
  const rows = buildScoreboardRows(challenges);
  tickFakeLastSolves(rows);
  rows.sort((a, b) => b.points - a.points);
  fillScoreboardTable(tbody, rows);
}

function wireFilters() {
  document.querySelectorAll("[data-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentCategory = btn.getAttribute("data-filter") || "all";
      document.querySelectorAll("[data-filter]").forEach((b) => {
        b.classList.toggle("chip--active", b === btn);
      });
      renderDashboard();
    });
  });
}

async function boot() {
  const bundle = await loadChallengeBundle();
  challenges = bundle.challenges;

  const handleInput = document.getElementById("player-handle");
  if (handleInput) {
    handleInput.value = getHandle();
    handleInput.addEventListener("change", () => {
      setHandle(handleInput.value);
      renderScoreboard();
    });
  }

  document.getElementById("btn-scoreboard-nav")?.addEventListener("click", () => {
    showView("scoreboard");
  });

  document.getElementById("btn-back-dashboard")?.addEventListener("click", () => {
    showView("dashboard");
    renderDashboard();
  });

  document.getElementById("btn-back-dashboard-2")?.addEventListener("click", () => {
    showView("dashboard");
    renderDashboard();
  });

  document.getElementById("btn-submit-flag")?.addEventListener("click", submitFlag);
  document.getElementById("flag-input")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitFlag();
  });

  wireFilters();
  renderDashboard();
  showView("landing");
}

boot();

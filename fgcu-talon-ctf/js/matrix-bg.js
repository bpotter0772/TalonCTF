/**
 * Matrix-style falling characters on the landing hero (canvas). Low opacity, non-distracting.
 */

const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()[]{}|;:,.<>?アイウエオカキクケコ";

export function initMatrixBackground(canvas) {
  if (!canvas || !canvas.getContext) return () => {};

  const ctx = canvas.getContext("2d");
  let animationId = 0;
  let cols = [];
  let w = 0;
  let h = 0;
  const fontSize = 14;
  let running = false;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.floor(rect.width);
    h = Math.floor(rect.height);
    if (w < 1 || h < 1) return;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const columnCount = Math.ceil(w / fontSize) + 1;
    cols = Array.from({ length: columnCount }, () => ({
      y: Math.random() * -h,
      speed: 0.4 + Math.random() * 1.2,
    }));
  }

  function frame() {
    if (!running) return;
    ctx.fillStyle = "rgba(10, 31, 26, 0.12)";
    ctx.fillRect(0, 0, w, h);
    ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
    ctx.textBaseline = "top";

    for (let i = 0; i < cols.length; i++) {
      const x = i * fontSize;
      const c = CHARS[(Math.random() * CHARS.length) | 0];
      const alpha = 0.08 + Math.random() * 0.22;
      ctx.fillStyle = `rgba(74, 222, 128, ${alpha})`;
      ctx.fillText(c, x, cols[i].y);
      cols[i].y += cols[i].speed * fontSize;
      if (cols[i].y > h) {
        cols[i].y = -fontSize * (2 + Math.random() * 8);
        cols[i].speed = 0.4 + Math.random() * 1.2;
      }
    }

    animationId = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    resize();
    running = true;
    animationId = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(animationId);
  }

  const ro = new ResizeObserver(() => {
    resize();
  });
  ro.observe(canvas);
  window.addEventListener("load", resize);

  start();

  return () => {
    stop();
    ro.disconnect();
    window.removeEventListener("load", resize);
  };
}

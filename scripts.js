(() => {
  "use strict";

  const deck = document.getElementById("deck");
  const slides = Array.from(deck.querySelectorAll(".slide"));
  const total = slides.length;
  const progress = document.getElementById("progress");
  const hud = document.getElementById("hud");
  const counter = document.getElementById("counter").querySelector(".num");
  const timerEl = document.getElementById("timer");
  const helpOverlay = document.getElementById("help");

  let idx = -1;
  let timerStart = null;
  let timerTick = null;
  let suppressHash = false;

  const pad = (n) => String(n).padStart(2, "0");

  function splitKinetic(slide) {
    slide.querySelectorAll("[data-kinetic]").forEach((el) => {
      if (
        el.classList.contains("grad-text") ||
        el.querySelector(".grad-text, .grad-underline")
      ) {
        return;
      }
      const mode = el.getAttribute("data-kinetic");
      const text = el.textContent;
      el.textContent = "";
      const parts = mode === "chars" ? Array.from(text) : text.split(/(\s+)/);
      let i = 0;
      parts.forEach((part) => {
        if (/^\s+$/.test(part)) {
          el.appendChild(document.createTextNode(part));
          return;
        }
        const span = document.createElement("span");
        span.className = mode === "chars" ? "k-char" : "k-word";
        span.style.setProperty("--i", i);
        span.textContent = part;
        el.appendChild(span);
        i += 1;
      });
    });
  }

  slides.forEach(splitKinetic);

  const simStates = new Map();

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function renderSimLine(raw) {
    if (!raw.trim()) return "<br>";
    let h = escapeHtml(raw);
    h = h.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
    const t = raw.trim();
    if (/^\*[^*].*\*$/.test(t)) return "<div><i>" + h.slice(1, -1) + "</i></div>";
    if (t.startsWith("### ")) return '<div class="sim-h">' + h.slice(4) + "</div>";
    if (/^\d+\.\s/.test(t) || /^-\s/.test(t)) return '<div class="sim-li">' + h + "</div>";
    return "<div>" + h + "</div>";
  }

  function setSimStatus(state, kind, text) {
    const dot = state.status.querySelector(".sim-dot");
    dot.className = "sim-dot" + (kind === "run" ? " run" : kind === "done" ? " done" : "");
    state.status.querySelector(".sim-text").textContent = text;
  }

  function addSimReplay(state) {
    if (state.status.querySelector(".sim-replay")) return;
    const btn = document.createElement("button");
    btn.className = "sim-replay";
    btn.textContent = "↺ ulang";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      state.phase = "idle";
      setSimStatus(state, "", "Simulasi siap — Enter atau klik ➤");
      btn.remove();
      startSim(state);
    });
    state.status.appendChild(btn);
  }

  function startSim(state) {
    const cfg = state.cfg;
    clearTimeout(state.timer);
    state.phase = "typing";
    state.body.innerHTML = "";
    setSimStatus(state, "run", "Menjalankan simulasi — klik untuk langsung selesai");
    if (cfg.user) {
      state.field.innerHTML = "";
      const textNode = document.createTextNode("");
      const cursor = document.createElement("span");
      cursor.className = "cursor";
      state.field.appendChild(textNode);
      state.field.appendChild(cursor);
      let i = 0;
      const speed = cfg.typeSpeed || 16;
      const step = () => {
        if (state.phase !== "typing") return;
        if (i >= cfg.user.length) {
          state.timer = setTimeout(() => sendSimPrompt(state), 280);
          return;
        }
        textNode.textContent += cfg.user[i++];
        state.timer = setTimeout(step, speed);
      };
      step();
    } else {
      beginSimThink(state);
    }
  }

  function sendSimPrompt(state) {
    if (state.phase !== "typing") return;
    const bubble = document.createElement("div");
    bubble.className = "msg user";
    bubble.textContent = state.cfg.user;
    state.body.appendChild(bubble);
    state.body.scrollTop = state.body.scrollHeight;
    state.field.innerHTML = '<span class="placeholder">Ketik pesan...</span>';
    if (state.cfg.ai) beginSimThink(state);
    else finishSim(state);
  }

  function beginSimThink(state) {
    state.phase = "thinking";
    const dots = document.createElement("div");
    dots.className = "msg ai";
    dots.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
    state.body.appendChild(dots);
    state.body.scrollTop = state.body.scrollHeight;
    state.timer = setTimeout(() => beginSimStream(state), state.cfg.thinkDelay || 750);
  }

  function beginSimStream(state) {
    if (state.phase !== "thinking") return;
    state.phase = "streaming";
    state.body.lastElementChild.remove();
    const bubble = document.createElement("div");
    bubble.className = "msg ai";
    state.body.appendChild(bubble);
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    bubble.appendChild(cursor);
    const lines = state.cfg.ai.split("\n");
    let li = 0, ci = 0, lineEl = null;
    const tick = state.cfg.streamTick || 12;
    const chunk = state.cfg.streamChunk || 3;
    const step = () => {
      if (state.phase !== "streaming") return;
      if (li >= lines.length) {
        state.body.scrollTop = state.body.scrollHeight;
        state.timer = setTimeout(() => finishSim(state), 260);
        return;
      }
      const raw = lines[li];
      if (!lineEl) {
        lineEl = document.createElement("div");
        lineEl.className = "sim-line";
        bubble.insertBefore(lineEl, cursor);
      }
      const plain = raw.replace(/\*\*/g, "");
      if (ci < plain.length) {
        ci = Math.min(plain.length, ci + chunk);
        lineEl.textContent = plain.slice(0, ci);
        state.body.scrollTop = state.body.scrollHeight;
        state.timer = setTimeout(step, tick);
        return;
      }
      lineEl.innerHTML = renderSimLine(raw);
      state.body.scrollTop = state.body.scrollHeight;
      lineEl = null;
      ci = 0;
      li++;
      state.timer = setTimeout(step, raw.trim() ? 40 : 90);
    };
    step();
  }

  function finishSim(state, allowChain) {
    clearTimeout(state.timer);
    clearTimeout(state.chainTimer);
    state.chainTimer = null;
    const cfg = state.cfg;
    state.body.innerHTML = "";
    if (cfg.user) {
      const u = document.createElement("div");
      u.className = "msg user";
      u.textContent = cfg.user;
      state.body.appendChild(u);
    }
    if (cfg.ai) {
      const a = document.createElement("div");
      a.className = "msg ai";
      a.innerHTML = cfg.ai.split("\n").map(renderSimLine).join("");
      state.body.appendChild(a);
    }
    state.body.scrollTop = state.body.scrollHeight;
    state.field.innerHTML = '<span class="placeholder">Ketik pesan...</span>';
    state.phase = "done";
    setSimStatus(state, "done", "Selesai — opsi live: jalankan prompt yang sama di ChatGPT");
    addSimReplay(state);
    if (allowChain !== false && cfg.then) {
      const targetEl = document.querySelector('[data-sim="' + cfg.then + '"]');
      const target = targetEl && simStates.get(targetEl);
      if (target && target.phase === "idle") {
        state.chainTimer = setTimeout(() => {
          if (target.phase === "idle") startSim(target);
        }, 800);
      }
    }
  }

  function advanceSimOnSlide(slide) {
    const states = Array.from(slide.querySelectorAll("[data-sim]"))
      .map((el) => simStates.get(el))
      .filter(Boolean);
    if (!states.length) return false;
    const running = states.find(
      (s) => s.phase === "typing" || s.phase === "thinking" || s.phase === "streaming"
    );
    if (running) {
      finishSim(running);
      return true;
    }
    const idle = states.find((s) => s.phase === "idle");
    if (idle) {
      startSim(idle);
      return true;
    }
    return false;
  }

  function initSims() {
    document.querySelectorAll("[data-sim]").forEach((el) => {
      const cfg = (window.SIMS || {})[el.getAttribute("data-sim")];
      if (!cfg) return;
      const state = { el, cfg, phase: "idle", timer: null, chainTimer: null, field: null, status: null, body: null };
      simStates.set(el, state);
      const body = el.querySelector(".chat-body");
      body.innerHTML = "";
      const input = document.createElement("div");
      input.className = "chat-input";
      const field = document.createElement("div");
      field.className = "sim-field";
      field.innerHTML = '<span class="placeholder">Ketik pesan...</span>';
      const send = document.createElement("button");
      send.className = "sim-send";
      send.title = "Jalankan simulasi";
      send.innerHTML = '<svg class="ic"><use href="#i-send"/></svg>';
      input.appendChild(field);
      input.appendChild(send);
      const status = document.createElement("div");
      status.className = "chat-status";
      status.innerHTML = '<span class="sim-dot"></span><span class="sim-text">Simulasi siap — Enter atau klik ➤</span>';
      el.appendChild(input);
      el.appendChild(status);
      Object.assign(state, { field, status, body });
      send.addEventListener("click", (e) => {
        e.stopPropagation();
        if (state.phase === "idle") startSim(state);
        else if (state.phase === "done") {
          state.phase = "idle";
          setSimStatus(state, "", "Simulasi siap — Enter atau klik ➤");
          const r = state.status.querySelector(".sim-replay");
          if (r) r.remove();
          startSim(state);
        } else finishSim(state);
      });
      el.addEventListener("click", () => {
        if (state.phase === "typing" || state.phase === "thinking" || state.phase === "streaming") finishSim(state);
      });
    });
  }

  initSims();

  function startTimer() {
    if (timerStart) return;
    timerStart = Date.now();
    timerTick = setInterval(() => {
      const elapsed = Math.floor((Date.now() - timerStart) / 1000);
      const m = Math.floor(elapsed / 60);
      const s = elapsed % 60;
      timerEl.textContent = `${pad(m)}:${pad(s)} / 60:00`;
      timerEl.classList.toggle("over", m >= 60);
    }, 500);
  }

  function updateHud(slide) {
    const section = slide.dataset.section || "AI-Powered Student";
    hud.innerHTML = "";
    if (section) {
      const b = document.createElement("span");
      b.className = "badge";
      b.textContent = section;
      hud.appendChild(b);
    }
    counter.textContent = `${idx + 1} / ${total}`;
    progress.style.width = `${((idx + 1) / total) * 100}%`;
  }

  function go(n) {
    n = Math.max(0, Math.min(total - 1, n));
    if (n === idx) return;
    if (idx >= 0) {
      slides[idx].querySelectorAll("[data-sim]").forEach((el) => {
        const st = simStates.get(el);
        if (st && (st.phase === "typing" || st.phase === "thinking" || st.phase === "streaming")) finishSim(st, false);
      });
      slides[idx].classList.remove("active");
    }
    idx = n;
    const slide = slides[idx];
    slide.classList.remove("active");
    void slide.offsetWidth;
    slide.classList.add("active");
    slide.querySelector(".s-body, .slide-body")?.scrollTo?.(0, 0);
    updateHud(slide);
    startTimer();
    if (!suppressHash) {
      suppressHash = true;
      location.hash = `#/${idx}`;
      suppressHash = false;
    }
  }

  const next = () => go(idx + 1);
  const prev = () => go(idx - 1);

  document.getElementById("btn-prev").addEventListener("click", prev);
  document.getElementById("btn-next").addEventListener("click", next);

  timerEl.addEventListener("click", () => {
    if (timerTick) clearInterval(timerTick);
    timerStart = null;
    timerEl.textContent = "00:00 / 60:00";
    timerEl.classList.remove("over");
  });

  document.addEventListener("keydown", (e) => {
    if (e.target && e.target.matches && e.target.matches("input, textarea")) return;
    switch (e.key) {
      case "Enter": {
        e.preventDefault();
        if (!advanceSimOnSlide(slides[idx])) next();
        break;
      }
      case "ArrowRight":
      case "ArrowDown":
      case "PageDown":
      case " ":
        e.preventDefault();
        next();
        break;
      case "ArrowLeft":
      case "ArrowUp":
      case "PageUp":
        e.preventDefault();
        prev();
        break;
      case "Home":
        e.preventDefault();
        go(0);
        break;
      case "End":
        e.preventDefault();
        go(total - 1);
        break;
      case "t":
      case "T":
        timerEl.click();
        break;
      case "f":
      case "F":
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen().catch(() => {});
        break;
      case "?":
        helpOverlay.classList.toggle("show");
        break;
      case "Escape":
        helpOverlay.classList.remove("show");
        break;
    }
  });

  let touchX = null;
  document.addEventListener(
    "touchstart",
    (e) => {
      touchX = e.changedTouches[0].clientX;
    },
    { passive: true }
  );
  document.addEventListener(
    "touchend",
    (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 60) (dx < 0 ? next : prev)();
      touchX = null;
    },
    { passive: true }
  );

  window.addEventListener("hashchange", () => {
    if (suppressHash) return;
    const m = location.hash.match(/^#\/(\d+)$/);
    if (m) go(parseInt(m[1], 10));
  });

  helpOverlay.addEventListener("click", () => helpOverlay.classList.remove("show"));

  const initial = location.hash.match(/^#\/(\d+)$/);
  go(initial ? parseInt(initial[1], 10) : 0);
})();

// Injected into every page during recording. Draws a fake cursor, a
// highlight ring with an arrow callout, captions and a step badge.
// Nothing here ships with the app.
(() => {
  if (window.__wt) return;

  const css = `
    #wt-layer { position: fixed; inset: 0; z-index: 2147483647; pointer-events: none; font-family: Lexend, system-ui, sans-serif; }
    #wt-cursor { position: absolute; left: 0; top: 0; width: 28px; height: 32px; transition: transform .7s cubic-bezier(.22,.8,.3,1); filter: drop-shadow(0 4px 6px rgba(0,0,0,.25)); }
    #wt-cursor.click svg { transform: scale(.82); }
    #wt-cursor svg { transition: transform .12s; transform-origin: 3px 3px; }
    #wt-ripple { position: absolute; width: 44px; height: 44px; margin: -22px 0 0 -22px; border-radius: 50%; background: rgba(242,122,26,.35); transform: scale(0); opacity: 0; }
    #wt-ripple.go { animation: wt-ripple .55s ease-out; }
    @keyframes wt-ripple { from { transform: scale(.2); opacity: 1; } to { transform: scale(1.6); opacity: 0; } }
    #wt-ring { position: absolute; border: 3px solid #f27a1a; border-radius: 18px; box-shadow: 0 0 0 9999px rgba(11,59,60,.28); opacity: 0; transition: all .5s cubic-bezier(.22,.8,.3,1); }
    #wt-ring.on { opacity: 1; }
    #wt-callout { position: absolute; max-width: 300px; background: #0b3b3c; color: #fff; font-size: 15px; font-weight: 500; line-height: 1.35; padding: 10px 16px; border-radius: 16px; opacity: 0; transform: translateY(6px); transition: opacity .35s, transform .35s; box-shadow: 0 12px 28px -10px rgba(11,59,60,.6); white-space: nowrap; }
    #wt-callout.on { opacity: 1; transform: none; }
    #wt-arrow { position: absolute; width: 64px; height: 64px; opacity: 0; transition: opacity .35s; }
    #wt-arrow.on { opacity: 1; animation: wt-bob 1s ease-in-out infinite; }
    @keyframes wt-bob { 50% { translate: var(--bx, 0) var(--by, 6px); } }
    #wt-caption { position: absolute; left: 50%; bottom: 26px; transform: translateX(-50%); max-width: 860px; width: max-content; background: rgba(11,59,60,.88); color: #fff; font-size: 19px; line-height: 1.45; padding: 10px 22px; border-radius: 18px; text-align: center; opacity: 0; transition: opacity .3s; }
    #wt-caption.on { opacity: 1; }
    #wt-step { position: absolute; left: 22px; bottom: 30px; display: flex; align-items: center; gap: 8px; background: #f9e4cf; color: #0b3b3c; font-size: 14px; font-weight: 600; padding: 8px 14px 8px 8px; border-radius: 999px; opacity: 0; transition: opacity .3s; box-shadow: 0 8px 20px -10px rgba(11,59,60,.5); }
    #wt-step.on { opacity: 1; }
    #wt-step b { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 50%; background: #f27a1a; color: #fff; font-size: 13px; }
  `;

  const cursorSvg = `<svg width="28" height="32" viewBox="0 0 22 26"><path d="M2 2 L2 20 L7 15.5 L10.5 23 L14 21.5 L10.5 14 L17.5 14 Z" fill="#fff" stroke="#0b3b3c" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
  const arrowSvg = `<svg viewBox="0 0 64 64" width="64" height="64"><path d="M32 6 C30 22 30 34 32 50" fill="none" stroke="#f27a1a" stroke-width="6" stroke-linecap="round"/><path d="M18 38 L32 54 L46 38" fill="none" stroke="#f27a1a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  let layer;
  const state = { x: 640, y: 360 };

  function ensure() {
    if (layer && document.body.contains(layer)) return true;
    if (!document.body) return false;
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    layer = document.createElement("div");
    layer.id = "wt-layer";
    layer.innerHTML = `
      <div id="wt-ring"></div>
      <div id="wt-arrow">${arrowSvg}</div>
      <div id="wt-callout"></div>
      <div id="wt-ripple"></div>
      <div id="wt-cursor">${cursorSvg}</div>
      <div id="wt-caption"></div>
      <div id="wt-step"><b></b><span></span></div>`;
    document.body.appendChild(layer);
    move(state.x, state.y, true);
    return true;
  }

  const $ = (id) => (ensure(), document.getElementById(id));

  function move(x, y, instant) {
    state.x = x;
    state.y = y;
    const c = document.getElementById("wt-cursor");
    if (!c) return;
    if (instant) c.style.transition = "none";
    c.style.transform = `translate(${x - 3}px, ${y - 3}px)`;
    if (instant) requestAnimationFrame(() => (c.style.transition = ""));
  }

  window.__wt = {
    ensure,
    move: (x, y) => (ensure(), move(x, y)),
    click() {
      const c = $("wt-cursor");
      const r = $("wt-ripple");
      c.classList.add("click");
      r.style.left = state.x + "px";
      r.style.top = state.y + "px";
      r.classList.remove("go");
      void r.offsetWidth;
      r.classList.add("go");
      setTimeout(() => c.classList.remove("click"), 160);
    },
    /** Ring around rect, plus an arrow and label on the given side. */
    highlight(rect, label, side = "top") {
      const pad = 8;
      const ring = $("wt-ring");
      Object.assign(ring.style, {
        left: rect.x - pad + "px",
        top: rect.y - pad + "px",
        width: rect.width + pad * 2 + "px",
        height: rect.height + pad * 2 + "px",
      });
      ring.classList.add("on");

      const arrow = $("wt-arrow");
      const callout = $("wt-callout");
      const cx = rect.x + rect.width / 2;
      const cy = rect.y + rect.height / 2;
      const W = window.innerWidth;
      callout.textContent = label || "";
      callout.classList.toggle("on", !!label);
      const cw = callout.offsetWidth;
      const ch = callout.offsetHeight;
      const clampX = (x) => Math.max(12, Math.min(W - cw - 12, x));

      let ax, ay, rot, lx, ly, bob;
      if (side === "top") {
        ax = cx - 32; ay = rect.y - pad - 70; rot = 0; bob = "0 6px";
        lx = clampX(cx - cw / 2); ly = ay - ch - 4;
      } else if (side === "bottom") {
        ax = cx - 32; ay = rect.y + rect.height + pad + 6; rot = 180; bob = "0 -6px";
        lx = clampX(cx - cw / 2); ly = ay + 70;
      } else if (side === "left") {
        ax = rect.x - pad - 70; ay = cy - 32; rot = -90; bob = "6px 0";
        lx = Math.max(12, ax - cw - 4); ly = cy - ch / 2;
      } else {
        ax = rect.x + rect.width + pad + 6; ay = cy - 32; rot = 90; bob = "-6px 0";
        lx = Math.min(W - cw - 12, ax + 70); ly = cy - ch / 2;
      }
      Object.assign(arrow.style, { left: ax + "px", top: ay + "px", transform: `rotate(${rot}deg)` });
      arrow.style.setProperty("--bx", bob.split(" ")[0]);
      arrow.style.setProperty("--by", bob.split(" ")[1]);
      arrow.classList.toggle("on", !!label);
      Object.assign(callout.style, { left: lx + "px", top: ly + "px" });
    },
    clear() {
      ["wt-ring", "wt-arrow", "wt-callout"].forEach((id) => $(id).classList.remove("on"));
    },
    caption(text) {
      const el = $("wt-caption");
      el.textContent = text || "";
      el.classList.toggle("on", !!text);
    },
    step(n, label) {
      const el = $("wt-step");
      el.querySelector("b").textContent = n;
      el.querySelector("span").textContent = label || "";
      el.classList.toggle("on", !!label);
    },
  };

  document.addEventListener("DOMContentLoaded", ensure);
})();

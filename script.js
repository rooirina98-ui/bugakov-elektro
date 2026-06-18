/* ===== Бугаков Электромонтаж — script.js ===== */

document.addEventListener("DOMContentLoaded", () => {
  initYear();
  initBurger();
  initReveal();
  initActiveNav();
  initGallery();
  initBeforeAfter();
  initLightbox();
  initCopyPhone();
  initCircuit();
});

const PHONE_PRETTY = "+7 913 671 57 06";

/* --- Год в подвале --- */
function initYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

/* --- Бургер-меню --- */
function initBurger() {
  const burger = document.getElementById("burger");
  const menu = document.getElementById("mobile-menu");
  if (!burger || !menu) return;

  const toggle = (open) => {
    burger.classList.toggle("is-open", open);
    menu.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
  };

  burger.addEventListener("click", () => toggle(!menu.classList.contains("is-open")));
  menu.querySelectorAll(".mobile-menu__link").forEach((l) =>
    l.addEventListener("click", () => toggle(false))
  );
}

/* --- Появление блоков при скролле --- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((i) => i.classList.add("is-visible"));
    return;
  }
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  items.forEach((i) => obs.observe(i));
}

/* --- Подсветка активного пункта меню --- */
function initActiveNav() {
  const links = document.querySelectorAll(".nav__link");
  const map = {};
  links.forEach((l) => {
    const id = l.getAttribute("href").slice(1);
    const sec = document.getElementById(id);
    if (sec) map[id] = l;
  });
  const sections = Object.keys(map).map((id) => document.getElementById(id));
  if (!sections.length || !("IntersectionObserver" in window)) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((l) => l.classList.remove("is-active"));
          if (map[e.target.id]) map[e.target.id].classList.add("is-active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => obs.observe(s));
}

/* --- Галерея работ из data/gallery.json --- */
async function initGallery() {
  const grid = document.getElementById("gallery");
  const empty = document.getElementById("gallery-empty");
  const section = document.getElementById("works");
  if (!grid) return;

  try {
    const res = await fetch("data/gallery.json", { cache: "no-store" });
    const items = await res.json();

    if (!Array.isArray(items) || items.length === 0) {
      if (section) section.hidden = true;
      return;
    }

    grid.innerHTML = items
      .map(
        (it) => `
      <figure class="gallery__item reveal" data-full="${escapeAttr(it.src)}" data-title="${escapeAttr(it.title || "")}">
        <img src="${escapeAttr(it.src)}" alt="${escapeAttr(it.title || "Фото работы")}" loading="lazy" />
        <figcaption class="gallery__cap">
          ${it.category ? `<span class="gallery__cat">${escapeHtml(it.category)}</span>` : ""}
          ${escapeHtml(it.title || "")}
        </figcaption>
      </figure>`
      )
      .join("");

    initReveal();
  } catch (err) {
    console.warn("Не удалось загрузить gallery.json:", err);
    if (empty) empty.hidden = false;
  }
}

/* --- До / после из data/before-after.json --- */
async function initBeforeAfter() {
  const grid = document.getElementById("ba-grid");
  const empty = document.getElementById("ba-empty");
  const section = document.getElementById("before-after");
  if (!grid) return;

  try {
    const res = await fetch("data/before-after.json", { cache: "no-store" });
    const items = await res.json();

    if (!Array.isArray(items) || items.length === 0) {
      if (section) section.hidden = true;
      return;
    }

    grid.innerHTML = items
      .map(
        (it) => `
      <div class="ba-card reveal">
        <div class="ba-card__pair">
          <div class="ba-card__side ba-card__side--before" data-full="${escapeAttr(it.before)}" data-title="${escapeAttr((it.title || "") + " — до")}">
            <span class="ba-card__label">До</span>
            <img src="${escapeAttr(it.before)}" alt="${escapeAttr((it.title || "Работа") + " — до")}" loading="lazy" />
          </div>
          <div class="ba-card__side ba-card__side--after" data-full="${escapeAttr(it.after)}" data-title="${escapeAttr((it.title || "") + " — после")}">
            <span class="ba-card__label">После</span>
            <img src="${escapeAttr(it.after)}" alt="${escapeAttr((it.title || "Работа") + " — после")}" loading="lazy" />
          </div>
        </div>
        ${it.title ? `<div class="ba-card__title">${escapeHtml(it.title)}</div>` : ""}
      </div>`
      )
      .join("");

    initReveal();
  } catch (err) {
    console.warn("Не удалось загрузить before-after.json:", err);
    if (empty) empty.hidden = false;
  }
}

/* --- Лайтбокс для фото --- */
function initLightbox() {
  const box = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-img");
  const cap = document.getElementById("lightbox-caption");
  const close = document.getElementById("lightbox-close");
  if (!box) return;

  const open = (src, title) => {
    img.src = src;
    img.alt = title || "";
    cap.textContent = title || "";
    box.hidden = false;
    document.body.style.overflow = "hidden";
  };
  const hide = () => {
    box.hidden = true;
    img.src = "";
    document.body.style.overflow = "";
  };

  document.addEventListener("click", (e) => {
    const target = e.target.closest("[data-full]");
    if (target) open(target.dataset.full, target.dataset.title);
  });
  close.addEventListener("click", hide);
  box.addEventListener("click", (e) => { if (e.target === box) hide(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !box.hidden) hide(); });
}

/* --- Эффект схемы проводки с бегущими импульсами --- */
function initCircuit() {
  const canvas = document.getElementById("circuit-canvas");
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d");
  let w, h, dpr, lines = [], pulses = [], raf = null;
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  // Сколько токов одновременно (мало — чтобы было похоже на электричество, а не на мошкару)
  const MAX_PULSES = isMobile ? 3 : 6;
  const BASE_SPEED = isMobile ? 1.0 : 1.4;   // пикселей за кадр — медленно и плавно
  const TAIL = isMobile ? 80 : 120;          // длина светящегося хвоста, px

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildLines();
  }

  // Строим ортогональную "схему" из ломаных линий (как дорожки на плате)
  function buildLines() {
    lines = [];
    const count = isMobile ? 5 : 9;
    const step = 32;
    for (let i = 0; i < count; i++) {
      const pts = [];
      let x = Math.round((Math.random() * w) / step) * step;
      let y = Math.round((Math.random() * h) / step) * step;
      const segs = 4 + Math.floor(Math.random() * 4);
      let dir = Math.random() > 0.5;
      pts.push({ x, y });
      for (let s = 0; s < segs; s++) {
        const len = 90 + Math.random() * 220;
        if (dir) x += (Math.random() > 0.5 ? 1 : -1) * len;
        else y += (Math.random() > 0.5 ? 1 : -1) * len;
        x = Math.max(0, Math.min(w, Math.round(x / step) * step));
        y = Math.max(0, Math.min(h, Math.round(y / step) * step));
        pts.push({ x, y });
        dir = !dir;
      }
      // кэшируем накопленную длину для равномерной скорости
      const cum = [0];
      let total = 0;
      for (let k = 1; k < pts.length; k++) {
        total += Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y);
        cum.push(total);
      }
      lines.push({ pts, cum, len: total });
    }
  }

  // точка на расстоянии d (px) от начала линии
  function pointAtDist(line, d) {
    const { pts, cum } = line;
    if (d <= 0) return pts[0];
    if (d >= line.len) return pts[pts.length - 1];
    let i = 1;
    while (i < cum.length && cum[i] < d) i++;
    const segLen = cum[i] - cum[i - 1];
    const r = segLen === 0 ? 0 : (d - cum[i - 1]) / segLen;
    return {
      x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * r,
      y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * r,
    };
  }

  function spawnPulse() {
    if (!lines.length || pulses.length >= MAX_PULSES) return;
    const idx = Math.floor(Math.random() * lines.length);
    pulses.push({
      line: idx,
      head: 0,
      speed: BASE_SPEED * (0.75 + Math.random() * 0.5),
    });
  }

  // импульс при прокрутке — добавляем ток, но скорость не разгоняем
  let lastScroll = window.scrollY;
  window.addEventListener("scroll", () => {
    const delta = Math.abs(window.scrollY - lastScroll);
    lastScroll = window.scrollY;
    if (delta > 30 && Math.random() < 0.5) spawnPulse();
  }, { passive: true });

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // дорожки-проводка — заметные, но спокойные
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = "rgba(255, 210, 31, 0.16)";
    ctx.lineJoin = "round";
    lines.forEach((line) => {
      const pts = line.pts;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
      // узлы-контакты
      for (let i = 0; i < pts.length; i++) {
        ctx.beginPath();
        ctx.arc(pts[i].x, pts[i].y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 210, 31, 0.32)";
        ctx.fill();
      }
    });

    // токи — светящийся хвост, бегущий по дорожке
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    pulses.forEach((pl) => {
      const line = lines[pl.line];
      if (!line) return;
      pl.head += pl.speed;

      const steps = 18;
      ctx.shadowColor = "rgba(255, 180, 40, 0.9)";
      ctx.shadowBlur = 10;
      for (let i = 0; i < steps; i++) {
        const d1 = pl.head - (TAIL * i) / steps;
        const d2 = pl.head - (TAIL * (i + 1)) / steps;
        if (d2 < 0) break;
        const a = pointAtDist(line, d1);
        const b = pointAtDist(line, d2);
        const k = 1 - i / steps;            // яркость убывает к хвосту
        ctx.strokeStyle = `rgba(255, ${200 + Math.round(40 * k)}, ${90 + Math.round(60 * k)}, ${0.9 * k})`;
        ctx.lineWidth = 1 + 2.6 * k;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      // яркая голова тока
      const head = pointAtDist(line, Math.min(pl.head, line.len));
      ctx.shadowBlur = 16;
      ctx.shadowColor = "rgba(255, 200, 60, 1)";
      ctx.beginPath();
      ctx.arc(head.x, head.y, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 250, 225, 1)";
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // убираем ушедшие за конец линии (с учётом хвоста)
    pulses = pulses.filter((p) => {
      const line = lines[p.line];
      return line && p.head - TAIL < line.len;
    });

    // редкий автоспавн, чтобы схема жила
    if (Math.random() < 0.012) spawnPulse();

    raf = requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", debounce(resize, 200));
  for (let i = 0; i < (isMobile ? 2 : 3); i++) spawnPulse();
  draw();

  // экономим ресурсы, когда вкладка скрыта
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { if (raf) cancelAnimationFrame(raf); raf = null; }
    else if (!raf) draw();
  });
}

/* --- Копирование номера для Telegram / Max --- */
function initCopyPhone() {
  const buttons = document.querySelectorAll(".copy-phone");
  buttons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const channel = btn.dataset.channel || "мессенджере";
      try {
        await navigator.clipboard.writeText(PHONE_PRETTY);
        showToast(`Номер скопирован. Найдите мастера в ${channel} по номеру ${PHONE_PRETTY}.`);
      } catch (e) {
        showToast(`Номер мастера: ${PHONE_PRETTY}. Найдите в ${channel} по номеру.`);
      }
    });
  });
}

let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

/* --- Утилиты --- */
function debounce(fn, ms) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
function escapeAttr(str) { return escapeHtml(str); }

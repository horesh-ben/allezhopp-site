/* AllezHopp – code shared by every page: translations, language, theme, analytics, database calls.
   Pages load i18n.js, then this file, then their own script. A page can define
   onLangChange(t) to update its own content when the language changes. */

/* ---------------------------------------------------------------
   ANALYTICS (anonymous, no cookies, no registration) – Plausible.
   Never send e-mail addresses or other personal data here.
---------------------------------------------------------------- */
const LANGS = ["fr", "de", "it", "en"];
const BROWSER_LANG = (navigator.language || "").slice(0, 2).toLowerCase() || "unknown";
function track(name, props) {
  try { if (typeof window.plausible === "function") window.plausible(name, { props }); } catch (e) {}
}

/* ---------------------------------------------------------------
   DATABASE (Supabase). The publishable key is meant to be public:
   Row Level Security only lets it read published opportunities and
   call the two visitor-form functions (subscribe_alert, suggest_event).
---------------------------------------------------------------- */
/* ---------------------------------------------------------------
   CONTACT. Leave empty until the AllezHopp mailbox exists; every element with
   data-contact then points visitors to the suggestion form. Set it once, e.g.
   const CONTACT_EMAIL = "hello@allezhopp.ch";  and all pages show the address.
---------------------------------------------------------------- */
const CONTACT_EMAIL = "hello@allezhopp.ch";

const SUPABASE_URL = "https://rnwecpchtrzkbrnkdhvt.supabase.co";
const SUPABASE_KEY = "sb_publishable_6Q8Q7x40ZbCXVplznFJ0hw_TAh4R7fr";

/* Calls a Supabase database function. Errors come back as HTTP 400 with { message: "invalid_email" } etc. */
async function callRpc(fn, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body)
  });
  if (res.ok) return;
  let code = "send_failed";
  try { code = (await res.json()).message || code; } catch (e) {}
  throw new Error(code);
}
function showMsg(el, text, isErr) { el.textContent = text; el.classList.toggle("err", !!isErr); el.hidden = false; }
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

const LOCALE = { fr: "fr-CH", de: "de-CH", it: "it-CH", en: "en-GB" };
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ---------- Site navigation ----------
   The home page has the navigation in its HTML; other pages (many are generated) get the same links here,
   so the header is the same everywhere without editing every page. On phones the links sit behind a menu button. */
(function initNav() {
  const top = document.querySelector("header.top");
  if (!top) return;
  let nav = top.querySelector(".nav");
  if (!nav) {
    nav = document.createElement("nav");
    nav.className = "nav"; nav.id = "site-nav"; nav.dataset.i18nAria = "navLabel"; nav.setAttribute("aria-label", "Navigation");
    nav.innerHTML = '<a href="/" data-nav="home" data-i18n="navEvents">Événements</a>'
      + '<a href="/a-propos/" data-nav="about" data-i18n="abLink">À propos</a>'
      + '<a href="/proposer/" data-nav="organizers" data-i18n="navOrg">Organisateurs</a>';
    top.querySelector(".brand").after(nav);
  }
  let btn = top.querySelector(".nav-toggle");
  if (!btn) {
    btn = document.createElement("button");
    btn.type = "button"; btn.className = "nav-toggle"; btn.dataset.i18nLabel = "navMenu";
    btn.setAttribute("aria-label", "Menu"); btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "site-nav");
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path class="l1" d="M4 7h16"/><path class="l2" d="M4 12h16"/><path class="l3" d="M4 17h16"/></svg>';
    top.appendChild(btn);
  }
  /* Current section: event pages belong to "Events", the suggestion page to "Organizers". */
  const path = location.pathname;
  const here = path === "/" || path === "/index.html" || path.startsWith("/evenements/") ? "home"
    : path.startsWith("/a-propos") ? "about" : path.startsWith("/proposer") ? "organizers" : "";
  nav.querySelectorAll("a").forEach(a => {
    const on = a.dataset.nav === here;
    a.classList.toggle("is-current", on);
    if (on && (a.getAttribute("href") === path)) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  const setOpen = open => { top.classList.toggle("menu-open", open); btn.setAttribute("aria-expanded", String(open)); };
  btn.addEventListener("click", () => setOpen(btn.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && top.classList.contains("menu-open")) { setOpen(false); btn.focus(); } });
  document.addEventListener("click", e => { if (top.classList.contains("menu-open") && !top.contains(e.target)) setOpen(false); });
  nav.addEventListener("click", e => { if (e.target.closest("a")) setOpen(false); });
})();

/* ---------- Language ---------- */
let lang = "fr";
function setLang(l) {
  lang = l;
  const t = T[l];
  document.documentElement.lang = l;
  document.querySelectorAll("[data-i18n]").forEach(el => { const v = t[el.dataset.i18n]; if (typeof v === "string") el.textContent = v; });
  document.querySelectorAll("[data-i18n-html]").forEach(el => { const v = t[el.dataset.i18nHtml]; if (typeof v === "string") el.innerHTML = v; });
  document.querySelectorAll("[data-contact]").forEach(el => {
    el.innerHTML = CONTACT_EMAIL ? t.contactEmail.replace(/\{email\}/g, esc(CONTACT_EMAIL)) : t.contactForm;
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(el => { const v = t[el.dataset.i18nPh]; if (typeof v === "string") el.placeholder = v; });
  document.querySelectorAll("[data-i18n-aria]").forEach(el => { const v = t[el.dataset.i18nAria]; if (typeof v === "string") el.setAttribute("aria-label", v); });
  document.querySelectorAll(".nav-toggle[data-i18n-label]").forEach(el => { const v = t[el.dataset.i18nLabel]; if (typeof v === "string") el.setAttribute("aria-label", v); });
  const titleKey = document.body.dataset.titleKey;
  if (titleKey && t[titleKey]) document.title = t[titleKey];
  document.querySelectorAll("#theme-switch [data-tlabel]").forEach(b => { b.setAttribute("aria-label", t[b.dataset.tlabel]); b.title = t[b.dataset.tlabel]; });
  $("#theme-switch").setAttribute("aria-label", t.themeGroup);
  $("#lang-select").value = l;
  if (typeof window.onLangChange === "function") window.onLangChange(t);
  try { localStorage.setItem("allezhopp-lang", l); } catch (e) {}
}
$("#lang-select").addEventListener("change", e => {
  const from = lang;
  setLang(e.target.value);
  track("Language", { language: lang, source: "switch", previous: from, browser_language: BROWSER_LANG });
});
/* Picks the saved language, else the browser's, else French. Returns how it was chosen. */
function initLang() {
  let l = null, source = "default";
  try { l = localStorage.getItem("allezhopp-lang"); } catch (e) {}
  if (LANGS.includes(l)) source = "saved";
  else if (LANGS.includes(BROWSER_LANG)) { l = BROWSER_LANG; source = "browser"; }
  else l = "fr";
  setLang(l);
  return { language: l, source };
}

/* ---------- Theme: Auto (follows the device), Light or Dark ---------- */
const root = document.documentElement;
function setTheme(v, save) {
  if (v === "auto") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", v);
  document.querySelectorAll("#theme-switch button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.themeopt === v)));
  if (save) { try { localStorage.setItem("allezhopp-theme", v); } catch (e) {} }
}
document.querySelectorAll("#theme-switch button").forEach(b => b.addEventListener("click", () => setTheme(b.dataset.themeopt, true)));
(function () {
  let v = null;
  try { v = localStorage.getItem("allezhopp-theme"); } catch (e) {}
  setTheme(v === "light" || v === "dark" ? v : "auto", false);
})();


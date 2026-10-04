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
const CONTACT_EMAIL = "";

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


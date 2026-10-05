/* AllezHopp – event pages (/evenements/<event>/) and the event directory (/evenements/).
   The pages are generated as static French HTML (operations/site/build_event_pages.py in the app repository).
   This script shows them in the visitor's language and, on an event page, replaces the status with the live one
   from the database, so the page never shows a stale "open". */

/* Partner programmes (affiliate links). Leave an id empty and the link stays a plain external link.
   When an id is set, the link carries it and is labelled as a partner link (plan B5). */
const PARTNERS = { booking: { param: "aid", id: "" } };

const EV = (() => { const el = document.getElementById("ev-data"); return el ? JSON.parse(el.textContent) : null; })();
let LIVE = null;           // live row from the database; { gone: true } when the edition is no longer listed
const ST_ICON = { open: "i-check", partially_full: "i-half", not_open: "i-clock", closed: "i-lock", finished: "i-flag", unknown: "i-clock" };
const locName = n => (typeof PLACE_NAMES !== "undefined" && PLACE_NAMES[n] && PLACE_NAMES[n][lang]) || n;
const ok = u => typeof u === "string" && /^https:\/\//.test(u);

function fmtRange(a, b, prec) {
  const t = T[lang];
  if (!a) return t.datesTbc;
  const z = { timeZone: "UTC" };
  const d1 = new Date(a + "T12:00:00Z"), d2 = new Date((b || a) + "T12:00:00Z");
  if (prec === "month") return new Intl.DateTimeFormat(LOCALE[lang], { month: "long", year: "numeric", ...z }).format(d1);
  const f = new Intl.DateTimeFormat(LOCALE[lang], { day: "numeric", month: "short", year: "numeric", ...z });
  const s = (!b || b === a) ? f.format(d1) : (typeof f.formatRange === "function" ? f.formatRange(d1, d2) : f.format(d1) + " – " + f.format(d2));
  return prec === "approximate" ? t.approx + " " + s : s;
}
function placeText(town, area, canton) {
  return area === "canton" ? `${T[lang].wholeCanton} · ${canton}` : `${locName(town)} · ${canton}`;
}

function renderStatic() {
  const t = T[lang];
  document.querySelectorAll(".dt").forEach(el => { el.textContent = fmtRange(el.dataset.start, el.dataset.end, el.dataset.prec); });
  document.querySelectorAll(".town").forEach(el => {
    el.textContent = placeText(el.dataset.town, el.dataset.area ?? (EV && EV.area), el.dataset.canton || (EV && EV.canton));
  });
  document.querySelectorAll("[data-canton]").forEach(el => {
    if (el.classList.contains("crumb-canton") || el.classList.contains("canton-name")) el.textContent = t.cantons[el.dataset.canton] || el.dataset.canton;
  });
  document.querySelectorAll(".age").forEach(el => { el.textContent = t.age(el.dataset.age); });
  document.querySelectorAll("[data-rec]").forEach(el => { el.textContent = t.rec[el.dataset.rec] || el.textContent; });
  document.querySelectorAll(".credit [data-i18n='imgCredit']").forEach(el => { el.textContent = t.imgCredit; });
}

/* ---------- event page ---------- */
function status() {
  if (LIVE && LIVE.gone) return "unknown";
  const s = LIVE ? LIVE.display_status : EV.status;
  return T[lang].st[s] && s !== "finished" ? s : "unknown";
}
function renderEvent() {
  const t = T[lang], st = status();
  document.title = t.evTitle(EV.name);
  $("#ev-where").textContent = placeText(EV.municipality, EV.area, EV.canton);
  const badge = $("#ev-status");
  badge.className = "status " + st;
  badge.innerHTML = `<svg><use href="#${ST_ICON[st]}"/></svg><span>${esc(t.st[st])}</span>`;
  $("#ev-status-text").textContent = LIVE && LIVE.gone ? t.evNotListed : (t.evStText[st] || t.evStText.unknown);
  const verified = (LIVE && !LIVE.gone && LIVE.last_verified_at) || EV.verified_at;
  $("#ev-verified").innerHTML = verified ? `<svg><use href="#i-check"/></svg><span>${esc(t.verified(fmtRange(verified.slice(0, 10))))}</span>` : "";
  // actions
  const app = (LIVE && !LIVE.gone && ok(LIVE.application_url) && LIVE.application_url) || (ok(EV.application_url) && EV.application_url) || null;
  const site = (ok(EV.event_url) && EV.event_url) || app;
  const a = [];
  if ((st === "open" || st === "partially_full") && app && !(LIVE && LIVE.gone))
    a.push(`<a class="btn btn-primary act-apply" href="${esc(app)}" target="_blank" rel="noopener">${esc(t.apply)} ↗</a>`);
  else if (site) a.push(`<a class="btn btn-soft" href="${esc(site)}" target="_blank" rel="noopener">${esc(t.siteLink)} ↗</a>`);
  if (st !== "open" && st !== "partially_full") a.push(`<a class="btn btn-soft" href="/#alertes">${esc(t.notify)}</a>`);
  a.push(`<button type="button" class="btn btn-ghost act-share"><svg aria-hidden="true"><use href="#i-share"/></svg><span>${esc(t.evShare)}</span></button>`);
  if (calDates()) a.push(`<button type="button" class="btn btn-ghost act-cal"><svg aria-hidden="true"><use href="#i-plus"/></svg><span>${esc(t.evCal)}</span></button>`);
  $("#ev-actions").innerHTML = a.join("");
  // summary
  const est = EV.date_precision === "approximate";
  $("#ev-summary").textContent = t.evSummary({
    name: EV.name, noun: t.evNoun[EV.category], wide: EV.area === "canton", town: locName(EV.municipality), canton: EV.canton,
    cantonName: t.cantons[EV.canton] || EV.canton, dates: EV.start ? fmtRange(EV.start, EV.end, EV.date_precision) : "", est, org: EV.organizer
  });
  // accommodation link: town in the visitor's language, partner id when configured
  document.querySelectorAll(".stay a").forEach(link => {
    const li = link.closest(".stay"), p = PARTNERS.booking;
    const u = new URL(link.href);
    if (p.id) u.searchParams.set(p.param, p.id);
    link.href = u.toString();
    link.innerHTML = `<span>${esc(t.evStay)}</span> (${esc(locName(li.dataset.town))}) ↗`;
    if (p.id) link.title = t.evPartner;
  });
  if (PARTNERS.booking.id && document.querySelector(".stay")) $("#ev-extra-note").textContent = t.evPartner;
}

/* Dates for the calendar file: volunteer dates when known, else event dates; only exact days. */
function calDates() {
  const row = LIVE && !LIVE.gone ? LIVE : null;
  const ds = (row && row.duty_start) || EV.duty_start, de = (row && row.duty_end) || EV.duty_end;
  if (ds) return [ds, de || ds];
  if (EV.start && EV.date_precision === "day") return [EV.start, EV.end || EV.start];
  return null;
}
function downloadIcs() {
  const [a, b] = calDates();
  const day = s => s.replace(/-/g, "");
  const next = s => { const d = new Date(s + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); };
  const txt = s => String(s).replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
  const place = [EV.venue !== EV.municipality ? EV.venue : "", EV.municipality, "Suisse"].filter(Boolean).join(", ");
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//AllezHopp//allezhopp.ch//FR", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
    `UID:${EV.campaign_id}@allezhopp.ch`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART;VALUE=DATE:${day(a)}`, `DTEND;VALUE=DATE:${day(next(b))}`, `SUMMARY:${txt(EV.name)}`, `LOCATION:${txt(place)}`,
    `URL:${EV.url}`, `DESCRIPTION:${txt(EV.url)}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  link.download = EV.url.split("/").filter(Boolean).pop() + ".ics";
  document.body.appendChild(link); link.click(); link.remove();
}
async function share(btn) {
  const t = T[lang];
  try {
    if (navigator.share) { await navigator.share({ title: EV.name, url: EV.url }); return; }
    await navigator.clipboard.writeText(EV.url);
    const span = btn.querySelector("span"), was = span.textContent;
    span.textContent = t.evCopied; setTimeout(() => { span.textContent = was; }, 2000);
  } catch (e) {}
}
async function loadLive() {
  try {
    const sel = "campaign_id,display_status,last_verified_at,application_url,announced_opening,duty_start,duty_end";
    const res = await fetch(`${SUPABASE_URL}/rest/v1/current_opportunities?select=${sel}&event_id=eq.${EV.event_id}`,
      { headers: { apikey: SUPABASE_KEY, Accept: "application/json" } });
    if (!res.ok) return;
    const rows = await res.json();
    LIVE = rows.find(r => r.campaign_id === EV.campaign_id) || rows[0] || { gone: true };
    renderEvent();
  } catch (e) {}
}

document.addEventListener("click", e => {
  const ap = e.target.closest(".act-apply");
  if (ap) track("Apply click", { language: lang, category: EV.category, canton: EV.canton, page: "event" });
  if (e.target.closest(".act-share")) { share(e.target.closest(".act-share")); track("Event page action", { action: "share" }); }
  if (e.target.closest(".act-cal")) { downloadIcs(); track("Event page action", { action: "calendar" }); }
  const ext = e.target.closest("[data-act]");
  if (ext) track("Event page action", { action: ext.dataset.act });
  const mapBtn = e.target.closest(".ev-map-btn");
  if (mapBtn) {
    const box = mapBtn.closest(".ev-map"), lat = +box.dataset.lat, lon = +box.dataset.lon, dx = 0.035, dy = 0.022;
    box.innerHTML = `<iframe title="OpenStreetMap" loading="lazy" referrerpolicy="no-referrer"
      src="https://www.openstreetmap.org/export/embed.html?bbox=${lon - dx}%2C${lat - dy}%2C${lon + dx}%2C${lat + dy}&amp;layer=mapnik&amp;marker=${lat}%2C${lon}"></iframe>`;
    track("Event page action", { action: "map" });
  }
});

/* A picture that fails to load (moved, blocked by the host) gives way to the category tile. */
document.addEventListener("error", e => {
  const img = e.target;
  if (img.tagName !== "IMG" || !img.closest(".card-media")) return;
  const box = img.closest(".card-media");
  box.classList.remove("has-img", "contain", "dark");
  box.querySelectorAll("img, .credit").forEach(n => n.remove());
}, true);
document.querySelectorAll(".card-media img").forEach(img => {
  if (img.complete && img.naturalWidth === 0) img.dispatchEvent(new Event("error"));   // failed before this script loaded
});

/* ---------- directory page ---------- */
function renderIndex() {
  const t = T[lang], c = $("#idx-count");
  if (!c) return;
  c.textContent = t.evIdxCount(+c.dataset.n);
  $("#idx-jump").innerHTML = [...document.querySelectorAll(".idx-canton")]
    .map(s => `<a href="#${s.id}">${esc(t.cantons[s.id] || s.id)} <span>${s.querySelectorAll("li").length}</span></a>`).join("");
}

function onLangChange() {
  renderStatic();
  if (EV) renderEvent(); else renderIndex();
}
initLang();
if (EV) loadLive();

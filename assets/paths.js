/* AllezHopp – page addresses in each language. Shared by the browser (common.js) and the build
   (operations/site/build_languages.mjs and build_llm_files.py in the app repository, which read the JSON below).
   Every page exists in four languages: /fr/…, /de/…, /it/…, /en/… with the section names below; event pages keep
   the same address name (slug) in every language, e.g. /fr/evenements/paleo-festival-nyon/ = /de/veranstaltungen/paleo-festival-nyon/.
   Keep the object below valid JSON (double quotes, no trailing commas): the build parses it. */
const PATHS = {
  "home":    { "fr": "",                "de": "",                "it": "",          "en": "" },
  "events":  { "fr": "evenements",      "de": "veranstaltungen", "it": "eventi",    "en": "events" },
  "about":   { "fr": "a-propos",        "de": "ueber-uns",       "it": "chi-siamo", "en": "about" },
  "suggest": { "fr": "proposer",        "de": "vorschlagen",     "it": "proponi",   "en": "suggest" },
  "privacy": { "fr": "confidentialite", "de": "datenschutz",     "it": "privacy",   "en": "privacy" }
};
const PAGE_LANGS = ["fr", "de", "it", "en"];

/* Section of a site path ("/de/ueber-uns/" -> "about"), or null when it is not a language page (assets, /alertes/…). */
function pathSection(path) {
  const segs = path.split(/[?#]/)[0].split("/").filter(Boolean);
  if (PAGE_LANGS.includes(segs[0])) segs.shift();
  if (!segs.length) return "home";
  for (const s in PATHS) if (Object.values(PATHS[s]).includes(segs[0])) return s;
  return null;
}

/* The same page in language l: localPath("/evenements/x/#a", "de") -> "/de/veranstaltungen/x/#a".
   Accepts the old French addresses (/a-propos/) and any language's address; leaves other paths unchanged. */
function localPath(path, l) {
  if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//")) return path;
  const m = path.match(/^([^?#]*)(.*)$/), tail = m[2];
  const segs = m[1].split("/").filter(Boolean);
  if (PAGE_LANGS.includes(segs[0])) segs.shift();
  let section = "home";
  if (segs.length) {
    section = null;
    for (const s in PATHS) if (s !== "home" && Object.values(PATHS[s]).includes(segs[0])) section = s;
    if (!section) return path;
    segs[0] = PATHS[section][l];
  }
  return "/" + [l, ...segs].join("/") + "/" + tail;
}

if (typeof module !== "undefined") module.exports = { PATHS, PAGE_LANGS, pathSection, localPath };

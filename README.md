# allezhopp-site

Public website of AllezHopp, served by GitHub Pages at https://allezhopp.ch.

## One address per language (since 25 Nov 2026)

Every page exists in French, German, Italian and English, each at its own address, so search engines index all four:

| Page | French | German | Italian | English |
|---|---|---|---|---|
| Home | `/fr/` | `/de/` | `/it/` | `/en/` |
| All events, event pages | `/fr/evenements/<event>/` | `/de/veranstaltungen/<event>/` | `/it/eventi/<event>/` | `/en/events/<event>/` |
| About | `/fr/a-propos/` | `/de/ueber-uns/` | `/it/chi-siamo/` | `/en/about/` |
| Suggest an event | `/fr/proposer/` | `/de/vorschlagen/` | `/it/proponi/` | `/en/suggest/` |
| Privacy and terms | `/fr/confidentialite/` | `/de/datenschutz/` | `/it/privacy/` | `/en/privacy/` |

- **Edit the French page** (`fr/…/index.html`) and the texts in `assets/i18n*.js`. The German, Italian and English pages are
  **generated** from them by `operations/site/build_languages.mjs` in the app repository (`horesh-ben/allezhopp`): every
  night, after every data change, or by hand (`node operations/site/build_languages.mjs ../allezhopp-site`). Do not edit
  `de/`, `it/`, `en/` by hand. The build also refreshes the French pages' language links and texts.
- Each page lists its four versions (`<link rel="alternate" hreflang>`); `sitemap.xml` lists all of them.
- The page's language comes from its address. The language menu opens the same page in the other language and remembers
  the choice. Section names per language: `assets/paths.js`.
- `/` (the root) sends visitors to their language: the one they chose before, else their browser's, else French.
- The old addresses (`/a-propos/`, `/proposer/`, `/confidentialite/`, `/evenements/…`) are small redirect pages, so
  links shared before keep working. Generated too; do not edit.
- `alertes/…`, `ne-pas-compter/` and `404.html` stay single pages that switch language in place (e-mails link to them).

## Files

| Path | What it is |
|---|---|
| `fr/index.html` | Home page (French original): live list of volunteer opportunities and the alert sign-up |
| `fr/a-propos/index.html` | About page; its header and footer are reused by the generated event pages |
| `fr/confidentialite/index.html` | Privacy and terms of use; text in `assets/i18n-legal.js` |
| `fr/proposer/index.html` | "Un événement manque ?" page to suggest a missing event |
| `fr/evenements/` | Event pages and the directory, generated from the data (app repository) |
| `de/`, `it/`, `en/` | Generated language versions |
| `assets/site.css` | Styles shared by all pages (warm palette, evening-navy photo band and dark theme, Hanken Grotesk, light/dark) |
| `assets/hero/` | Home-page illustration (retro Swiss poster style, supplied 10 Oct 2026; illustrative, not a real event), 1942 × 809, in WebP sizes 640/960/1440/1942 and a 1440 JPEG fallback |
| `assets/i18n.js` | Interface text in French, German, Italian and English (also `i18n-event.js`, `i18n-legal.js`, `i18n-alerts.js`) |
| `assets/paths.js` | Page addresses in each language (used by the browser and the build) |
| `assets/common.js` | Shared code: navigation (added to generated pages that lack it), language, theme, Umami events, Supabase calls |

When you change a shared file, raise the `?v=` number in the `<script>`/`<link>` tags of the French pages (and in
`operations/site/templates/` of the app repository for event pages) so browsers fetch the new version.

**Contact address:** set `CONTACT_EMAIL` in `assets/common.js` (for example `"hello@allezhopp.ch"`) and raise the `?v=` numbers; every "write to us" line switches from the suggestion form to the address.

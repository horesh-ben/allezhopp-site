# allezhopp-site

Public website of AllezHopp, served by GitHub Pages at https://allezhopp.ch.

| Path | What it is |
|---|---|
| `index.html` | Home page: live list of volunteer opportunities and the alert sign-up |
| `a-propos/index.html` | About page (allezhopp.ch/a-propos/) |
| `confidentialite/index.html` | Privacy and terms of use (allezhopp.ch/confidentialite/); text in `assets/i18n-legal.js` |
| `proposer/index.html` | "Un événement manque ?" page (allezhopp.ch/proposer/) to suggest a missing event |
| `assets/site.css` | Styles shared by all pages (warm palette, evening-navy photo band and dark theme, Hanken Grotesk, light/dark) |
| `assets/hero/` | Home-page illustration (retro Swiss poster style, supplied 10 Oct 2026; illustrative, not a real event), 1942 × 809, in WebP sizes 640/960/1440/1942 and a 1440 JPEG fallback |
| `assets/i18n.js` | Interface text in French, German, Italian and English |
| `assets/common.js` | Shared code: navigation (added to generated pages that lack it), language, theme, Plausible events, Supabase calls |

When you change a shared file, raise the `?v=` number in the `<script>`/`<link>` tags of both pages so browsers fetch the new version.

**Contact address:** set `CONTACT_EMAIL` in `assets/common.js` (for example `"hello@allezhopp.ch"`) and raise the `?v=` numbers; every "write to us" line switches from the suggestion form to the address.

/* AllezHopp – the two pages linked from alert e-mails.
   /alertes/confirmer/#t=<token>&l=<lang>            → confirm_alert(token)
   /alertes/desabonner/#s=<id>&k=<signature>&l=<lang> → unsubscribe_alert(id, signature)
   The link data sits after "#", so it never reaches a server log or the statistics. Nothing happens
   until the visitor clicks the button: mail scanners that open links must not confirm or unsubscribe. */
(function () {
  const mode = document.body.dataset.mode;                    // "confirm" or "unsubscribe"
  const P = new URLSearchParams(location.hash.slice(1));
  initLang();
  if (LANGS.includes(P.get("l"))) setLang(P.get("l"));        // the language chosen for the e-mails

  const pre = mode === "confirm" ? "cf" : "us";
  const valid = mode === "confirm"
    ? /^[0-9a-f]{48}$/.test(P.get("t") || "")
    : /^[0-9a-f-]{36}$/.test(P.get("s") || "") && /^[0-9a-f]{32}$/.test(P.get("k") || "");

  let state = "ask";                                          // ask → done | bad
  function show(next) {
    state = next;
    const t = T[lang];
    const key = { ask: pre + "Title", done: pre + "DoneTitle", bad: pre + "BadTitle" }[state];
    const txt = { ask: pre + "Text", done: pre + "DoneText", bad: pre + "BadText" }[state];
    $("#al-title").textContent = t[key]; $("#al-title").dataset.i18n = key;
    $("#al-text").textContent = t[txt]; $("#al-text").dataset.i18n = txt;
    $("#al-actions").hidden = state !== "ask";
    $("#al-after").hidden = state === "ask";
    $("#al-signup").hidden = !(state === "bad" && mode === "confirm");
    if (state !== "ask") history.replaceState(null, "", location.pathname);   // drop the token from the address bar
  }

  async function rpc(fn, body) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error("send_failed");
    return res.json();
  }

  $("#al-btn").addEventListener("click", async () => {
    const btn = $("#al-btn"), msg = $("#al-msg");
    btn.disabled = true; btn.textContent = T[lang].working; msg.hidden = true;
    try {
      const r = mode === "confirm"
        ? await rpc("confirm_alert", { p_token: P.get("t") })
        : await rpc("unsubscribe_alert", { p_subscriber: P.get("s"), p_sig: P.get("k") });
      show(r && r.ok ? "done" : "bad");
      track(mode === "confirm" ? "Alert confirmed" : "Alert unsubscribed", { language: lang, result: r && r.ok ? "ok" : "invalid link" });
    } catch (e) {
      showMsg(msg, T[lang].errSend, true);
    } finally {
      btn.disabled = false; btn.textContent = T[lang][pre + "Btn"];
    }
  });

  window.onLangChange = () => { if (state) show(state); };
  show(valid ? "ask" : "bad");
})();

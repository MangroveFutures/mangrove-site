/* Shared by every page of the next site. The accessibility kit (design/library/components/a11y-kit.html) comes first; page behaviour after. */
(() => { const d = document.documentElement; try { const m = localStorage.getItem('mg-theme'); if (m === 'light' || m === 'dark') d.setAttribute('data-theme', m); } catch (e) {} d.classList.replace('no-js', 'js'); })();
/* The kit offers easier fonts. Every request stays on this site: no Google Fonts. */
window.libA11yConfig = { fonts: {
  atkinson: { name: 'Atkinson Hyperlegible', family: '"Atkinson Hyperlegible Next","Atkinson Hyperlegible",system-ui,sans-serif', css: null, local: true },
  lexend: { name: 'Lexend', family: '"Lexend",system-ui,sans-serif', css: null, local: true }
} };
/* Accessibility kit v1, head block (design/library/components/a11y-kit.html).
   Runs before first paint: reads the saved choices and sets attributes on <html>, so the page never
   flashes in the wrong size, theme or motion. The js block reads window.libA11yBoot. */
(() => {
  if (window.libA11yBoot) return;
  const KEY = 'lib-a11y-v1', root = document.documentElement;
  const DEFAULTS = { text: 'default', spacing: 'default', font: 'app', theme: 'app', contrast: 'system',
    motion: 'system', longer: false, voice: false, shortcuts: true, rate: 1 };
  const cfg = window.libA11yConfig || {};
  const FONTS = Object.assign({
    atkinson: { name: 'Atkinson Hyperlegible', family: '"Atkinson Hyperlegible Next","Atkinson Hyperlegible",system-ui,sans-serif',
      css: 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@400..700&display=swap' },
    lexend: { name: 'Lexend', family: '"Lexend",system-ui,sans-serif',
      css: 'https://fonts.googleapis.com/css2?family=Lexend:wght@300..700&display=swap' },
    opendyslexic: { name: 'OpenDyslexic', family: '"OpenDyslexic","OpenDyslexic Regular","OpenDyslexic3",system-ui,sans-serif', css: null, local: true },
  }, cfg.fonts || {});
  const mq = (q) => { try { return window.matchMedia(q).matches; } catch (e) { return false; } };
  const read = () => { try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { return Object.assign({}, DEFAULTS); } };
  const write = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); return true; } catch (e) { return false; } };
  const pageTheme = root.getAttribute('data-theme');   // what the page set itself, restored on "as designed"
  const loaded = {};
  const loadFont = (id) => {
    const f = FONTS[id]; if (!f || !f.css || loaded[id]) return;
    loaded[id] = true;
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = f.css; l.dataset.libA11yFont = id;
    document.head.appendChild(l);
  };
  const resolve = (s) => ({
    contrastMore: s.contrast === 'more' || (s.contrast === 'system' && mq('(prefers-contrast: more)')),
    motionReduced: s.motion === 'reduce' || (s.motion === 'system' && mq('(prefers-reduced-motion: reduce)')),
    theme: s.theme === 'system' ? (mq('(prefers-color-scheme: dark)') ? 'dark' : 'light') : s.theme,
  });
  const apply = (s) => {
    const r = resolve(s);
    root.dataset.libText = s.text; root.dataset.libSpacing = s.spacing; root.dataset.libFont = s.font;
    root.dataset.libContrast = r.contrastMore ? 'more' : 'standard';
    root.dataset.libMotion = r.motionReduced ? 'reduce' : 'allow';
    root.dataset.libLongerText = s.longer ? 'on' : 'off';   // not data-lib-longer: that marks content
    if (r.theme === 'light' || r.theme === 'dark') root.setAttribute('data-theme', r.theme);
    else if (pageTheme) root.setAttribute('data-theme', pageTheme); else root.removeAttribute('data-theme');
    const f = FONTS[s.font];
    if (f) { root.style.setProperty('--lib-a11y-read-font', f.family); loadFont(s.font); }
    else root.style.removeProperty('--lib-a11y-read-font');
    return r;
  };
  const state = read();
  window.libA11yBoot = { KEY, DEFAULTS, FONTS, state, read, write, apply, resolve, mq, loadFont };
  if (root.dataset.libA11y !== 'off') apply(state);
})();
document.addEventListener('DOMContentLoaded', () => {
/* Accessibility kit v1, js block (design/library/components/a11y-kit.html). Builds the "Display and
   reading" control and its dialog, read aloud, voice input and the keyboard-shortcut hook.
   API: window.libA11y.open(), .get(), .set(key, value), .reset(), .on(fn), .shortcut({...}), .read(el).
   Opt out: <html data-lib-a11y="off"> (say why in the page's design record). */
(() => {
  const boot = window.libA11yBoot, root = document.documentElement;
  if (!boot || window.libA11y || root.dataset.libA11y === 'off') return;
  const cfg = window.libA11yConfig || {};
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let s = boot.read(), saved = true;
  const listeners = [];
  const synth = window.speechSynthesis, Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const themes = (root.dataset.libA11yThemes || '').includes('dark');

  /* Two live regions. A modal <dialog> makes everything outside it inert, and inert content leaves the
     accessibility tree, so a region in the body is not heard while the panel is open. One sits in the
     body (panel shut), one inside the panel (panel open); say() uses the one that can be heard. */
  const region = () => { const d = document.createElement('div'); d.className = 'lib-a11y lib-a11y-sr'; d.setAttribute('role', 'status'); d.setAttribute('aria-live', 'polite'); return d; };
  const live = region(); document.body.appendChild(live);
  let liveIn = null, panel = null;
  const say = (t) => { const r = panel && panel.open && liveIn ? liveIn : live; live.textContent = ''; if (liveIn) liveIn.textContent = ''; setTimeout(() => { r.textContent = t; }, 60); };

  /* Skip link, unless the page has one or opts out. */
  const main = $('main');
  if (main && root.dataset.libA11ySkip !== 'off' && !$$('a[href^="#"]').slice(0, 3).some((a) => /skip/i.test(a.textContent))) {
    if (!main.id) main.id = 'main';
    if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
    const a = document.createElement('a'); a.className = 'lib-a11y lib-a11y-skip'; a.href = '#' + main.id; a.textContent = 'Skip to content';
    document.body.prepend(a);
  }

  /* OpenDyslexic is used only if it is on this device, until a self-hosted copy has its intake (ORG-0008). */
  const hasLocal = (name) => { try { const c = document.createElement('canvas').getContext('2d'), t = 'mmmmmmmmmlli1WQ@';
    return ['monospace', 'serif'].some((b) => { c.font = `40px ${b}`; const w = c.measureText(t).width; c.font = `40px "${name}", ${b}`; return c.measureText(t).width !== w; }); } catch (e) { return false; } };
  const odOK = () => !!(boot.FONTS.opendyslexic && (boot.FONTS.opendyslexic.css || ['OpenDyslexic', 'OpenDyslexic Regular', 'OpenDyslexic3'].some(hasLocal)));

  const OPTS = {
    text: [['default', 'Default'], ['large', 'Large'], ['larger', 'Larger'], ['largest', 'Largest']],
    spacing: [['default', 'Default'], ['wide', 'Wide'], ['wider', 'Wider']],
    font: [['app', 'As designed'], ['atkinson', 'Atkinson Hyperlegible'], ['lexend', 'Lexend'], ['opendyslexic', 'OpenDyslexic']],
    theme: [['app', 'As designed'], ['light', 'Light'], ['dark', 'Dark'], ['system', 'Match my device']],
    contrast: [['system', 'Match my device'], ['more', 'More'], ['standard', 'Standard']],
    motion: [['system', 'Match my device'], ['reduce', 'Less'], ['allow', 'As designed']],
    rate: [['0.8', 'Slower'], ['1', 'Normal'], ['1.25', 'Faster']],
  };
  const NAMES = { text: 'Text size', spacing: 'Line and letter spacing', font: 'Font', theme: 'Theme', contrast: 'Contrast', motion: 'Motion', rate: 'Reading speed',
    longer: 'Longer explanations', voice: 'Speak instead of typing', shortcuts: 'Keyboard shortcuts' };
  const seg = (key, hint = '') => `<fieldset class="lib-a11y-set"><legend>${NAMES[key]}</legend><div class="lib-a11y-seg">${OPTS[key].map(([v, l]) =>
    `<label><input type="radio" name="lib-a11y-${key}" value="${v}"><span${key === 'font' && v !== 'app' ? ` style="font-family:${esc(boot.FONTS[v] ? boot.FONTS[v].family : 'inherit')}"` : ''}>${l}</span></label>`).join('')}</div>${hint ? `<p class="lib-a11y-hint" id="lib-a11y-h-${key}">${hint}</p>` : ''}</fieldset>`;
  const sw = (key, hint) => `<label class="lib-a11y-sw"><input type="checkbox" role="switch" name="lib-a11y-${key}" aria-describedby="lib-a11y-h-${key}"><span class="lib-a11y-track" aria-hidden="true"></span><b>${NAMES[key]}</b><small aria-hidden="true"></small></label><p class="lib-a11y-hint" id="lib-a11y-h-${key}">${hint}</p>`;

  /* Keyboard shortcuts: a hook any app can add to. Alt + Shift + a letter, so typing never sets one off
     (WCAG 2.2, 2.1.4), and the reader can turn them all off. */
  const shortcuts = [];
  const shortcut = (o) => { shortcuts.push(o); drawKeys(); return () => { shortcuts.splice(shortcuts.indexOf(o), 1); drawKeys(); }; };
  const keyText = (o) => ['Alt', 'Shift', o.key.toUpperCase()].join(' + ');

  panel = document.createElement('dialog');
  panel.className = 'lib-a11y lib-a11y-panel';
  panel.setAttribute('aria-labelledby', 'lib-a11y-title');
  panel.innerHTML = `<div class="lib-a11y-head"><div style="flex:1"><h2 id="lib-a11y-title" tabindex="-1">Display and reading</h2><p>Changes show at once and are kept on this device.</p></div><button type="button" class="lib-a11y-btn" data-k="close">Close</button></div>
  <div class="lib-a11y-groups">
   <section class="lib-a11y-group" aria-labelledby="lib-a11y-g1"><h3 id="lib-a11y-g1">Reading</h3>
    ${seg('text')}${seg('spacing')}
    ${seg('font', 'Atkinson Hyperlegible and Lexend are made to be easy to read. <span data-k="od-note"></span>')}
    ${sw('longer', 'Opens the fuller explanations that are folded away.')}</section>
   <section class="lib-a11y-group" aria-labelledby="lib-a11y-g2"><h3 id="lib-a11y-g2">Seeing</h3>
    ${themes ? seg('theme') : ''}${seg('contrast')}${seg('motion', 'Less stops animations and moving pictures.')}</section>
   <section class="lib-a11y-group" aria-labelledby="lib-a11y-g3"><h3 id="lib-a11y-g3">Listening and speaking</h3>
    <span class="lib-a11y-label">Read aloud</span>
    <div class="lib-a11y-row"><button type="button" class="lib-a11y-btn lib-a11y-main" data-k="read">Read this page aloud</button><button type="button" class="lib-a11y-btn" data-k="stop">Stop</button></div>
    ${seg('rate')}
    <p class="lib-a11y-hint" data-k="read-note">Select some text first to hear only that.</p>
    ${sw('voice', '')}</section>
   <section class="lib-a11y-group" aria-labelledby="lib-a11y-g4"><h3 id="lib-a11y-g4">Keyboard</h3>
    ${sw('shortcuts', 'All shortcuts use Alt and Shift with a letter.')}<dl class="lib-a11y-keys" data-k="keys"></dl></section>
  </div>
  <div class="lib-a11y-foot"><button type="button" class="lib-a11y-btn" data-k="reset">Reset all</button><button type="button" class="lib-a11y-btn lib-a11y-main" data-k="close">Done</button></div>`;
  document.body.appendChild(panel);
  liveIn = region(); panel.appendChild(liveIn);

  function drawKeys() {
    const dl = $('[data-k="keys"]', panel); if (!dl) return;
    dl.innerHTML = shortcuts.map((o) => `<dt><kbd>${esc(keyText(o))}</kbd></dt><dd>${esc(o.label)}</dd>`).join('');
  }

  /* Voice input, on this device only. Chrome's Web Speech recognition sends the sound to Google's servers
     unless on-device recognition is asked for, so the kit asks for it (processLocally) and never falls
     back to a server: no on-device speech, no Speak buttons (the same rule as epoch #694).
     voiceState: 'checking' | 'ready' | 'download' (a one-time speech pack) | 'none'. */
  const LANG = root.lang || 'en-GB', RECOPTS = { langs: [LANG], processLocally: true };
  const canLocal = !!(Rec && 'processLocally' in Rec.prototype && typeof Rec.available === 'function');
  let voiceState = canLocal ? 'checking' : 'none';
  const VOICE_HINT = {
    checking: 'Checking whether this browser can turn speech into text on this device.',
    ready: 'A Speak button appears under each text box. Speech is turned into text on this device; no sound is sent anywhere.',
    download: 'This browser can turn speech into text on this device after a one-time download of its speech pack. Turning this on starts the download; no sound is sent anywhere.',
    none: 'This browser cannot turn speech into text on this device, and we do not send your voice to a server, so this is off. Your phone keyboard’s microphone key works in any box.',
  };
  const voiceUI = () => {
    const i = $('[name="lib-a11y-voice"]', panel); if (!i) return;
    $('#lib-a11y-h-voice', panel).textContent = VOICE_HINT[voiceState];
    i.disabled = voiceState === 'none' || voiceState === 'checking';
  };
  const checkVoice = async () => {
    if (!canLocal) { voiceUI(); return; }
    try { const st = await Rec.available(RECOPTS); voiceState = st === 'available' ? 'ready' : (st === 'downloadable' || st === 'downloading') ? 'download' : 'none'; }
    catch (e) { voiceState = 'none'; }
    voiceUI(); mics(); sync();
  };
  /* Asked only when someone could use it (the panel opens, or voice was already on), not on every page
     load: the check wakes the browser's speech service, and Playwright's headless shell crashes on it. */
  let voiceAsked = false;
  const ensureVoice = () => { if (!voiceAsked) { voiceAsked = true; checkVoice(); } };
  const installVoice = async () => {
    say('Downloading speech for this device.');
    try { await Rec.install(RECOPTS); } catch (e) {}
    await checkVoice();
    say(voiceState === 'ready' ? 'Speech to text is ready on this device.' : 'Speech to text could not be set up on this device.');
  };
  voiceUI();
  if (!synth) { $$('[data-k="read"],[data-k="stop"]', panel).forEach((b) => { b.disabled = true; }); $('[data-k="read-note"]', panel).textContent = 'This browser cannot read aloud.'; }

  const sync = () => {
    Object.keys(OPTS).forEach((k) => $$(`[name="lib-a11y-${k}"]`, panel).forEach((i) => { i.checked = String(s[k]) === i.value; }));
    ['longer', 'voice', 'shortcuts'].forEach((k) => { const i = $(`[name="lib-a11y-${k}"]`, panel), on = !!s[k] && (k !== 'voice' || voiceState !== 'none');
      i.checked = on; i.closest('label').querySelector('small').textContent = on ? 'On' : 'Off'; });
    const od = $('[name="lib-a11y-font"][value="opendyslexic"]', panel), ok = odOK();
    od.disabled = !ok;
    $('[data-k="od-note"]', panel).innerHTML = ok ? 'OpenDyslexic is found on this device.' : 'OpenDyslexic works once it is installed on this device (<a href="https://opendyslexic.org" target="_blank" rel="noopener">opendyslexic.org</a>).';
  };
  const VALUE = (k, v) => (OPTS[k] ? (OPTS[k].find((o) => o[0] === String(v)) || [0, v])[1] : (v ? 'on' : 'off'));
  const set = (k, v, quiet) => {
    if (k === 'rate') v = Number(v);
    s[k] = v; boot.apply(s); saved = boot.write(s);
    if (k === 'longer') openLonger();
    if (k === 'voice') { if (v && voiceState === 'download') installVoice(); mics(); }
    sync();
    if (!quiet) say(`${NAMES[k] || k}: ${VALUE(k, v)}.${saved ? '' : ' This browser will not keep it after you leave.'}`);
    listeners.forEach((fn) => { try { fn(get()); } catch (e) {} });
    document.dispatchEvent(new CustomEvent('lib-a11y:change', { detail: get() }));
  };
  const get = () => Object.assign({}, s, boot.resolve(s));
  const openLonger = () => $$('details[data-lib-longer-open]').forEach((d) => { if (s.longer) d.open = true; });

  panel.addEventListener('change', (e) => {
    const i = e.target, k = (i.name || '').replace('lib-a11y-', '');
    if (!k) return;
    set(k, i.type === 'checkbox' ? i.checked : i.value);
  });

  /* Opening, closing, focus. A native modal dialog makes the page behind it inert; Tab also wraps
     inside it, Escape closes it, and focus goes back to the control that opened it. */
  let opener = null, giveBack = true;
  const open = (from) => {
    opener = from || document.activeElement; ensureVoice(); sync();
    Object.keys(boot.FONTS).forEach(boot.loadFont);   // so each font option shows in its own face
    if (!panel.open) panel.showModal();
    $('#lib-a11y-title', panel).focus();
  };
  const close = () => { if (panel.open) panel.close(); };
  panel.addEventListener('close', () => { if (giveBack && opener && opener.focus) opener.focus(); giveBack = true; });
  panel.addEventListener('click', (e) => {
    if (e.target === panel) return close();
    const b = e.target.closest('button[data-k]'); if (!b) return;
    if (b.dataset.k === 'close') close();
    if (b.dataset.k === 'reset') { s = Object.assign({}, boot.DEFAULTS); boot.apply(s); boot.write(s); stopReading(); mics(); sync(); say('Everything is back as designed.'); }
    if (b.dataset.k === 'read') { giveBack = false; close(); read(); }
    if (b.dataset.k === 'stop') stopReading();
  });
  panel.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = $$('button,input:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])', panel).filter((x) => x.offsetParent !== null || x.type === 'radio');
    const tabbable = f.filter((x) => x.type !== 'radio' || x.checked || !f.some((y) => y.name === x.name && y.checked));
    const first = tabbable[0], last = tabbable[tabbable.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === $('#lib-a11y-title', panel))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* The control: every [data-lib-a11y-open] on the page, or one small button of our own. */
  let openers = $$('[data-lib-a11y-open]');
  if (!openers.length && cfg.trigger !== false) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'lib-a11y lib-a11y-open lib-a11y-fab'; b.setAttribute('data-lib-a11y-open', '');
    b.setAttribute('aria-label', 'Display and reading');
    b.innerHTML = '<span class="lib-a11y-aa" aria-hidden="true">Aa</span>Display';
    document.body.appendChild(b); openers = [b];
  }
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-lib-a11y-open]'); if (b) { e.preventDefault(); open(b); } });
  openers.forEach((b) => { b.setAttribute('aria-haspopup', 'dialog'); });

  /* Read aloud, block by block, marking the block being read. */
  let queue = [], reading = null, readBar = null;
  const blocks = (scope) => {
    const sel = window.getSelection && String(window.getSelection()).trim();
    if (sel) return [{ el: null, text: sel }];
    const r = scope || $('main') || document.body;
    const cand = $$('h1,h2,h3,h4,h5,h6,p,li,dt,dd,figcaption,blockquote,th,td,summary,label', r)
      .filter((el) => !el.closest('.lib-a11y,[aria-hidden="true"],[hidden],script,style') && el.offsetParent !== null && el.textContent.trim());
    return cand.filter((el) => !cand.some((o) => o !== el && el.contains(o))).map((el) => ({ el, text: el.innerText.trim() }));
  };
  const bar = (cls, html) => { const b = document.createElement('div'); b.className = `lib-a11y lib-a11y-bar ${cls}`; b.setAttribute('role', 'status'); b.innerHTML = html; document.body.appendChild(b); return b; };
  const unmark = () => $$('.lib-a11y-reading').forEach((x) => x.classList.remove('lib-a11y-reading'));
  const next = () => {
    unmark();
    const item = queue.shift();
    if (!item) { stopReading(true); return; }
    if (item.el) { item.el.classList.add('lib-a11y-reading'); item.el.scrollIntoView({ block: 'center', behavior: get().motionReduced ? 'auto' : 'smooth' }); }
    const u = new SpeechSynthesisUtterance(item.text);
    u.lang = LANG; u.rate = Number(s.rate) || 1; u.voice = voice;
    u.onend = () => { if (reading === u) next(); };
    u.onerror = () => { if (reading === u) next(); };
    reading = u; synth.speak(u);
  };
  /* Only a voice on this device (localService). Chrome's "Google" voices are network voices: the text goes
     to Google's servers. Set the voice every time, so the browser's default never picks one of those. */
  let voice = null;
  const voices = () => new Promise((res) => { const v = synth.getVoices(); if (v.length) return res(v);
    const t = setTimeout(() => res(synth.getVoices()), 1500);
    synth.addEventListener('voiceschanged', () => { clearTimeout(t); res(synth.getVoices()); }, { once: true }); });
  const pickVoice = (vs) => { const l = vs.filter((x) => x.localService), two = LANG.slice(0, 2).toLowerCase();
    return l.find((x) => x.lang === LANG) || l.find((x) => (x.lang || '').toLowerCase().startsWith(two)) || null; };
  async function read(scope) {
    if (!synth) return;
    stopReading(true);
    queue = blocks(scope);
    if (!queue.length) { say('There is nothing to read here.'); if (opener && !panel.open) opener.focus(); return; }
    voice = pickVoice(await voices());
    if (!voice) { queue = []; say('This device has no voice for this language, and we do not send the page to a server, so it cannot read aloud.'); if (opener && !panel.open) opener.focus(); return; }
    readBar = bar('', '<p>Reading aloud</p><button type="button" data-k="pause">Pause</button><button type="button" data-k="stop">Stop</button>');
    readBar.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.k === 'stop') stopReading();
      if (b.dataset.k === 'pause') { if (synth.paused) { synth.resume(); b.textContent = 'Pause'; } else { synth.pause(); b.textContent = 'Carry on'; } }
    });
    $('[data-k="stop"]', readBar).focus();
    next();
  }
  function stopReading(quiet) {
    if (!synth) return;
    const was = !!reading; reading = null; queue = []; synth.cancel(); unmark();
    if (readBar) { const had = readBar.contains(document.activeElement); readBar.remove(); readBar = null; if (had && opener) opener.focus(); }
    if (was && !quiet) say('Stopped reading.');
  }

  /* Voice input: a Speak button under each text box while the setting is on, and the listening bar
     (the recording banner pattern) whenever the microphone is open. */
  const FIELDS = 'textarea, input:not([type]), input[type="text"], input[type="search"], input[type="email"], input[type="url"]';
  let rec = null, recBar = null, recBtn = null;
  const labelOf = (f) => { const l = (f.id && $(`label[for="${CSS.escape(f.id)}"]`)) || f.closest('label'); return (f.getAttribute('aria-label') || (l && l.textContent) || f.placeholder || 'this box').trim(); };
  function mics() {
    $$('.lib-a11y-mic').forEach((m) => m.remove());
    if (!s.voice || voiceState !== 'ready') return;
    $$(FIELDS).filter((f) => !f.closest('.lib-a11y,[data-lib-a11y-mic="off"]') && !f.disabled && !f.readOnly).forEach((f) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'lib-a11y lib-a11y-mic'; b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-label', `Speak into: ${labelOf(f)}`);
      b.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5a2.5 2.5 0 0 1 2.5 2.5v4a2.5 2.5 0 0 1-5 0V4A2.5 2.5 0 0 1 8 1.5ZM3.5 7.5a4.5 4.5 0 0 0 9 0M8 12v2.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>Speak';
      b.addEventListener('click', () => (rec && recBtn === b ? stopListening() : listen(f, b)));
      f.insertAdjacentElement('afterend', b);
    });
  }
  const insert = (f, text) => {
    const a = f.selectionStart ?? f.value.length, z = f.selectionEnd ?? f.value.length, pre = f.value.slice(0, a);
    const add = (pre && !/\s$/.test(pre) ? ' ' : '') + text;
    f.value = pre + add + f.value.slice(z); f.selectionStart = f.selectionEnd = a + add.length;
    f.dispatchEvent(new Event('input', { bubbles: true }));
  };
  function listen(f, b) {
    stopListening(true);
    if (voiceState !== 'ready') { say('Speech to text is not available on this device.'); return; }
    try { rec = new Rec(); rec.processLocally = true; } catch (e) { rec = null; say('Speech to text could not start in this browser.'); return; }
    if (rec.processLocally !== true) { rec = null; say('Speech to text is not available on this device.'); return; }   // never fall back to a server
    rec.lang = LANG; rec.interimResults = false; rec.continuous = false;
    recBtn = b; b.setAttribute('aria-pressed', 'true');
    recBar = bar('lib-a11y-rec', `<p>Listening for: ${esc(labelOf(f))}<small>Turned into text on this device. No sound is sent or kept.</small></p><button type="button">Stop listening</button>`);
    $('button', recBar).addEventListener('click', () => stopListening());
    rec.onresult = (e) => { const t = [...e.results].map((r) => r[0].transcript).join(' ').trim(); if (t) { insert(f, t); say(`Added: ${t}`); } };
    rec.onerror = (e) => { say(e.error === 'not-allowed' ? 'The microphone is blocked for this page.'
      : (e.error === 'language-not-supported' || e.error === 'service-not-allowed') ? 'Speech to text is not available on this device.' : 'Nothing was heard.'); };
    rec.onend = () => stopListening(true, f);
    try { rec.start(); } catch (e) { stopListening(true); }
  }
  function stopListening(quiet, back) {
    if (rec) { const r = rec; rec = null; try { r.stop(); } catch (e) {} }
    if (recBar) { recBar.remove(); recBar = null; }
    if (recBtn) { recBtn.setAttribute('aria-pressed', 'false'); recBtn = null; }
    if (back) back.focus();
    if (!quiet) say('Stopped listening.');
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (reading) stopReading(); if (rec) stopListening(); }
    if (!s.shortcuts || !e.altKey || !e.shiftKey || e.ctrlKey || e.metaKey) return;
    const o = shortcuts.find((x) => e.code === 'Key' + x.key.toUpperCase());
    if (o) { e.preventDefault(); o.run(e); }
  });
  shortcut({ key: 'a', label: 'Open Display and reading', run: () => open() });
  shortcut({ key: 'r', label: 'Read this page aloud (Escape stops)', run: () => (reading ? stopReading() : read()) });
  shortcut({ key: 'v', label: 'Speak into the box you are in', run: () => { const f = document.activeElement; if (f && f.matches && f.matches(FIELDS) && voiceState === 'ready') { if (!s.voice) set('voice', true); const b = f.nextElementSibling; if (b && b.classList.contains('lib-a11y-mic')) listen(f, b); } } });

  /* Follow the device when a setting says "match my device". */
  ['(prefers-contrast: more)', '(prefers-reduced-motion: reduce)', '(prefers-color-scheme: dark)'].forEach((q) => {
    try { window.matchMedia(q).addEventListener('change', () => { boot.apply(s); listeners.forEach((fn) => fn(get())); }); } catch (e) {}
  });

  openLonger(); mics(); sync(); drawKeys(); if (s.voice) ensureVoice(); else voiceUI();
  window.libA11y = { open, close, get, set: (k, v) => set(k, v), reset: () => $('[data-k="reset"]', panel).click(), on: (fn) => { listeners.push(fn); }, shortcut, read, stop: stopReading };
})();

/* ── Page behaviour. Plain JavaScript, no build step, no third-party request until a film is played. ── */
(() => {
  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mq = (q) => { try { return matchMedia(q).matches; } catch (e) { return false; } };
  const reduced = () => { const m = root.dataset.libMotion; return m ? m === 'reduce' : mq('(prefers-reduced-motion: reduce)'); };
  const css = (n) => getComputedStyle(root).getPropertyValue(n).trim();
  const NS = 'http://www.w3.org/2000/svg';
  const rng = (seed) => { let s = seed; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  const players = [];

  /* Theme switch (on = dark). The choice is kept on this device so every page agrees. */
  const atmos = $('#atmos');
  const label = () => atmos && atmos.setAttribute('aria-checked', root.getAttribute('data-theme') === 'light' ? 'false' : 'true');
  if (atmos) atmos.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next); try { localStorage.setItem('mg-theme', next); } catch (e) {} label();
  });
  label();

  /* Home: the flock lives in sky.html. Mirror theme and motion onto it, and rest it when the hero is out of view. */
  const sky = $('.hero iframe');
  let heroVisible = true;
  const syncSky = () => {
    if (!sky) return;
    const d = sky.contentDocument && sky.contentDocument.documentElement; if (!d) return;
    if (d.getAttribute('data-theme') !== root.getAttribute('data-theme')) d.setAttribute('data-theme', root.getAttribute('data-theme') || 'dark');
    const want = !heroVisible ? 'reduce' : (root.dataset.libMotion || null);
    if (want) { if (d.getAttribute('data-lib-motion') !== want) d.setAttribute('data-lib-motion', want); }
    else if (d.hasAttribute('data-lib-motion')) d.removeAttribute('data-lib-motion');
  };
  if (sky) {
    sky.addEventListener('load', syncSky);
    new IntersectionObserver((es) => { heroVisible = es[0].isIntersecting; syncSky(); }, { threshold: 0 }).observe($('.hero'));
  }

  /* Nav: keep the current stop in view on a phone. */
  const cur = $('.axis ol a[aria-current]');
  if (cur) { const ol = cur.closest('ol'); ol.scrollLeft = Math.max(0, cur.offsetLeft - 16); }

  /* ── The action-research loop: a lemniscate drawn in code; one runner goes round once when it comes into view. ── */
  const path = $('#loop-path'), runner = $('#loop-runner'), arrows = $('#loop-arrows');
  if (path) {
    const a = 400, cx = 480, cy = 175, P = [];
    for (let i = 0; i <= 120; i++) { const t = Math.PI * 2 * i / 120, d = 1 + Math.sin(t) ** 2; P.push([cx + a * Math.cos(t) / d, cy + a * Math.sin(t) * Math.cos(t) / d * 1.25]); }
    path.setAttribute('d', 'M' + P.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L') + 'Z');
    const L = path.getTotalLength();
    [.2, .45, .7, .95].forEach((f) => {
      const p = path.getPointAtLength(L * f), q = path.getPointAtLength(L * f + 2), ang = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
      const g = document.createElementNS(NS, 'path');
      g.setAttribute('d', 'M-7,-6 L5,0 L-7,6 Z'); g.setAttribute('class', 'arrow'); g.setAttribute('transform', `translate(${p.x.toFixed(1)},${p.y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
      arrows.appendChild(g);
    });
    const place = (f) => { const p = path.getPointAtLength(L * f); runner.setAttribute('cx', p.x); runner.setAttribute('cy', p.y); };
    place(.5);
    let ran = false;
    new IntersectionObserver((es) => {
      if (!es[0].isIntersecting || ran) return; ran = true;
      if (reduced()) return;
      const t0 = performance.now(), dur = 4800;
      const tick = (now) => { const k = Math.min(1, (now - t0) / dur), e = 1 - (1 - k) ** 3; place((.5 + e) % 1); if (k < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, { threshold: .5 }).observe(path.closest('svg'));
  }

  /* ── A still flock with its seven-nearest web, seeded so it never changes (Murmurations, Choreotope). ── */
  function drawFlocks() {
    $$('svg[data-flock]').forEach((svg) => {
      const r = rng(Number(svg.dataset.flock) || 7);
      const pts = []; for (let i = 0; i < 90; i++) { const t = r() * Math.PI * 2, rad = Math.sqrt(r()); pts.push([160 + Math.cos(t) * rad * 95 + Math.sin(i * .3) * 12, 92 + Math.sin(t) * rad * 42 + Math.cos(t * 2) * 10]); }
      let lines = '', dots = '';
      pts.forEach((p, i) => {
        const nn = pts.map((q, j) => [Math.hypot(q[0] - p[0], q[1] - p[1]), j]).sort((x, y) => x[0] - y[0]).slice(1, 8);
        nn.forEach(([, j]) => { if (j > i) lines += `M${p[0].toFixed(1)},${p[1].toFixed(1)}L${pts[j][0].toFixed(1)},${pts[j][1].toFixed(1)}`; });
        dots += `<path d="M${(p[0] - 2.4).toFixed(1)},${(p[1] + 1).toFixed(1)}q2.4,-2.2 2.4,-1 q0,-1.2 2.4,1" />`;
      });
      svg.innerHTML = `<path d="${lines}" stroke="${css('--ink')}" stroke-opacity=".16" stroke-width=".5" fill="none"/><g stroke="${css('--ink')}" stroke-width=".9" fill="none">${dots}</g><circle cx="248" cy="44" r="3" fill="${css('--falcon')}"/>`;
    });
  }
  drawFlocks();

  /* ── Vimeo, click to load. A slot with no film id shows its picture only. No request to Vimeo until play is pressed; dnt=1 asks it not to track. ── */
  $$('.frame[data-vimeo-id]').forEach((f) => {
    const id = f.dataset.vimeoId; if (!/^\d+$/.test(id)) return;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'facade';
    b.setAttribute('aria-label', `Play ${f.dataset.title || 'the film'}. Plays from Vimeo`);
    b.innerHTML = '<span class="play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3l16 9-16 9z" fill="currentColor"/></svg></span><span class="note">Plays from Vimeo</span>';
    b.addEventListener('click', () => {
      const ifr = document.createElement('iframe');
      ifr.src = `https://player.vimeo.com/video/${id}?dnt=1&autoplay=1&title=0&byline=0&portrait=0`;
      ifr.title = f.dataset.title || 'Film'; ifr.allow = 'autoplay; fullscreen; picture-in-picture'; ifr.allowFullscreen = true;
      f.replaceChildren(ifr); ifr.focus();
    });
    f.appendChild(b);
  });

  /* Pause for a looping picture (breathing). */
  $$('[data-pause]').forEach((b) => b.addEventListener('click', () => {
    const t = $(b.dataset.pause), off = t.classList.toggle('paused'); b.textContent = off ? 'Play' : 'Pause'; b.setAttribute('aria-pressed', String(off));
  }));

  /* ── A canvas player: sized for the screen, rests when off screen, paused by its button, still when motion is reduced. ── */
  function player(cv, btn, o) {
    const ctx = cv.getContext('2d'); let W = 0, H = 0, t = 0, last = 0, raf = 0, playing = true, vis = false;
    const paint = () => { ctx.clearRect(0, 0, W, H); o.draw(ctx, W, H, t, reduced()); };
    const size = () => {
      const r = cv.getBoundingClientRect(), D = Math.min(devicePixelRatio || 1, 2);
      W = Math.max(240, r.width); H = Math.max(160, r.height);
      cv.width = Math.round(W * D); cv.height = Math.round(H * D); ctx.setTransform(D, 0, 0, D, 0, 0);
      if (o.size) o.size(W, H); paint();
    };
    const loop = (now) => { raf = 0; const dt = Math.min(.1, (now - (last || now)) / 1000); last = now; t += dt; paint(); if (playing && vis && !reduced()) raf = requestAnimationFrame(loop); };
    const kick = () => { if (!raf && playing && vis && !reduced()) { last = 0; raf = requestAnimationFrame(loop); } };
    new IntersectionObserver((es) => { vis = es[0].isIntersecting; kick(); }, { threshold: .1 }).observe(cv);
    if (btn) btn.addEventListener('click', () => { playing = !playing; btn.textContent = playing ? 'Pause' : 'Play'; btn.setAttribute('aria-pressed', String(!playing)); if (playing) kick(); });
    let rs; addEventListener('resize', () => { clearTimeout(rs); rs = setTimeout(size, 150); });
    const p = { size, paint, kick, btn }; players.push(p); size(); if (btn) btn.hidden = reduced(); return p;
  }

  /* ── Loops that persist: seeded points arrive over a two-year timeline; points closer than a radius join; some groups close into
       loops. A loop that lasts is a long bar in the barcode. The page opens already populated and goes on evolving. ── */
  const ph = $('#ph');
  if (ph) {
    const CYCLE = 42, HOLD = 8, LEN = CYCLE + HOLD, T0 = .74 * CYCLE, T1 = .3 * CYCLE;
    let pts = [], loops = [], noise = [];
    const build = (W, H) => {
      const r = rng(20241001), phone = W < 520;
      const field = { x0: phone ? .08 : .05, x1: phone ? .92 : .66, y0: .08, y1: phone ? .62 : .78 };
      const fx = (u) => (field.x0 + u * (field.x1 - field.x0)) * W, fy = (v) => (field.y0 + v * (field.y1 - field.y0)) * H;
      const unit = Math.min(W * (field.x1 - field.x0), H * (field.y1 - field.y0));
      const centres = [[.22, .3, .16, .08], [.7, .26, .13, .22], [.45, .68, .2, .38], [.84, .7, .1, .55], [.18, .78, .09, .7], [.58, .42, .07, .82]];
      pts = []; loops = [];
      centres.forEach(([u, v, rr, born], k) => {
        const n = Math.round(14 + rr * 90), R = rr * unit;
        for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + r() * .2, j = 1 + (r() - .5) * .16; pts.push({ x: fx(u) + Math.cos(a) * R * j, y: fy(v) + Math.sin(a) * R * j, at: Math.min(.97, born + r() * .14) }); }
        loops.push({ cx: fx(u), cy: fy(v), R, born: born + .14, dies: k === 5 ? born + .3 : 2 });
      });
      for (let i = 0; i < 70; i++) pts.push({ x: fx(r()), y: fy(r()), at: r() * .98 });
      noise = []; for (let i = 0; i < 9; i++) { const b = r() * .85; noise.push({ born: b, dies: b + .02 + r() * .06 }); }
      pts.sort((a, b) => a.at - b.at);
    };
    const MONTHS = ['Oct 2024', 'Apr 2025', 'Oct 2025', 'Apr 2026', 'Oct 2026'];
    const draw = (ctx, W, H, t, still) => {
      let tt = t + T0, op = 1;
      if (tt > LEN) { tt = T1 + ((tt - LEN) % (LEN - T1)); op = Math.min(1, tt - T1); }
      if (tt > LEN - 1) op = Math.min(op, LEN - tt);
      if (still) { tt = CYCLE; op = 1; }
      ph.style.opacity = op.toFixed(2);
      const p = Math.min(1, tt / CYCLE);
      const ink = css('--ink'), soft = css('--ink-soft'), fal = css('--falcon'), heat = css('--heat');
      const phone = W < 520, eps = Math.min(W, H) * (phone ? .095 : .085);
      const vis = pts.filter((q) => q.at <= p);
      ctx.lineWidth = .7; ctx.strokeStyle = ink; ctx.globalAlpha = .18; ctx.beginPath();
      for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) { const a = vis[i], b = vis[j]; if (Math.hypot(a.x - b.x, a.y - b.y) < eps) { ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); } }
      ctx.stroke(); ctx.globalAlpha = 1;
      loops.forEach((L) => {
        if (p < L.born) return;
        const age = Math.min(1, (p - L.born) / .05), gone = p > L.dies ? Math.max(0, 1 - (p - L.dies) / .04) : 1;
        ctx.globalAlpha = .9 * age * gone; ctx.strokeStyle = L.dies < 2 ? soft : fal; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(L.cx, L.cy, L.R, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = .035 * age * gone; ctx.fillStyle = fal; ctx.fill(); ctx.globalAlpha = 1;
      });
      ctx.fillStyle = ink;
      vis.forEach((q) => { const fresh = Math.max(0, 1 - (p - q.at) / .03); ctx.globalAlpha = .55 + .45 * fresh; ctx.beginPath(); ctx.arc(q.x, q.y, 1.6 + fresh * 2.2, 0, Math.PI * 2); ctx.fill(); });
      ctx.globalAlpha = 1;
      const ty = phone ? H * .7 : H * .9, tx0 = W * .05, tx1 = phone ? W * .95 : W * .66;
      ctx.strokeStyle = soft; ctx.globalAlpha = .45; ctx.lineWidth = 1; ctx.setLineDash([1, 6]); ctx.beginPath(); ctx.moveTo(tx0, ty); ctx.lineTo(tx1, ty); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      ctx.font = `${phone ? 11 : 12}px "Bricolage Grotesque", sans-serif`; ctx.fillStyle = soft; ctx.textBaseline = 'top';
      MONTHS.forEach((m, i) => { if (phone && i % 2) return; const x = tx0 + (tx1 - tx0) * i / 4; ctx.fillRect(x, ty - 3, 1, 6); ctx.textAlign = i === 0 ? 'left' : i === 4 ? 'right' : 'center'; ctx.fillText(m, x, ty + 7); });
      const hx = tx0 + (tx1 - tx0) * p; ctx.fillStyle = heat; ctx.beginPath(); ctx.arc(hx, ty, 4, 0, Math.PI * 2); ctx.fill();
      const bx0 = phone ? W * .05 : W * .72, bx1 = W * .95, by0 = phone ? H * .8 : H * .1, bh = phone ? H * .17 : H * .72;
      const bars = [...loops.map((L) => ({ born: L.born, dies: L.dies, keep: L.dies > 1 })), ...noise.map((n) => ({ ...n, keep: false }))].sort((a, b) => a.born - b.born);
      const rowH = Math.min(phone ? 4 : 9, bh / bars.length);
      ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; ctx.fillStyle = soft;
      if (!phone) ctx.fillText('Barcode: how long each loop lasts', bx0, by0 - 6);
      bars.forEach((b, i) => {
        if (p < b.born) return;
        const end = Math.min(p, b.dies), x0 = bx0 + (bx1 - bx0) * b.born, x1 = bx0 + (bx1 - bx0) * end, y = by0 + i * (bh / bars.length);
        ctx.fillStyle = b.keep ? fal : soft; ctx.globalAlpha = b.keep ? .95 : .55; ctx.fillRect(x0, y, Math.max(1.5, x1 - x0), Math.max(1.5, rowH - 1.5));
      });
      ctx.globalAlpha = 1;
    };
    player(ph, $('#ph-toggle'), { size: build, draw });
  }

  /* ── Tabs (WAI-ARIA tabs pattern: arrow keys move, Home and End jump). ── */
  const tabs = $$('[role="tab"]');
  const pick = (t, focus) => {
    tabs.forEach((x) => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !on; });
    if (focus) t.focus();
    requestAnimationFrame(() => players.forEach((p) => { p.size(); p.kick(); }));
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => pick(t));
    t.addEventListener('keydown', (e) => {
      const k = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (k === undefined) return; e.preventDefault(); pick(tabs[(k + tabs.length) % tabs.length], true);
    });
  });

  /* ── Instruments: a torus, a rolled sheet, a poem that turns. Calm; still when motion is reduced. ── */
  const proj = (x, y, z, ax, ay, W, H, sc) => {   // rotate about Y then X, then a gentle perspective
    const cy = Math.cos(ay), sy = Math.sin(ay), x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
    const cx = Math.cos(ax), sx = Math.sin(ax), y1 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
    const f = 4 / (4 + z2); return [W / 2 + x1 * f * sc, H / 2 + y1 * f * sc];
  };
  const tor = $('#torus');
  if (tor) {
    const Rr = 1, rr = .42, line = (ctx, pts) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); };
    const at = (u, v) => [(Rr + rr * Math.cos(v)) * Math.cos(u), rr * Math.sin(v), (Rr + rr * Math.cos(v)) * Math.sin(u)];
    player(tor, $('#torus-toggle'), { draw: (ctx, W, H, t, still) => {
      const ay = still ? .6 : t * .12, ax = 1.0, sc = Math.min(W, H) * .22;
      const P = (u, v) => { const q = at(u, v); return proj(q[0], q[1], q[2], ax, ay, W, H, sc); };
      ctx.strokeStyle = css('--ink'); ctx.lineWidth = .8; ctx.globalAlpha = .22;
      for (let i = 0; i < 36; i++) { const u = i / 36 * Math.PI * 2, a = []; for (let j = 0; j <= 24; j++) a.push(P(u, j / 24 * Math.PI * 2)); line(ctx, a); }
      for (let j = 0; j < 14; j++) { const v = j / 14 * Math.PI * 2, a = []; for (let i = 0; i <= 90; i++) a.push(P(i / 90 * Math.PI * 2, v)); line(ctx, a); }
      ctx.globalAlpha = 1; ctx.strokeStyle = css('--falcon'); ctx.lineWidth = 1.8;   // a path that winds five times round and three times through
      const w = []; for (let i = 0; i <= 400; i++) { const s = i / 400 * Math.PI * 2; w.push(P(5 * s, 3 * s)); } line(ctx, w);
      const h = (still ? .3 : (t * .05) % 1) * Math.PI * 2, hp = P(5 * h, 3 * h); ctx.fillStyle = css('--heat'); ctx.beginPath(); ctx.arc(hp[0], hp[1], 5, 0, 7); ctx.fill();
    } });
  }
  const man = $('#manifold');
  if (man) {
    const T = 36, S = 20, t0 = 1.5 * Math.PI, t1 = 4.2 * Math.PI, arc = [0];
    for (let i = 1; i <= 400; i++) { const a = t0 + (t1 - t0) * (i - 1) / 400, b = t0 + (t1 - t0) * i / 400, m = (a + b) / 2; arc.push(arc[i - 1] + Math.sqrt(1 + m * m) * (b - a)); }
    const len = arc[400], sOf = (t) => arc[Math.round((t - t0) / (t1 - t0) * 400)];
    const rr = rng(5), pts = []; for (let i = 0; i < 150; i++) pts.push([rr(), rr()]);
    player(man, $('#manifold-toggle'), { draw: (ctx, W, H, t, still) => {
      const m = still ? .55 : (1 - Math.cos(t * 2 * Math.PI / 26)) / 2;   // roll and unroll, slowly
      const ay = still ? .5 : .5 + Math.sin(t * .15) * .5, ax = .45, sc = Math.min(W, H) * .36;
      const at = (u, v) => { const th = t0 + u * (t1 - t0), x = (th * Math.cos(th) * (1 - m) + (sOf(th) - len / 2) * .5 * m) / 14, z = th * Math.sin(th) * (1 - m * .9) / 14, y = (v - .5) * 1.1;
        return proj(x, y, z, ax, ay, W, H, sc); };
      ctx.strokeStyle = css('--ink'); ctx.lineWidth = .8; ctx.globalAlpha = .22;
      for (let j = 0; j <= 8; j++) { ctx.beginPath(); for (let i = 0; i <= T * 2; i++) { const p = at(i / (T * 2), j / 8); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.stroke(); }
      for (let i = 0; i <= S; i++) { ctx.beginPath(); for (let j = 0; j <= 8; j++) { const p = at(i / S, j / 8); j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.stroke(); }
      ctx.globalAlpha = .9; const walk = still ? .4 : (t * .03) % 1;
      pts.forEach(([u, v]) => { const p = at(u, v), near = Math.abs(u - walk) < .06; ctx.fillStyle = near ? css('--falcon') : css('--ink'); ctx.globalAlpha = near ? 1 : .55; ctx.beginPath(); ctx.arc(p[0], p[1], near ? 3 : 1.8, 0, 7); ctx.fill(); });
      ctx.globalAlpha = 1;
    } });
  }
  const qn = $('#queneau');
  if (qn) {
    const L = JSON.parse($('#queneau-lines').textContent), N = L.length, K = L[0].length, total = K ** N;
    const rq = rng(61), idx = L.map(() => Math.floor(rq() * K));
    const strips = $$('.strip', qn), count = $('#queneau-count'), say = $('#queneau-say');
    const show = () => { strips.forEach((b, i) => { $('.tx', b).textContent = L[i][idx[i]]; }); let n = 0; idx.forEach((v) => { n = n * K + v; }); count.textContent = `Poem ${(n + 1).toLocaleString('en-GB')} of ${total.toLocaleString('en-GB')}`; };
    const turn = (i, quiet) => {
      const b = strips[i]; let nx; do { nx = Math.floor(Math.random() * K); } while (nx === idx[i]);
      const go = () => { idx[i] = nx; show(); b.classList.remove('turn'); if (!quiet) say.textContent = `Line ${i + 1} is now: ${L[i][nx]}`; };
      if (reduced()) go(); else { b.classList.add('turn'); setTimeout(go, 170); }
    };
    strips.forEach((b, i) => b.addEventListener('click', () => turn(i)));
    $('#queneau-shuffle').addEventListener('click', () => { strips.forEach((_, i) => setTimeout(() => turn(i, true), reduced() ? 0 : i * 120)); say.textContent = 'All six lines turned.'; });
    show();
  }

  /* Colours come from the theme; draw again when it changes. */
  new MutationObserver(() => { label(); syncSky(); drawFlocks(); players.forEach((p) => { p.paint(); p.kick(); if (p.btn) p.btn.hidden = reduced(); }); })
    .observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-lib-motion', 'data-lib-contrast'] });
  try { matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => players.forEach((p) => { p.paint(); p.kick(); })); } catch (e) {}
  document.fonts && document.fonts.ready.then(() => players.forEach((p) => p.size()));
})();

});

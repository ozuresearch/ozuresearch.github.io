/* OZU legal pages (/terms/, /privacy/, /sla/, /sctl/).
   Each page is a small shell (<body data-doc="...">); this script reads the Markdown master in /terms/
   (terms/<doc>.<product>.<lang>.md, or terms/<doc>.<lang>.md for OZU-wide documents) and renders it.
   Editing the Markdown in /terms/ is all it takes: no build step. Raw HTML in the Markdown is shown as
   text, never executed. Query: ?lang=ja|en|id, ?product=<slug> for product documents. */
(function () {
  'use strict';

  var PRODUCTS = ['co-production-manager']; // first = default
  var LANGS = ['ja', 'en', 'id'];
  var DOCS = {
    terms: { product: true, title: { ja: '利用規約', en: 'Terms of Use', id: 'Ketentuan Penggunaan' } },
    privacy: { product: false, title: { ja: '個人情報保護方針', en: 'Privacy Policy', id: 'Kebijakan Privasi' } },
    sla: { product: true, title: { ja: 'サービスレベル合意（SLA）', en: 'Service Level Agreement (SLA)', id: 'Perjanjian Tingkat Layanan (SLA)' } },
    sctl: { product: true, title: { ja: '特定商取引法に基づく表記', en: 'Specified Commercial Transactions Act notation', id: 'Pernyataan UU Transaksi Komersial Tertentu' } },
  };
  var UI = {
    ja: { loading: '読み込み中…', failed: '読み込めませんでした。', github: 'GitHub で読む', version: '版', effective: '施行日', fallback: 'この言語の版はまだないため、日本語版を表示しています。' },
    en: { loading: 'Loading…', failed: 'Could not load this document.', github: 'Read on GitHub', version: 'Version', effective: 'Effective', fallback: 'Not yet available in this language; showing the Japanese version.' },
    id: { loading: 'Memuat…', failed: 'Dokumen tidak dapat dimuat.', github: 'Baca di GitHub', version: 'Versi', effective: 'Berlaku', fallback: 'Belum tersedia dalam bahasa ini; menampilkan versi bahasa Jepang.' },
  };
  var REPO = 'https://github.com/ozuresearch/ozuresearch.github.io/blob/main/terms/';

  /* ---------- Markdown (small, safe subset) ---------- */

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function safeUrl(u) {
    return /^(https?:|mailto:|\/|#)/i.test(u) ? u : '#';
  }
  function inline(s) {
    var codes = [];
    s = esc(s).replace(/`([^`]+)`/g, function (m, c) { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0000'; });
    s = s
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, t, u) {
        var href = safeUrl(u.replace(/&amp;/g, '&'));
        var ext = /^https?:/i.test(href) ? ' target="_blank" rel="noopener"' : '';
        return '<a href="' + esc(href) + '"' + ext + '>' + t + '</a>';
      })
      .replace(/&lt;(https?:\/\/[^\s&]+)&gt;/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
      .replace(/ {2,}$|\\$/gm, '<br>');
    return s.replace(/\u0000(\d+)\u0000/g, function (m, i) { return '<code>' + codes[+i] + '</code>'; });
  }
  function cells(line) {
    return line.trim().replace(/^\||\|$/g, '').split('|').map(function (c) { return c.trim(); });
  }
  function render(src) {
    var lines = src.replace(/\r\n?/g, '\n').split('\n');
    var out = [];
    var i = 0;
    function listBlock(indent) {
      var ordered = /^\s*\d+[.)]\s/.test(lines[i]);
      var html = ordered ? '<ol>' : '<ul>';
      while (i < lines.length) {
        var m = lines[i].match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
        if (!m || m[1].length < indent) break;
        if (m[1].length > indent) { html = html.replace(/<\/li>$/, '') + listBlock(m[1].length) + '</li>'; continue; }
        var text = m[3];
        i++;
        while (i < lines.length && lines[i].trim() && !/^\s*([-*+]|\d+[.)])\s/.test(lines[i]) && /^\s+/.test(lines[i])) text += '\n' + lines[i++].trim();
        html += '<li>' + inline(text) + '</li>';
      }
      return html + (ordered ? '</ol>' : '</ul>');
    }
    while (i < lines.length) {
      var line = lines[i];
      var h;
      if (!line.trim()) { i++; continue; }
      if ((h = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/))) { out.push('<h' + h[1].length + '>' + inline(h[2]) + '</h' + h[1].length + '>'); i++; continue; }
      if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { out.push('<hr>'); i++; continue; }
      if (/^\s*>/.test(line)) {
        var q = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) q.push(lines[i++].replace(/^\s*>\s?/, ''));
        out.push('<blockquote>' + render(q.join('\n')) + '</blockquote>');
        continue;
      }
      if (/^\s*\|/.test(line) && i + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1])) {
        var head = cells(line);
        i += 2;
        var rows = [];
        while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(cells(lines[i++]));
        out.push('<div class="tw"><table><thead><tr>' + head.map(function (c) { return '<th>' + inline(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
          rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + inline(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>');
        continue;
      }
      if (/^\s*([-*+]|\d+[.)])\s+/.test(line)) { out.push(listBlock(line.match(/^\s*/)[0].length)); continue; }
      var para = [];
      while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|\s*>|\s*([-*+]|\d+[.)])\s|\s*\|)/.test(lines[i])) para.push(lines[i++]);
      out.push('<p>' + inline(para.join('\n')) + '</p>');
    }
    return out.join('\n');
  }
  function frontMatter(src) {
    var m = src.replace(/^﻿/, '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!m) return { meta: {}, body: src };
    var meta = {};
    m[1].split(/\r?\n/).forEach(function (l) {
      var kv = l.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
      if (kv) meta[kv[1]] = kv[2].replace(/^["']|["']$/g, '').trim();
    });
    return { meta: meta, body: m[2] };
  }

  /* ---------- Page ---------- */

  var params = new URLSearchParams(location.search);
  function pickLang() {
    var q = params.get('lang');
    if (LANGS.indexOf(q) >= 0) return q;
    var saved = null;
    try { saved = localStorage.getItem('ozuresearch.lang'); } catch (e) {}
    if (LANGS.indexOf(saved) >= 0) return saved;
    var nav = (navigator.language || 'ja').slice(0, 2).toLowerCase();
    return nav === 'in' ? 'id' : LANGS.indexOf(nav) >= 0 ? nav : 'ja';
  }
  var docKey = document.body.getAttribute('data-doc');
  var doc = DOCS[docKey];
  var product = PRODUCTS.indexOf(params.get('product')) >= 0 ? params.get('product') : PRODUCTS[0];
  var lang = pickLang();
  var ui = UI[lang];
  var file = function (l) { return docKey + (doc.product ? '.' + product : '') + '.' + l + '.md'; };
  var main = document.getElementById('doc');
  document.documentElement.lang = lang;

  // Language links keep the other query parameters.
  var nav = document.getElementById('langs');
  LANGS.forEach(function (l) {
    var p = new URLSearchParams(location.search);
    p.set('lang', l);
    var a = document.createElement('a');
    a.href = '?' + p.toString();
    a.textContent = { ja: '日本語', en: 'English', id: 'Bahasa Indonesia' }[l];
    if (l === lang) a.className = 'on';
    a.addEventListener('click', function () { if (l !== 'id') { try { localStorage.setItem('ozuresearch.lang', l); } catch (e) {} } });
    nav.appendChild(a);
  });

  main.innerHTML = '<p class="muted">' + ui.loading + '</p>';
  function load(l) {
    return fetch('/terms/' + file(l), { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.text();
    }).then(function (t) { return { text: t, lang: l }; });
  }
  load(lang)
    .catch(function () { return lang === 'ja' ? Promise.reject() : load('ja'); })
    .then(function (res) {
      var fm = frontMatter(res.text);
      var show = function (v) { return v && v !== 'TBD' ? esc(v) : ''; };
      var meta = [show(fm.meta.version) && ui.version + ': ' + show(fm.meta.version), show(fm.meta.effective) && ui.effective + ': ' + show(fm.meta.effective)].filter(Boolean);
      main.innerHTML =
        (res.lang !== lang ? '<p class="muted">' + ui.fallback + '</p>' : '') +
        (meta.length ? '<p class="meta">' + meta.join('<span>·</span>') + '</p>' : '') +
        '<article class="md">' + render(fm.body) + '</article>' +
        '<p class="src"><a href="' + REPO + file(res.lang) + '" target="_blank" rel="noopener">' + ui.github + '</a></p>';
      document.title = (fm.meta.title || doc.title[lang]) + ' | OZU Research';
    })
    .catch(function () {
      main.innerHTML = '<h1>' + esc(doc.title[lang]) + '</h1><p class="muted">' + ui.failed + ' <a href="' + REPO + file('ja') + '" target="_blank" rel="noopener">' + ui.github + '</a></p>';
      document.title = doc.title[lang] + ' | OZU Research';
    });
})();

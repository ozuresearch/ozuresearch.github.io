#!/usr/bin/env node
/* OZU Research: static page build (SEO / AI search).

   いつ実行するか: index.html・data.js・site.js を編集したあと、コミットする前に毎回。
     node scripts/build.mjs        （Node 18 以上。インストール不要）

   やること:
   - index.html をテンプレートとして、各ページの静的 HTML を書き出す
       /about/index.html, /team/<handle>/index.html, /en/about/index.html ...
     正しいセクションと言語が最初から表示され、チーム・論文・プロダクトなども
     HTML に入っているので、JavaScript を実行しない検索エンジンや AI クローラーにも内容が見える。
   - 各ページの <head>（title・description・canonical・hreflang・OGP・JSON-LD）を生成
   - sitemap.xml と llms.txt を生成
   index.html 自体も「日本語トップページ」として上書きされます（生成部分はマーカーの内側だけ）。
     <!-- seo:head ... --> ... <!-- /seo:head -->   ページごとの <head> タグ
     <!--pre:ID--> ... <!--/pre:ID-->               事前レンダリングされた中身
   マーカーの外側は自由に編集できます。何度実行しても、変更がなければ結果は同じです。 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const S = require(join(ROOT, 'site.js'));
const BASE = S.BASE;
const LANGS = ['ja', 'en'];

/* ---------- Load data.js (it assigns window.OZU_DATA) ---------- */

function loadData() {
  const sandbox = { window: {} };
  vm.runInNewContext(readFileSync(join(ROOT, 'data.js'), 'utf8'), sandbox, { filename: 'data.js' });
  const D = sandbox.window.OZU_DATA;
  if (!D) throw new Error('data.js did not define window.OZU_DATA');
  D.members = D.members || [];
  D.publications = D.publications || [];
  D.products = D.products || [];
  return D;
}

/* ---------- HTML helpers ---------- */

const esc = S.esc;

// Add or remove the `hidden` attribute on one opening tag (ignores text inside quoted values).
function setHidden(tag, hide) {
  const bare = tag.replace(/("[^"]*")|\s+hidden(?=[\s/>])/g, (m, quoted) => quoted || '');
  return hide ? bare.replace(/\s*>$/, ' hidden>') : bare;
}

function replaceOnce(html, re, fn, what) {
  let found = false;
  const out = html.replace(re, (...args) => { found = true; return fn(...args); });
  if (!found) throw new Error(`index.html: could not find ${what}`);
  return out;
}

function fillMarker(html, id, inner) {
  const re = new RegExp(`(<!--pre:${id}-->)[\\s\\S]*?(<!--/pre:${id}-->)`);
  return replaceOnce(html, re, (m, a, b) => a + inner + b, `<!--pre:${id}--> marker`);
}

function fillText(html, id, text) {
  const re = new RegExp(`(<([a-z][a-z0-9]*)\\b[^>]*\\sid="${id}"[^>]*>)[^<]*(</\\2>)`);
  return replaceOnce(html, re, (m, open, tagName, close) => open + esc(text) + close, `element id="${id}"`);
}

function hideId(html, id, hide) {
  const re = new RegExp(`<[a-z][a-z0-9]*\\b[^>]*\\sid="${id}"[^>]*>`);
  return replaceOnce(html, re, (tag) => setHidden(tag, hide), `element id="${id}"`);
}

/* ---------- <head>: meta tags + JSON-LD ---------- */

const LOGO = `${BASE}/assets/ozu-research-logo.png`;
const ORG_ID = `${BASE}/#organization`;
const SITE_ID = `${BASE}/#website`;

function organization(lang) {
  const ja = lang === 'ja';
  return {
    '@type': 'ResearchOrganization',
    '@id': ORG_ID,
    name: 'OZU Research',
    url: `${BASE}/`,
    logo: { '@type': 'ImageObject', url: LOGO },
    image: LOGO,
    email: 'research@ozu-inc.com',
    description: S.pageMeta(null, { route: 'home' }, lang).description,
    parentOrganization: {
      '@type': 'Organization',
      name: 'OZU Inc.',
      alternateName: '株式会社OZU',
      url: 'https://ozu-inc.com/',
      email: 'contact@ozu-inc.com',
      telephone: '+81-3-6721-1476',
      sameAs: ['https://www.instagram.com/ozu_inc/']
    },
    location: [
      {
        '@type': 'Place',
        name: 'Tokyo Lab',
        address: {
          '@type': 'PostalAddress',
          streetAddress: ja ? '神宮前3-35-2 クローチェ神宮前ビル5F' : 'Croce Jingumae Bldg. 5F, 3-35-2 Jingumae',
          addressLocality: ja ? '渋谷区' : 'Shibuya-ku',
          addressRegion: ja ? '東京都' : 'Tokyo',
          postalCode: '150-0001',
          addressCountry: 'JP'
        }
      },
      {
        '@type': 'Place',
        name: 'Surabaya Lab',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'SAW-10.01 Lab, Politeknik Elektronika Negeri Surabaya, Jl. Raya ITS, Keputih, Sukolilo',
          addressLocality: 'Surabaya',
          addressRegion: 'East Java',
          postalCode: '60111',
          addressCountry: 'ID'
        }
      }
    ]
  };
}

function personRef(D, a, lang) {
  if (typeof a !== 'string') return { '@type': 'Person', name: S.memberName(a, lang) };
  const m = S.member(D, a);
  if (!m) return { '@type': 'Person', name: a };
  return { '@type': 'Person', name: S.memberName(m, lang), url: BASE + S.path('person', lang, m.handle) };
}

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
function isoDate(text) {
  const m = /([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/.exec(text || '');
  const mi = m ? MONTHS.indexOf(m[1].toLowerCase()) : -1;
  if (mi < 0) return null;
  return `${m[3]}-${String(mi + 1).padStart(2, '0')}-${m[2].padStart(2, '0')}`;
}

function compact(obj) {
  for (const k of Object.keys(obj)) if (obj[k] == null || obj[k] === '' || (Array.isArray(obj[k]) && !obj[k].length)) delete obj[k];
  return obj;
}

const PAGE_TYPES = { about: 'AboutPage', contact: 'ContactPage', apply: 'ContactPage', newsletter: 'ContactPage', person: 'ProfilePage', publications: 'CollectionPage', products: 'CollectionPage', team: 'CollectionPage' };

function jsonLd(D, r, lang, meta) {
  const graph = [organization(lang), {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: `${BASE}/`,
    name: 'OZU Research',
    inLanguage: ['ja', 'en'],
    publisher: { '@id': ORG_ID }
  }];
  const pageNode = compact({
    '@type': PAGE_TYPES[r.route] || 'WebPage',
    '@id': `${meta.url}#webpage`,
    url: meta.url,
    name: meta.title,
    description: meta.description,
    inLanguage: lang,
    isPartOf: { '@id': SITE_ID },
    about: r.route === 'home' || r.route === 'about' ? { '@id': ORG_ID } : null
  });
  graph.push(pageNode);

  if (r.route !== 'home') {
    const crumbs = [{ name: 'OZU Research', url: BASE + S.path('home', lang) }];
    if (r.route === 'person') crumbs.push({ name: S.pageMeta(D, { route: 'team' }, lang).label, url: BASE + S.path('team', lang) });
    crumbs.push({ name: meta.label, url: meta.url });
    pageNode.breadcrumb = { '@id': `${meta.url}#breadcrumb` };
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${meta.url}#breadcrumb`,
      itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url }))
    });
  }

  if (r.route === 'person') {
    const m = S.member(D, r.handle);
    const other = S.memberName(m, lang === 'ja' ? 'en' : 'ja');
    const person = compact({
      '@type': 'Person',
      '@id': `${meta.url}#person`,
      name: S.memberName(m, lang),
      alternateName: other !== S.memberName(m, lang) ? other : null,
      jobTitle: S.pick(m, 'roleJa', 'role', lang),
      description: S.pick(m, 'bioJa', 'bio', lang),
      image: m.photo ? S.absolute(m.photo) : null,
      url: meta.url,
      affiliation: { '@id': ORG_ID },
      sameAs: (m.links || []).map((l) => l.url).filter(Boolean)
    });
    pageNode.mainEntity = { '@id': person['@id'] };
    graph.push(person);
  }

  if (r.route === 'publications') {
    graph.push({
      '@type': 'ItemList',
      name: meta.label,
      itemListElement: D.publications.map((x, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: compact({
          '@type': 'ScholarlyArticle',
          headline: S.pick(x, 'titleJa', 'title', lang),
          alternativeHeadline: lang === 'ja' && x.titleJa && x.title ? x.title : null,
          author: (x.authors || []).map((a) => personRef(D, a, lang)),
          datePublished: x.year ? String(x.year) : null,
          publication: (x.venue || x.venueJa) ? { '@type': 'PublicationEvent', name: S.pick(x, 'venueJa', 'venue', lang) } : null,
          creativeWorkStatus: S.pick(x, 'statusJa', 'status', lang),
          abstract: S.pick(x, 'summaryJa', 'summary', lang),
          keywords: (x.tags || []).join(', '),
          image: S.pick(x, 'figureJa', 'figure', lang) ? S.absolute(S.pick(x, 'figureJa', 'figure', lang)) : null,
          url: /^https?:/.test(S.pubHref(x, lang)) ? S.pubHref(x, lang) : null,
          sourceOrganization: { '@id': ORG_ID }
        })
      }))
    });
  }

  if (r.route === 'products') {
    graph.push({
      '@type': 'ItemList',
      name: meta.label,
      itemListElement: D.products.map((x, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: compact({
          '@type': 'SoftwareApplication',
          name: S.pick(x, 'nameJa', 'name', lang),
          url: x.url,
          description: S.pick(x, 'summaryJa', 'summary', lang),
          image: x.image ? S.absolute(x.image) : null,
          datePublished: isoDate(x.date),
          sameAs: (x.links || []).map((l) => l.url).filter((u) => u && u !== x.url)
        })
      }))
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

function headHtml(D, r, lang) {
  const meta = S.pageMeta(D, r, lang);
  const m = r.route === 'person' ? S.member(D, r.handle) : null;
  const image = m && m.photo ? S.absolute(m.photo) : LOGO;
  const lines = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}">`
  ];
  if (meta.robots) lines.push(`<meta name="robots" content="${meta.robots}">`);
  lines.push(`<link rel="canonical" href="${esc(meta.canonical)}">`);
  if (meta.alternates) {
    lines.push(`<link rel="alternate" hreflang="ja" href="${esc(meta.alternates.ja)}">`);
    lines.push(`<link rel="alternate" hreflang="en" href="${esc(meta.alternates.en)}">`);
    lines.push(`<link rel="alternate" hreflang="x-default" href="${esc(meta.alternates.ja)}">`);
  }
  lines.push(
    `<meta property="og:type" content="${r.route === 'person' ? 'profile' : 'website'}">`,
    `<meta property="og:site_name" content="OZU Research">`,
    `<meta property="og:title" content="${esc(meta.title)}">`,
    `<meta property="og:description" content="${esc(meta.description)}">`,
    `<meta property="og:url" content="${esc(meta.canonical)}">`,
    `<meta property="og:image" content="${esc(image)}">`,
    `<meta property="og:locale" content="${meta.locale}">`,
    `<meta property="og:locale:alternate" content="${meta.localeAlt}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(meta.title)}">`,
    `<meta name="twitter:description" content="${esc(meta.description)}">`,
    `<meta name="twitter:image" content="${esc(image)}">`,
    `<script type="application/ld+json">${JSON.stringify(jsonLd(D, r, lang, meta)).replace(/</g, '\\u003c')}</script>`
  );
  return lines.join('\n');
}

/* ---------- One page ---------- */

function renderPage(tpl, D, r, lang) {
  const st = S.pageState(D, r, lang, {});
  let html = tpl;

  html = replaceOnce(html, /<html lang="[^"]*">/, () => `<html lang="${lang}">`, '<html lang>');
  html = replaceOnce(html, /(<!-- seo:head[^>]*-->)[\s\S]*?(<!-- \/seo:head -->)/,
    (m, a, b) => `${a}\n${headHtml(D, r, lang)}\n${b}`, '<!-- seo:head --> marker');

  // Sections: only the current page is visible.
  html = html.replace(/<section data-page="([a-z]+)"[^>]*>/g, (tag, name) => setHidden(tag, name !== st.page));
  html = replaceOnce(html, /<section data-pubs[^>]*>/, (tag) => setHidden(tag, st.page !== 'publications'), '<section data-pubs>');

  // Language: [data-lang] visibility, switcher state, internal links.
  html = html.replace(/<[a-z][a-z0-9]*\b[^>]*\sdata-lang="(ja|en)"[^>]*>/g, (tag, l) => setHidden(tag, l !== lang));
  html = html.replace(/<button type="button" data-setlang="(ja|en)"( class="on")?>/g,
    (m, l) => `<button type="button" data-setlang="${l}"${l === lang ? ' class="on"' : ''}>`);
  html = fillText(html, 'langLabel', lang === 'ja' ? '日本語' : 'English');

  // Dynamic content: reset every slot, then fill the ones this page uses.
  for (const id of S.HTML_IDS) html = fillMarker(html, id, st.html[id] || '');
  for (const id of S.TEXT_IDS) html = fillText(html, id, st.text[id] || '');
  for (const id of Object.keys(st.hidden)) html = hideId(html, id, st.hidden[id]);

  html = html.replace(/(\shref=")(\/[^"]*)(")/g, (m, a, href, b) => a + S.localize(href, lang) + b);
  return html;
}

/* ---------- Routes ---------- */

function routes(D) {
  const list = [{ route: 'home' }];
  for (const p of S.PAGES) {
    list.push({ route: p });
    if (p === 'team') for (const m of D.members) list.push({ route: 'person', handle: m.handle });
  }
  return list;
}

function outFile(p) {
  return p === '/' ? join(ROOT, 'index.html') : join(ROOT, p, 'index.html');
}

function readOr(file, fallback) {
  return existsSync(file) ? readFileSync(file, 'utf8') : fallback;
}

// Remove person pages for members that were deleted from data.js.
function removeStalePeople(D) {
  const keep = new Set(D.members.map((m) => m.handle));
  for (const dir of [join(ROOT, 'team'), join(ROOT, 'en', 'team')]) {
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || keep.has(entry.name)) continue;
      const files = readdirSync(join(dir, entry.name));
      if (files.length === 1 && files[0] === 'index.html') {
        rmSync(join(dir, entry.name), { recursive: true });
        console.log(`removed  ${join(dir, entry.name).slice(ROOT.length)}/`);
      }
    }
  }
}

/* ---------- sitemap.xml ---------- */

function sitemap(entries, previous, today) {
  const old = new Map();
  for (const m of previous.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)) old.set(m[1], m[2]);
  const urls = entries.map(({ meta, changed }) => {
    const loc = meta.canonical;
    const lastmod = !changed && old.has(loc) ? old.get(loc) : today;
    return [
      '  <url>',
      `    <loc>${esc(loc)}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <xhtml:link rel="alternate" hreflang="ja" href="${esc(meta.alternates.ja)}"/>`,
      `    <xhtml:link rel="alternate" hreflang="en" href="${esc(meta.alternates.en)}"/>`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(meta.alternates.ja)}"/>`,
      '  </url>'
    ].join('\n');
  });
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    urls.join('\n') + '\n</urlset>\n';
}

/* ---------- llms.txt ---------- */

function firstSentence(s) {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  const m = /^.*?(?<!\b(?:Inc|Ltd|Co|vs|Dr|e\.g|i\.e))[.!?。](?=\s|$)/.exec(t);
  return m ? m[0] : t;
}

function llms(D) {
  const url = (route, lang, handle) => BASE + S.path(route, lang, handle);
  const desc = (route, lang) => S.pageMeta(D, { route }, lang).description;
  const out = [];
  out.push('# OZU Research', '');
  out.push(`> ${desc('home', 'en')}`, '');
  out.push(
    'OZU Research (by OZU Inc., 株式会社OZU) works on "Production Survivability": treating whether generative AI output can actually be delivered to a client as a measurable construct, then building tools that achieve it. ' +
    'It pairs working products with research, using real commercial projects as the testbed and publishing results at international conferences and in journals. ' +
    'It runs with Musashino University and an international team across Japan, Indonesia and Thailand.',
    '',
    `- Tokyo Lab: Croce Jingumae Bldg. 5F, 3-35-2 Jingumae, Shibuya-ku, Tokyo 150-0001, Japan`,
    `- Surabaya Lab: SAW-10.01 Lab, Politeknik Elektronika Negeri Surabaya, Jl. Raya ITS, Keputih, Sukolilo, Surabaya, East Java 60111, Indonesia`,
    `- Email: research@ozu-inc.com`,
    `- Parent company: OZU Inc. (https://ozu-inc.com/)`,
    `- Japanese is the default language at ${BASE}/; English pages live under ${BASE}/en/.`,
    ''
  );

  out.push('## Pages', '');
  for (const route of ['about', 'research', 'team', 'publications', 'products', 'locations', 'contact']) {
    const label = S.pageMeta(D, { route }, 'en').label;
    out.push(`- [${label}](${url(route, 'en')}): ${desc(route, 'en')} Japanese: ${url(route, 'ja')}`);
  }
  out.push('');

  out.push('## Publications', '');
  for (const x of D.publications) {
    const authors = (x.authors || []).map((a) => {
      if (typeof a !== 'string') return S.memberName(a, 'en');
      const m = S.member(D, a);
      return m ? S.memberName(m, 'en') : a;
    }).join(', ');
    const status = x.status ? ` (${x.status})` : '';
    out.push(`- [${x.title}](${S.pubHref(x, 'en')}): ${x.venue || ''}${status}. ${authors}. ${firstSentence(x.summary)}`);
  }
  out.push('');

  out.push('## Products', '');
  for (const x of D.products) {
    out.push(`- [${x.name}](${x.url}): ${x.date ? x.date + '. ' : ''}${firstSentence(x.summary)}`);
  }
  out.push('');

  out.push('## Team', '');
  for (const m of D.members) {
    out.push(`- [${S.memberName(m, 'en')}](${url('person', 'en', m.handle)}): ${m.role || ''}. ${firstSentence(m.bio)} Japanese: ${url('person', 'ja', m.handle)}`);
  }
  out.push('');
  return out.join('\n');
}

/* ---------- Main ---------- */

function main() {
  const D = loadData();
  const tpl = readFileSync(join(ROOT, 'index.html'), 'utf8');
  const today = new Date().toISOString().slice(0, 10);
  const indexable = [];
  let written = 0;

  for (const lang of LANGS) {
    for (const r of routes(D)) {
      const p = S.path(r.route, lang, r.handle);
      const file = outFile(p);
      const html = renderPage(tpl, D, r, lang);
      const before = readOr(file, null);
      const changed = before !== html;
      if (changed) {
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, html);
        written++;
        console.log(`wrote    ${p}`);
      }
      const meta = S.pageMeta(D, r, lang);
      if (meta.indexable) indexable.push({ meta, changed });
    }
  }
  removeStalePeople(D);

  const files = {
    'sitemap.xml': sitemap(indexable, readOr(join(ROOT, 'sitemap.xml'), ''), today),
    'llms.txt': llms(D)
  };
  for (const [name, content] of Object.entries(files)) {
    if (readOr(join(ROOT, name), null) !== content) {
      writeFileSync(join(ROOT, name), content);
      written++;
      console.log(`wrote    /${name}`);
    }
  }
  console.log(written ? `done: ${written} file(s) updated` : 'done: everything already up to date');
}

main();

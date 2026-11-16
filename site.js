/* OZU Research: shared page logic.
   index.html の画面描画（window.OZU_SITE）と scripts/build.mjs の事前レンダリング（require）の
   両方がこのファイルを使うので、ブラウザと静的 HTML がまったく同じマークアップになります。
   - URL: /about/, /team/<handle>/ … 英語版は /en/about/ … （日本語がルート）
   - pageState(): 各ページの動的部分（チーム一覧・論文・プロダクト・人物・フォームの文言）
   - pageMeta():  各ページの <title>・description・canonical
   ES5 のまま（ビルド不要・フレームワークなし）。 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.OZU_SITE = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var BASE = 'https://ozuresearch.github.io';
  var PAGES = ['about', 'team', 'research', 'products', 'publications', 'locations', 'contact', 'apply', 'newsletter', 'join'];

  // Elements whose content pageState() may fill (the build resets them on every page).
  var HTML_IDS = ['teamGrid', 'personPhoto', 'personLinks', 'personPubs', 'pubFilters', 'pubList', 'prodList', 'ptabs', 'cPurposes'];
  var TEXT_IDS = ['teamEmpty', 'personHandle', 'personName', 'personRole', 'personBio', 'relatedLabel', 'pubsLabel', 'pubsEmpty', 'prodEmpty',
    'cPurposeLabel', 'lName', 'lEmail', 'lOrg', 'lPhone', 'lOrcid', 'lLinkedin', 'lInstagram', 'lGithub', 'lDribbble', 'lCv', 'lVideo',
    'lOr', 'lMsg', 'lOptin', 'lFine', 'cSubmit', 'lNote', 'joinCta'];

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function pick(o, keyJa, keyEn, lang) { return (lang === 'ja' && o[keyJa]) ? o[keyJa] : (o[keyEn] || o[keyJa] || ''); }
  function tr(lang, ja, en) { return lang === 'ja' ? ja : en; }

  // data.js の相対パス（assets/...）をルート基準（/assets/...）にする。
  function asset(p) {
    p = String(p == null ? '' : p);
    if (!p || /^([a-z][a-z0-9+.-]*:|\/|#)/i.test(p)) return p;
    return '/' + p.replace(/^\.\//, '');
  }
  function absolute(p) {
    p = asset(p);
    return p.charAt(0) === '/' && p.charAt(1) !== '/' ? BASE + p : p;
  }
  function isInternal(href) { return href.charAt(0) === '/' && href.charAt(1) !== '/'; }

  /* ---------- URLs ---------- */

  function path(route, lang, handle) {
    var p = route === 'home' ? '/' : route === 'person' ? '/team/' + encodeURIComponent(handle) + '/' : '/' + route + '/';
    return lang === 'en' ? '/en' + p : p;
  }

  // "/en/team/takahashi/" -> { route: 'person', handle: 'takahashi', lang: 'en' }; unknown -> null
  function parsePath(pathname) {
    var p = String(pathname || '/').replace(/[?#].*$/, '').replace(/index\.html$/, '');
    var lang = 'ja';
    if (/^\/en(\/|$)/.test(p)) { lang = 'en'; p = p.slice(3) || '/'; }
    if (p.charAt(0) !== '/') return null;
    var segs = p.split('/').filter(Boolean);
    if (!segs.length) return { route: 'home', lang: lang };
    if (segs.length === 1 && PAGES.indexOf(segs[0]) !== -1) return { route: segs[0], lang: lang };
    if (segs.length === 2 && segs[0] === 'team' && /^[A-Za-z0-9_.-]+$/.test(segs[1])) {
      return { route: 'person', handle: decodeURIComponent(segs[1]), lang: lang };
    }
    return null;
  }

  // Old URLs: "#about", "#@takahashi", "/about", "/@takahashi" -> "/about/", "/team/takahashi/"; unknown -> null
  function legacyPath(s) {
    var h = String(s || '');
    try { h = decodeURIComponent(h); } catch (e) {}
    h = h.replace(/^[#\/]+/, '').replace(/index\.html$/, '').replace(/\/+$/, '');
    var lang = 'ja';
    if (h === 'en' || h.indexOf('en/') === 0) { lang = 'en'; h = h.slice(3); }
    if (!h || h === 'home') return path('home', lang);
    if (h.charAt(0) === '@' && h.length > 1) return path('person', lang, h.slice(1));
    var r = parsePath('/' + h + '/');
    return r ? path(r.route, lang, r.handle) : null;
  }

  // Same page in another language; non-route hrefs are returned unchanged.
  function localize(href, lang) {
    var r = isInternal(String(href)) ? parsePath(href) : null;
    return r ? path(r.route, lang, r.handle) : href;
  }

  function pageOf(route) { return route === 'apply' || route === 'newsletter' ? 'contact' : route; }

  /* ---------- Rendering (HTML strings) ---------- */

  function member(D, handle) {
    var list = (D && D.members) || [];
    for (var i = 0; i < list.length; i++) if (list[i].handle === handle) return list[i];
    return null;
  }
  function memberName(m, lang) { return pick(m, 'name', 'nameEn', lang); }
  function initials(name) {
    var parts = String(name || '').trim().split(/\s+/);
    if (!parts[0]) return '—';
    if (/[^\x00-\x7F]/.test(parts[0])) return parts[0].slice(0, 1);
    return parts.map(function (p) { return p[0]; }).join('').slice(0, 2).toUpperCase();
  }
  function avatarInner(m, lang) {
    var name = m ? memberName(m, lang) : '';
    return (m && m.photo) ? '<img src="' + esc(asset(m.photo)) + '" alt="' + esc(name) + '">' : esc(initials(name));
  }
  function avatar(m, cls, lang) { return '<span class="av ' + cls + '">' + avatarInner(m, lang) + '</span>'; }

  function teamGrid(D, lang) {
    return D.members.map(function (m) {
      return '<a href="' + esc(path('person', lang, m.handle)) + '">' + avatar(m, 'av-lg', lang) +
        '<span style="display:flex;flex-direction:column;gap:4px">' +
        '<span class="n">' + esc(memberName(m, lang)) + '</span>' +
        '<span class="s">' + esc(pick(m, 'roleJa', 'role', lang)) + '</span></span></a>';
    }).join('');
  }

  function pubTypeLabel(type, lang) {
    var ja = { paper: '論文', talk: '講演', article: '記事' };
    var en = { paper: 'PAPER', talk: 'TALK', article: 'ARTICLE' };
    return (lang === 'ja' ? ja : en)[type] || type || '';
  }

  function pubHref(x, lang) { return x.url || (x.links && x.links[0] && x.links[0].url) || path('publications', lang); }

  function pubRow(D, x, lang) {
    var status = pick(x, 'statusJa', 'status', lang);
    var kicker = pubTypeLabel(x.type, lang) + (x.year ? ' · ' + x.year : '') + (status ? ' · ' + status : '');
    var href = pubHref(x, lang);
    var authors = (x.authors || []).map(function (a) {
      if (typeof a !== 'string') {
        return '<span style="display:flex;align-items:center;gap:8px;font-size:13px">' + avatar(a, 'av-26', lang) + '<span>' + esc(memberName(a, lang)) + '</span></span>';
      }
      var m = member(D, a) || { handle: a, name: a };
      return '<a href="' + esc(path('person', lang, m.handle)) + '">' + avatar(m, 'av-26', lang) + '<span>' + esc(memberName(m, lang) || a) + '</span></a>';
    }).join('');
    var tags = (x.tags || []).map(function (tg) { return '<span class="tag">' + esc(tg) + '</span>'; }).join('');
    var links = (x.links || []).map(function (l) {
      return '<a class="lnk" href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + '</a>';
    }).join('');
    var fig = asset(pick(x, 'figureJa', 'figure', lang));
    var title = pick(x, 'titleJa', 'title', lang);
    var summary = pick(x, 'summaryJa', 'summary', lang);
    return '<article class="prod">' +
      '<div class="prod-body">' +
      '<span class="k">' + esc(kicker) + '</span>' +
      '<a class="t" href="' + esc(href) + '"' + (isInternal(href) ? '' : ' target="_blank" rel="noopener"') + '>' + esc(title) + '</a>' +
      '<span class="m">' + esc(pick(x, 'venueJa', 'venue', lang)) + '</span>' +
      (summary ? '<p class="sum">' + esc(summary) + '</p>' : '') +
      (authors ? '<div class="authors">' + authors + '</div>' : '') +
      ((tags || links) ? '<div class="chips">' + tags + links + '</div>' : '') +
      '</div>' +
      (fig ? '<a class="fig" href="' + esc(fig) + '" target="_blank" rel="noopener"><img src="' + esc(fig) + '" alt="' + esc(title) + '" loading="lazy"></a>' : '') +
      '</article>';
  }

  function productRow(x, lang) {
    var links = (x.links || []).map(function (l) {
      return '<a class="lnk" href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(pick(l, 'labelJa', 'label', lang)) + '</a>';
    }).join('');
    var name = pick(x, 'nameJa', 'name', lang);
    var summary = pick(x, 'summaryJa', 'summary', lang);
    return '<article class="prod">' +
      '<div class="prod-body">' +
      '<span class="k">' + esc(pick(x, 'dateJa', 'date', lang)) + '</span>' +
      '<a class="t" href="' + esc(x.url) + '" target="_blank" rel="noopener">' + esc(name) + '</a>' +
      (summary ? '<p class="sum">' + esc(summary) + '</p>' : '') +
      (links ? '<div class="chips">' + links + '</div>' : '') +
      '</div>' +
      (x.image ? '<a class="prod-pic" href="' + esc(x.url) + '" target="_blank" rel="noopener"><img src="' + esc(asset(x.image)) + '" alt="' + esc(name) + '"></a>' : '') +
      '</article>';
  }

  function memberPubs(D, handle) {
    return ((D && D.publications) || []).filter(function (x) { return (x.authors || []).indexOf(handle) !== -1; });
  }

  /* ---------- Page state ----------
     r = parsePath() result. ui = { filter, project } (client-side choices; defaults for the build).
     Returns { page, purpose, html: {id: innerHTML}, text: {id: textContent}, hidden: {id: bool} }. */
  function pageState(D, r, lang, ui) {
    ui = ui || {};
    D = D || {};
    var members = D.members || [];
    var pubs = D.publications || [];
    var page = pageOf(r.route);
    var purpose = r.route === 'apply' || r.route === 'newsletter' ? r.route : 'question';
    var st = { page: page, purpose: purpose, html: {}, text: {}, hidden: {} };
    var soon = tr(lang, '準備中です。', 'Coming soon.');

    if (page === 'team') {
      st.html.teamGrid = members.length ? teamGrid({ members: members }, lang) : '';
      st.text.teamEmpty = members.length ? '' : soon;
      st.hidden.teamEmpty = !!members.length;
    }

    if (page === 'person') {
      var m = member(D, r.handle);
      if (m) {
        var mine = memberPubs(D, m.handle);
        st.text.personHandle = '@' + m.handle;
        st.html.personPhoto = avatarInner(m, lang);
        st.text.personName = memberName(m, lang);
        st.text.personRole = pick(m, 'roleJa', 'role', lang);
        st.text.personBio = pick(m, 'bioJa', 'bio', lang);
        st.html.personLinks = (m.links || []).map(function (l) {
          return '<a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + '</a>';
        }).join('');
        st.hidden.personRelated = !mine.length;
        st.text.relatedLabel = tr(lang, '関連する論文・講演・記事', 'RELATED WORK');
        st.html.personPubs = mine.map(function (x) {
          var href = x.url || path('publications', lang);
          return '<div class="row"><a href="' + esc(href) + '"' + (isInternal(href) ? '' : ' target="_blank" rel="noopener"') + '>' +
            esc(pick(x, 'titleJa', 'title', lang)) + '</a><span>' + esc(pick(x, 'venueJa', 'venue', lang)) + '</span></div>';
        }).join('');
      }
    }

    if (page === 'publications') {
      var filter = ui.filter || 'all';
      var defs = [
        { key: 'all', label: tr(lang, 'すべて', 'All') },
        { key: 'paper', label: tr(lang, '論文', 'Papers') },
        { key: 'talk', label: tr(lang, '講演', 'Talks') },
        { key: 'article', label: tr(lang, '記事', 'Articles') }
      ];
      var items = pubs.filter(function (x) { return filter === 'all' || x.type === filter; });
      st.text.pubsLabel = tr(lang, '論文・講演・記事', 'PAPERS, TALKS & ARTICLES');
      st.html.pubFilters = defs.map(function (f) {
        return '<button type="button" data-filter="' + f.key + '" aria-pressed="' + (filter === f.key) + '">' + esc(f.label) + '</button>';
      }).join('');
      st.html.pubList = items.map(function (x) { return pubRow(D, x, lang); }).join('');
      st.hidden.pubList = !items.length;
      st.hidden.pubsEmpty = !!items.length;
      st.text.pubsEmpty = soon;
    }

    if (page === 'products') {
      var prods = D.products || [];
      st.html.prodList = prods.map(function (x) { return productRow(x, lang); }).join('');
      st.hidden.prodList = !prods.length;
      st.hidden.prodEmpty = !!prods.length;
      st.text.prodEmpty = soon;
    }

    if (page === 'research') {
      var project = ui.project || 'ps';
      st.html.ptabs = [
        { key: 'ps', label: '01 Production Survivability' },
        { key: 'dg', label: '02 Direction Generation' }
      ].map(function (x) {
        return '<button type="button" data-project="' + x.key + '" aria-pressed="' + (project === x.key) + '">' + esc(x.label) + '</button>';
      }).join('');
    }

    // The join page also fills the (hidden) contact form labels, as the original script did.
    if (page === 'contact' || page === 'join') {
      st.text.cPurposeLabel = tr(lang, 'お問い合わせの種別', 'PURPOSE');
      st.html.cPurposes = [
        { key: 'question', label: tr(lang, '質問したい', 'Ask a question') },
        { key: 'newsletter', label: tr(lang, 'ニュースレターに登録したい', 'Subscribe to the newsletter') },
        { key: 'apply', label: tr(lang, '応募したい', 'Apply') }
      ].map(function (x) {
        return '<button type="button" data-purpose="' + x.key + '" aria-pressed="' + (purpose === x.key) + '">' + esc(x.label) + '</button>';
      }).join('');
      st.text.lName = tr(lang, 'お名前 *', 'Name *');
      st.text.lEmail = tr(lang, 'メールアドレス *', 'Email *');
      st.text.lOrg = tr(lang, 'ご所属・学校名（任意）', 'Organisation or school (optional)');
      st.text.lPhone = tr(lang, '携帯電話番号 *', 'Mobile phone *');
      st.text.lOrcid = 'ORCID URL *';
      st.text.lLinkedin = 'LinkedIn URL *';
      st.text.lInstagram = 'Instagram URL *';
      st.text.lGithub = 'GitHub URL *';
      st.text.lDribbble = tr(lang, 'Dribbble URL（任意）', 'Dribbble URL (optional)');
      st.text.lCv = tr(lang, '履歴書（PDF） *', 'Résumé (PDF) *');
      st.text.lVideo = tr(lang, '自己紹介動画（1分以内：自己紹介＋熱意＋希望研究テーマ） *', 'Self-introduction video (under 1 min) *');
      st.text.lOr = tr(lang, 'または', 'or');
      st.text.lMsg = purpose === 'apply'
        ? tr(lang, '応募の動機・自己紹介 *', 'Why you are applying, and about you *')
        : tr(lang, 'ご質問・ご相談内容 *', 'Your question *');
      st.text.lOptin = tr(lang, '今後のアップデートおよびご案内を受信する', 'Receive future updates and announcements');
      st.text.lFine = tr(lang, "回答には時間がかかることがあります。また、ご希望に添えないこともあります。お問い合わせいただいた内容は、お問い合わせ目的およびその回答のみのために使用します。「送信する」を押すことにより、ご入力いただいた個人情報を本件の連絡のために利用することに同意したことになります。「今後のアップデートおよびご案内を受信する」にチェックをいただきますと、今後、OZU ResearchおよびOZU Inc.に関連するご連絡をさせていただく場合があります。", "A reply may take some time, and we may be unable to accommodate every request. Your submission is used solely for the stated purpose and our reply. By pressing “Send”, you agree that the details you enter may be used to contact you about this enquiry. If you check “receive future updates and announcements,” we may contact you about OZU Research and OZU Inc.");
      st.text.cSubmit = tr(lang, '送信する', 'Send');
      st.text.lNote = purpose === 'apply'
        ? tr(lang, '履歴書と自己紹介動画を添えて送信できます。', 'Attach your résumé and video, then send.')
        : tr(lang, '送信するとメールが作成されます。', 'Sending opens a pre-filled email.');
      ['fOrcid', 'fLinkedin', 'fInstagram', 'fGithub', 'fDribbble', 'fCv', 'fVideo'].forEach(function (id) {
        st.hidden[id] = purpose !== 'apply';
      });
      st.hidden.fPhone = purpose === 'newsletter';
      st.hidden.fOrg = false;
      st.hidden.fMsg = purpose === 'newsletter';
      st.text.joinCta = tr(lang, 'お問い合わせフォーム', 'Contact form');
    }

    return st;
  }

  /* ---------- Page meta (title / description / canonical) ---------- */

  var LABELS = {
    home: ['ホーム', 'Home'], about: ['概要', 'About'], team: ['チーム', 'Team'], research: ['リサーチ', 'Research'],
    products: ['プロダクト', 'Products'], publications: ['パブリケーション', 'Publications'], locations: ['ロケーション', 'Locations'],
    contact: ['お問い合わせ', 'Contact'], apply: ['応募', 'Apply'], newsletter: ['ニュースレター登録', 'Newsletter'], join: ['Join the team', 'Join the team']
  };

  var DESCRIPTIONS = {
    home: ['OZU Research は株式会社OZU の研究開発組織です。東京とスラバヤの二拠点で、商用に耐える生成 AI をつくるための研究（Production Survivability）とプロダクト開発を行っています。',
      'OZU Research is the research and development lab of OZU Inc., operating from two sites, Tokyo and Surabaya. We research and build generative AI that can ship in commercial production (Production Survivability).'],
    about: ['OZU Research は、生成 AI を「見栄えのする出力」から「実際に納品できる制作」へと引き上げる研究開発組織です。武蔵野大学と連携する研究体制のもと、日本・インドネシア・タイにまたがる国際チームで運営しています。',
      'OZU Research is an R&D organisation that takes generative AI from good-looking output to production that can actually be delivered, run with Musashino University by an international team across Japan, Indonesia and Thailand.'],
    research: ['OZU Research の研究プロジェクト：生成 AI の出力が商用に耐えるかを測定可能な構念として定式化する Production Survivability と、演出計画の生成を制約充足問題として定式化する Constraint-Based Direction Generation。',
      'OZU Research projects: Production Survivability, which formalises whether generative AI output can ship commercially as a measurable construct, and Constraint-Based Direction Generation for professional-quality video production.'],
    publications: ['OZU Research の論文・講演・記事。生成 AI を商用に耐える制作へ引き上げる研究の成果を、国際会議やジャーナルで発表しています。',
      'Papers, talks and articles from OZU Research: research on making generative AI ship in commercial production, presented at international conferences and in journals.'],
    locations: ['OZU Research の拠点：東京ラボ（〒150-0001 東京都渋谷区神宮前3-35-2 クローチェ神宮前ビル5F）とスラバヤ・ラボ（Politeknik Elektronika Negeri Surabaya, インドネシア）。',
      'OZU Research sites: Tokyo Lab (Croce Jingumae Bldg. 5F, 3-35-2 Jingumae, Shibuya-ku, Tokyo) and Surabaya Lab (Politeknik Elektronika Negeri Surabaya, Surabaya, Indonesia).'],
    contact: ['ご質問、ニュースレターの登録、OZU Research への応募は、こちらからお送りください。',
      'Send us a question, sign up for the newsletter, or apply to OZU Research.'],
    apply: ['OZU Research への応募フォーム。履歴書と自己紹介動画を添えて送信できます。',
      'Apply to OZU Research. Attach your résumé and self-introduction video, then send.'],
    newsletter: ['OZU Research のニュースレター登録フォーム。',
      'Sign up for the OZU Research newsletter.'],
    join: ['OZU Research のメンバー募集。', 'Join the OZU Research team.']
  };

  function truncate(s, n) {
    s = String(s || '').replace(/\s+/g, ' ').trim();
    if (s.length <= n) return s;
    var cut = s.slice(0, n - 1);
    var sp = cut.lastIndexOf(' ');
    if (sp > n * 0.6) cut = cut.slice(0, sp);
    return cut.replace(/[\s,、。.;:]+$/, '') + '…';
  }

  function pageMeta(D, r, lang) {
    D = D || {};
    var i = lang === 'ja' ? 0 : 1;
    var title, description;
    if (r.route === 'home') {
      title = tr(lang, 'OZU Research | 株式会社OZU の研究開発組織', 'OZU Research | R&D lab of OZU Inc.');
      description = DESCRIPTIONS.home[i];
    } else if (r.route === 'person') {
      var m = member(D, r.handle) || { handle: r.handle, name: r.handle };
      var name = memberName(m, lang);
      title = name + tr(lang, ' | OZU Research チーム', ' | OZU Research Team');
      description = truncate(name + tr(lang, '：', ': ') + (pick(m, 'bioJa', 'bio', lang) || pick(m, 'roleJa', 'role', lang)), lang === 'ja' ? 120 : 160);
    } else {
      title = LABELS[r.route][i] + ' | OZU Research';
      if (r.route === 'team') {
        var names = (D.members || []).map(function (x) { return memberName(x, lang); });
        description = truncate(tr(lang, '東京とスラバヤを拠点に研究・開発を行う OZU Research のチーム：' + names.join('、') + '。',
          'The OZU Research team, working from Tokyo and Surabaya: ' + names.join(', ') + '.'), lang === 'ja' ? 120 : 160);
      } else if (r.route === 'products') {
        var prods = (D.products || []).map(function (x) { return pick(x, 'nameJa', 'name', lang); });
        description = truncate(tr(lang, 'OZU Research のプロダクト：' + prods.join('、') + '。',
          'Products from OZU Research: ' + prods.join('; ') + '.'), lang === 'ja' ? 120 : 160);
      } else {
        description = DESCRIPTIONS[r.route][i];
      }
    }
    // apply / newsletter / join are form variants or TBD: noindex, and a self canonical
    // so Google does not get a mixed canonical + noindex signal.
    var indexable = ['apply', 'newsletter', 'join'].indexOf(r.route) === -1;
    return {
      title: title,
      description: description,
      label: r.route === 'person' ? title.split(' | ')[0] : LABELS[r.route][i],
      url: BASE + path(r.route, lang, r.handle),
      canonical: BASE + path(r.route, lang, r.handle),
      indexable: indexable,
      robots: indexable ? '' : 'noindex,follow',
      alternates: indexable ? { ja: BASE + path(r.route, 'ja', r.handle), en: BASE + path(r.route, 'en', r.handle) } : null,
      locale: lang === 'ja' ? 'ja_JP' : 'en_US',
      localeAlt: lang === 'ja' ? 'en_US' : 'ja_JP'
    };
  }

  return {
    BASE: BASE,
    PAGES: PAGES,
    HTML_IDS: HTML_IDS,
    TEXT_IDS: TEXT_IDS,
    esc: esc,
    pick: pick,
    asset: asset,
    absolute: absolute,
    path: path,
    parsePath: parsePath,
    legacyPath: legacyPath,
    localize: localize,
    pageOf: pageOf,
    member: member,
    memberName: memberName,
    memberPubs: memberPubs,
    pubHref: pubHref,
    pageState: pageState,
    pageMeta: pageMeta
  };
});

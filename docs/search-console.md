# Search Console 登録手順

サイト: https://ozuresearch.github.io/

## 1. Google Search Console に登録

1. https://search.google.com/search-console を開く
2. 「プロパティを追加」で **URL プレフィックス** を選び、`https://ozuresearch.github.io/` を入力する
   (github.io ではドメイン所有権を確認できないので、「ドメイン」タイプは使えません)
3. 所有権の確認方法を選ぶ
   - **HTML タグ(推奨)**: 表示される `<meta name="google-site-verification" content="...">` の `content` の値(トークン)を開発担当に送ってください。head テンプレートに追加して公開します。追加後に「確認」を押します
   - **Google アナリティクス**: 同じ Google アカウントの GA4 タグがサイトに入っている場合のみ使えます

## 2. サイトマップを送信

1. 左メニュー「サイトマップ」を開く
2. `sitemap.xml` と入力して送信する
3. ステータスが「成功しました」になればOK

## 3. インデックス登録をリクエスト

左メニュー上部の「URL検査」に次の URL を1つずつ入力し、「インデックス登録をリクエスト」を押します。

- `https://ozuresearch.github.io/`
- `https://ozuresearch.github.io/about/`
- `https://ozuresearch.github.io/research/`
- `https://ozuresearch.github.io/publications/`
- `https://ozuresearch.github.io/en/`

## 4. Bing Webmaster Tools

1. https://www.bing.com/webmasters を開く
2. 「Google Search Console からインポート」を選ぶと、手順1の登録がそのまま引き継がれる
3. インポート後、サイトマップも取り込まれていることを確認する

補足: Bing は IndexNow(更新を即時に通知する仕組み)にも対応しています。更新が多くなったら導入を検討してください。ChatGPT 検索や Copilot は Bing のインデックスを参照するため、Bing への登録は AI 検索対策としても有効です。

## 5. 1〜2週間後に確認すること

- Search Console「ページ」(インデックス作成)レポート: 登録した URL が「インデックス登録済み」になっているか
- 「インデックス未登録」がある場合は理由を確認する(クロール済み未登録、重複、noindex など)
- 「サイトマップ」で検出された URL 数が想定どおりか
- 「検索パフォーマンス」で表示回数とクリック数が出始めているか(数週間かかることがあります)

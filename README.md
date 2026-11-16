# website
OZU Research Website

## 編集と SEO ページの生成

- コンテンツは `data.js` と `index.html` にあります。
- 編集後に `node scripts/build.mjs` を実行すると、SEO 用の各ページ、`sitemap.xml`、`llms.txt` が再生成されます (Node 18 以上、依存パッケージなし)。
- `main` に push すると GitHub Action (`.github/workflows/build-seo.yml`) が自動で同じ処理を行い、変更があれば `Regenerate SEO pages` としてコミットします。
- Action が push に失敗する場合は、`main` のブランチ保護が `github-actions[bot]` の push を止めていないか確認してください。止まっていても、ローカルでビルドしてから push すれば問題ありません。

Content lives in `data.js` and `index.html`. Run `node scripts/build.mjs` to regenerate the prerendered pages, `sitemap.xml` and `llms.txt`; the GitHub Action does this automatically on push to `main`.

## URL 構造

- 日本語: `/about/`, `/research/`, `/publications/` など
- 英語: `/en/about/`, `/en/research/` など
- メンバー: `/team/<handle>/`

## 検索エンジン登録

Search Console などの手順は [docs/search-console.md](docs/search-console.md) を参照してください。

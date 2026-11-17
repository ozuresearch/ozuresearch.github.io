# 利用規約（Terms of Use）

OZU Research の製品の利用規約の正本です。各製品のサイトは、ここにあるファイルを公開 URL から読み込んで表示します。
`main` に入れば、各サイトをデプロイしなくても数分で反映されます（GitHub Pages の反映とキャッシュの分）。

| 製品 | ファイル | 公開 URL | 表示するページ |
|---|---|---|---|
| OZU Co Production Manager | `co-production-manager.ja.md` | https://ozuresearch.github.io/terms/co-production-manager.ja.md | co-production-manager-web の `/terms` |

## 書き方

- 先頭のフロントマターに `version`（版、例 `2026-12-01`）と `effective`（施行日）を書きます。改定のたびに `version` を変えてください。サイトはこの値を「版」「施行日」として表示します。
- 本文は Markdown です。HTML タグは表示側で無効になります（そのまま文字として出ます）。
- 英語版・インドネシア語版を置く場合は `co-production-manager.en.md` / `co-production-manager.id.md` とします。ない言語は日本語版を表示します。
- 変更は PR で行い、法務の確認を経てから `main` にマージしてください。履歴は git に残ります。

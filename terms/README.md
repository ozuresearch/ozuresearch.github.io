# 規約・方針（/terms/）

株式会社 OZU（OZU Research を含む）の規約・方針の正本です。
各サイトは、ここにある Markdown を公開 URL から読み込んで表示します。`main` に入れば、各サイトをデプロイしなくても数分で反映されます（GitHub Pages の公開とキャッシュの分）。

## 構成

```
terms/
  README.md                      この説明
  privacy/                       OZU 共通：個人情報保護方針
    ja.md
  co-production-manager/         製品ごと：OZU Co Production Manager 利用規約
    ja.md
```

- **OZU 共通の文書**（個人情報保護方針など）は `terms/<文書名>/` に置き、どの製品からも同じものを参照します。
- **製品ごとの利用規約**は `terms/<製品名>/` に置きます。製品が増えたらフォルダを足してください。
- 言語ごとに `ja.md` / `en.md` / `id.md`。表示側は、その言語がなければ日本語版（`ja.md`、正本）を表示します。

| 文書 | 公開 URL | 表示するページ |
|---|---|---|
| 個人情報保護方針（共通） | https://ozuresearch.github.io/terms/privacy/ja.md | co-production-manager-web の `/privacy` |
| OZU Co Production Manager 利用規約 | https://ozuresearch.github.io/terms/co-production-manager/ja.md | co-production-manager-web の `/terms` |

## 書き方

- 先頭のフロントマターに `title`、`version`（版、例 `2026-12-01`）、`effective`（施行日）を書きます。改定のたびに `version` を変えてください。サイトはこれを「版」「施行日」として表示し、同意した版の記録にも使います。
- 本文は Markdown です。HTML タグは表示側で無効になります（そのまま文字として出ます）。
- 変更は PR で行い、法務の確認を経てから `main` にマージしてください。履歴は git に残ります。
- ファイルの場所（URL）を変えると、読み込んでいるサイトが表示できなくなります。移す場合は、先に各サイト側を更新してください。

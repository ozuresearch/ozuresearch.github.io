# 規約・方針（/terms/）

株式会社 OZU（OZU Research を含む）の規約・方針の正本です。
各サイトは、ここにある Markdown を公開 URL（`https://ozuresearch.github.io/terms/<ファイル名>`）から読み込んで表示します。`main` に入れば、各サイトをデプロイしなくても数分で反映されます（GitHub Pages の公開とキャッシュの分）。

## ファイル名

すべてこのフォルダの直下に置き、次の形で名前を付けます。

```
<文書>.<製品>.<言語>.md     製品ごとの文書（例：terms.co-production-manager.ja.md）
<文書>.<言語>.md            OZU 共通の文書（例：privacy.ja.md）
```

| 文書 | 意味 | 範囲 |
|---|---|---|
| `privacy` | 個人情報保護方針 | OZU 共通 |
| `terms` | 利用規約 | 製品ごと |
| `sla` | サービスレベル合意（SLA） | 製品ごと |
| `sctl` | 特定商取引法に基づく表記 | 製品ごと |

- 製品名：`co-production-manager`（OZU Co Production Manager）。製品が増えたら、同じ形でファイルを足してください。
- 言語：`ja`（日本語・正本）/ `en` / `id`。表示側は、その言語のファイルを読めなければ日本語版を表示します。

## 現在のファイル

| ファイル | 表示するページ |
|---|---|
| `privacy.{ja,en,id}.md` | co-production-manager-web の `/privacy` |
| `terms.co-production-manager.{ja,en,id}.md` | co-production-manager-web の `/terms` |
| `sla.co-production-manager.{ja,en,id}.md` | （表示ページは未作成） |
| `sctl.co-production-manager.{ja,en,id}.md` | （表示ページは未作成） |

## 書き方

- 先頭のフロントマターに `title`、`version`（版、例 `2026-12-01`）、`effective`（施行日）を書きます。改定のたびに `version` を変えてください。サイトはこれを「版」「施行日」として表示し、同意した版の記録にも使います。
- 本文は Markdown です。HTML タグは表示側で無効になります（そのまま文字として出ます）。
- 日本語版が正本です。英語版・インドネシア語版は日本語版に合わせて更新してください。
- 変更は PR で行い、法務の確認を経てから `main` にマージしてください。履歴は git に残ります。
- ファイル名（URL）を変えると、読み込んでいるサイトが表示できなくなります。変える場合は、先に各サイト側を更新してください。

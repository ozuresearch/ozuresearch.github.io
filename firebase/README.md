# Firebase 設定手順（お問い合わせフォーム）

フォームは Cloud Storage にファイルをアップロードし、Firestore に本文を保存します。
通知メールは Firestore の「Trigger Email from Firestore」拡張機能で research@ozu-inc.com に送ります。

## 1. Web アプリ設定を貼る

Firebase コンソール → プロジェクトの設定 → マイアプリ → Web アプリ → SDK の設定と構成 の値を
リポジトリ直下の `firebase-config.js` にコピーします（apiKey は公開前提の値です）。
未設定のままでもフォームは動作し、mailto 送信にフォールバックします。

## 2. Firestore と Storage を有効化してルールを適用

```bash
cd ~/firebase/ozuresearch-website
firebase login
firebase use --add            # OZU Research の Firebase プロジェクトを選択
firebase deploy --only firestore:rules,storage
```

`firebase.json` が無い場合は、この2行を含む最小構成を作ってください:

```json
{
  "firestore": { "rules": "firebase/firestore.rules" },
  "storage": { "rules": "firebase/storage.rules" }
}
```

ルールは「作成のみ許可・読み取り禁止」です。応募内容は Firebase コンソールから確認します。

## 3. 通知メール（Trigger Email from Firestore）

1. コンソール → Extensions → 「Trigger Email from Firestore」をインストール（Blaze プランが必要）
2. 設定値
   - Email documents collection: `mail`
   - SMTP connection URI: 送信に使うメールサーバ（例 Google Workspace の SMTP リレー、SendGrid など）
   - Default FROM: no-reply@ozu-inc.com
3. `enquiries` に新規ドキュメントが作られたら `mail` に転記する Cloud Function を1つ用意します（`functions/index.js`）:

```js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.notifyEnquiry = functions.firestore
  .document('enquiries/{id}')
  .onCreate(async (snap) => {
    const d = snap.data();
    const rows = Object.entries(d)
      .filter(([k]) => k !== 'createdAt')
      .map(([k, v]) => \`\${k}: \${v}\`)
      .join('\\n');
    await admin.firestore().collection('mail').add({
      to: 'research@ozu-inc.com',
      replyTo: d.email || undefined,
      message: {
        subject: \`[OZU Research] \${d.purpose} — \${d.name || ''}\`,
        text: rows
      }
    });
  });
```

デプロイ:

```bash
firebase deploy --only functions:notifyEnquiry
```

## 4. 動作確認

サイトのお問い合わせページから送信し、Firestore の `enquiries`、Storage の `enquiries/<id>/`、
そして research@ozu-inc.com への受信を確認します。

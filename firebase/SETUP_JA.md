# OZU Research 用 Firebase プロジェクトの作成とフォーム接続手順

対象リポジトリ: github.com/ozuresearch/ozuresearch.github.io（ローカル `~/firebase/ozuresearch-website`）
サイト: https://ozuresearch.github.io/
通知先: research@ozu-inc.com

aix.sc のプロジェクトとは分離し、OZU Research 専用の新規プロジェクトを作ります。

---

## 1. プロジェクトを作る（コンソール）

1. https://console.firebase.google.com/ を ozu-inc.com のアカウントで開く
2. 「プロジェクトを追加」→ プロジェクト名: `ozu-research`
   （プロジェクトIDは `ozu-research` か `ozu-research-xxxxx` になります。控えておく）
3. Google アナリティクスは不要（オフでよい）
4. 作成後、左下の歯車 → 「使用量と請求」→ プラン: **Blaze（従量課金）** に変更
   - 通知メール拡張（Trigger Email）と Cloud Functions が Blaze 必須
   - 無料枠内なら実質0円。念のため「予算アラート」を月1,000円などで設定しておく

## 2. Firestore と Storage を有効化

1. 左メニュー「Firestore Database」→ データベースを作成
   - 本番モードで開始（ルールは後で当てます）
   - ロケーション: `asia-northeast1`（東京）
2. 左メニュー「Storage」→ 開始
   - 本番モード、ロケーションは Firestore と同じ `asia-northeast1`

## 3. Web アプリを登録して設定を貼る

1. 歯車 → プロジェクトの設定 → 「マイアプリ」→ Web（`</>`）
2. アプリのニックネーム: `ozuresearch-site`。Hosting は使わないのでチェック不要
3. 表示される `firebaseConfig` の値を、リポジトリ直下の `firebase-config.js` に転記

```js
window.OZU_FIREBASE = {
  apiKey: "AIza…",
  authDomain: "ozu-research.firebaseapp.com",
  projectId: "ozu-research",
  storageBucket: "ozu-research.firebasestorage.app",
  messagingSenderId: "…",
  appId: "1:…:web:…"
};
```

apiKey は公開前提の識別子なので、GitHub Pages に置いても問題ありません（保護はルールで行います）。

## 4. Storage の CORS を許可（ブラウザから直接アップロードするため）

```bash
cd ~/firebase/ozuresearch-website
cat > /tmp/cors.json <<'JSON'
[{"origin":["https://ozuresearch.github.io","http://localhost:8080"],"method":["GET","PUT","POST","HEAD"],"responseHeader":["Content-Type","x-goog-resumable"],"maxAgeSeconds":3600}]
JSON
gcloud auth login
gcloud config set project <PROJECT_ID>
gsutil cors set /tmp/cors.json gs://<STORAGE_BUCKET>
```

`<STORAGE_BUCKET>` は `firebase-config.js` の `storageBucket` の値。
gcloud/gsutil が無い場合は https://cloud.google.com/sdk/docs/install からインストールします。

## 5. ルールを適用

```bash
cd ~/firebase/ozuresearch-website
npm i -g firebase-tools           # 初回のみ
firebase login
firebase use --add                # 作成した ozu-research を選び、エイリアス default
firebase deploy --only firestore:rules,storage
```

同梱の `firebase.json` がこの2つのルールファイルを指しています。
ルールは「作成のみ許可・読み取り／更新／削除は禁止」です。応募内容はコンソールから確認します。

## 6. 通知メールを設定（research@ozu-inc.com 宛）

### 6-1. Trigger Email 拡張をインストール

1. 左メニュー「Extensions」→ 「Trigger Email from Firestore」→ インストール
2. 主な設定値
   - Email documents collection: `mail`
   - SMTP connection URI:
     - Google Workspace を使う場合: `smtps://research@ozu-inc.com@smtp.gmail.com:465`
       （パスワードはアプリパスワードを Secret Manager に登録）
     - SendGrid の場合: `smtps://apikey@smtp.sendgrid.net:465`
   - Default FROM: `OZU Research <no-reply@ozu-inc.com>`

### 6-2. enquiries → mail に転記する Function をデプロイ

```bash
cd ~/firebase/ozuresearch-website
firebase init functions          # JavaScript / ESLint なし / 依存はインストールする
```

`functions/index.js` を同梱の `firebase/functions-notifyEnquiry.js` の内容にして:

```bash
firebase deploy --only functions:notifyEnquiry
```

## 7. 動作確認

1. https://ozuresearch.github.io/#apply を開き、テスト応募を送信
2. Firestore → `enquiries` に1件、Storage → `enquiries/<id>/` にファイル
3. research@ozu-inc.com にメールが届く
4. 届かない場合: Functions のログ（コンソール → Functions → ログ）と `mail` コレクションの `delivery` フィールドを確認

## 8. 運用メモ

- 応募データはコンソールから閲覧（クライアントからは読めません）
- 個人情報を含むため、Storage の公開URLは共有しない
- 迷惑送信が増えた場合は Firebase App Check（reCAPTCHA v3）を追加するのが次の一手

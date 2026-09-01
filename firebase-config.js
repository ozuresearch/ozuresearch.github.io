/* Firebase 設定 — OZU Research（projectId: ozu-research）
   apiKey は公開前提の識別子です（保護は Firestore / Storage のルールで行います）。
   値の再確認: https://console.firebase.google.com/project/ozu-research/settings/general */
window.OZU_FIREBASE = {
  apiKey: "AIzaSyCRZ3tjxsI3C2tH-NNHJKQT1PBdrb8M08s",
  authDomain: "ozu-research.firebaseapp.com",
  projectId: "ozu-research",
  storageBucket: "ozu-research.firebasestorage.app",
  messagingSenderId: "57333859933",
  appId: "1:57333859933:web:a6f817ee71f5fba4cc6fb4"
};

/* 保存先（必要なら変更してください） */
window.OZU_FIREBASE_PATHS = {
  collection: "enquiries",          // Firestore のコレクション名
  storageFolder: "enquiries"        // Cloud Storage のフォルダ名
};

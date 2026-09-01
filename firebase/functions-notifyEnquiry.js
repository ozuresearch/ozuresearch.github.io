const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const TO = 'research@ozu-inc.com';
const LABELS = {
  purpose: '種別', name: 'お名前', email: 'メール', phone: '携帯電話',
  organisation: '所属', orcid: 'ORCID', linkedin: 'LinkedIn', instagram: 'Instagram',
  github: 'GitHub', dribbble: 'Dribbble', cvUrl: '履歴書', videoUrl: '自己紹介動画',
  videoLink: '動画リンク', optin: '今後の案内の受信', message: '本文', lang: '言語', page: '送信元'
};

exports.notifyEnquiry = functions
  .region('asia-northeast1')
  .firestore.document('enquiries/{id}')
  .onCreate(async (snap, context) => {
    const d = snap.data() || {};
    const order = ['purpose', 'name', 'email', 'phone', 'organisation', 'orcid', 'linkedin',
      'instagram', 'github', 'dribbble', 'cvUrl', 'videoUrl', 'videoLink', 'optin', 'lang', 'page', 'message'];
    const text = order
      .filter((k) => d[k] !== undefined && d[k] !== null && d[k] !== '')
      .map((k) => (LABELS[k] || k) + ': ' + (typeof d[k] === 'boolean' ? (d[k] ? '希望する' : '希望しない') : d[k]))
      .join('\n');

    await admin.firestore().collection('mail').add({
      to: TO,
      replyTo: d.email || undefined,
      message: {
        subject: '[OZU Research] ' + (d.purpose || 'enquiry') + ' — ' + (d.name || context.params.id),
        text: text
      }
    });
  });

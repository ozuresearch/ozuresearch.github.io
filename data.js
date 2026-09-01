/* OZU Research — site data.
   ここに追記するだけでサイトに反映されます（index.html の編集は不要）。

   members: {
     handle: "takahashi",              // URL は #@takahashi
     name: "高橋 佑輔",                 // 日本語表示名
     nameEn: "Yusuke Takahashi",
     roleJa: "研究員", role: "Researcher",
     photo: "assets/people/takahashi.jpg",   // 省略時はイニシャル表示
     bioJa: "…", bio: "…",
     links: [{ label: "ORCID", url: "https://orcid.org/…" }]
   }

   publications: {
     type: "paper" | "talk" | "article",
     year: 2026,
     title: "English title",  titleJa: "日本語タイトル",
     venue: "Conference name, City, Country",  venueJa: "会議名, 都市",
     authors: ["takahashi", "…"],            // members の handle（未登録の文字列も可）
     url: "https://…",                        // タイトルのリンク先
     tags: ["Topic"],
     links: [{ label: "PDF", url: "…" }, { label: "DOI", url: "…" }]
   }
*/
window.OZU_DATA = {
  members: [],
  publications: []
};

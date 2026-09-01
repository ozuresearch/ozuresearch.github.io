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
  members: [
    {
      handle: "shinjo",
      name: "新城 良明", nameEn: "Yoshiaki Shinjo",
      roleJa: "Head of Research, OZU Research", role: "Head of Research, OZU Research",
      photo: "assets/people/shinjo.png",
      bioJa: "OZU Research研究所長。株式会社OZU（東京・渋谷）代表取締役。AI時代の映像・VFX制作体制の構築を目指し、AI×クリエイティブ領域で映像制作・VFX・クリエイティブテクノロジーの開発・実装を手がける。2026年、インドネシアの名門ポリテクニックPENS（スラバヤ電子工学ポリテクニック）にAI×VFX研究拠点「OZU AIクリエイティブ・ラボ」を開設。タイ・チュラロンコン大学との国際インターンシップも並行して推進し、東南アジアを起点としたAI人材ネットワークの構築を進める。"
    },
    {
      handle: "takahashi",
      name: "高橋 雄介 博士", nameEn: "Yusuke Takahashi, PhD",
      roleJa: "Head of Research, OZU Research", role: "Head of Research, OZU Research",
      photo: "assets/people/takahashi.jpg",
      bioJa: "OZU Research共同研究所長。武蔵野大学データサイエンス学部 准教授。慶應義塾大学にてメディア・ガバナンス博士号取得。計算機科学者であり連続起業家。AIx{} を共同創業。AI対話型ランニングコーチ EKIDEN.AI を共同創業。直交化された意味空間に基づく適応的セマンティック基盤と知識ベースを研究する。シリコンバレーと東京でソフトウェアスタートアップを創業し、プロダクトデザイン・グロース・顧客開発に携わってきた。500 Startups 出身。"
    },
    {
      handle: "tamura",
      name: "田村 昂大", nameEn: "Takashiro Tamura",
      roleJa: "主任研究員", role: "Principal Researcher",
      photo: "assets/people/tamura.jpg",
      bioJa: "OZU Research主任研究員。株式会社OZU 国際・産学連携責任者。"
    },
    {
      handle: "obed",
      name: "オベド クリスチャン", nameEn: "Obed Christian",
      roleJa: "研究員", role: "Researcher",
      photo: "assets/people/obed.jpg",
      bioJa: "OZU Research研究員。武蔵野大学国際データサイエンス学部（MIDS）学部4年。スラバヤ工科大学（PENS）卒業。"
    },
    {
      handle: "wajdi",
      name: "アクマド ザヒル ワジ", nameEn: "Achmad Zahir Wajdi",
      roleJa: "研究員", role: "Researcher",
      bioJa: "OZU Research研究員。武蔵野大学国際データサイエンス学部（MIDS）学部4年。スラバヤ工科大学（PENS）卒業。"
    }
  ],
  publications: []
};

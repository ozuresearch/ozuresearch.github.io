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
  products: [
    {
      name: "pacutto — AI cut-sheet generator",
      nameJa: "カット表作成支援AIツール「ぱかっと」",
      dateJa: "2026年6月25日リリース", date: "Released June 25, 2026",
      summaryJa: "動画をアップロードするだけでAIがカット表の下書きを数分で作成。確認から編集までの作業時間を約60%削減。シーン検出・テロップ抽出・ナレーション書き起こし・PowerPoint出力を一気通貫で自動化。",
      summary: "Upload a video and AI drafts the cut sheet in minutes, cutting the time from review to edit by about 60%. Scene detection, on-screen text extraction, narration transcription and PowerPoint export run end to end.",
      url: "https://www.pacutto.com/",
      image: "assets/products/pacutto.png",
      links: [
        { label: "pacutto.com", url: "https://www.pacutto.com/" },
        { labelJa: "ニュースリリース", label: "News release", url: "https://ozu-inc.com/news/_8NP660c" }
      ]
    },
    {
      name: "OkiGO — morning habit app",
      nameJa: "朝の習慣化アプリ『OkiGO』",
      dateJa: "2026年4月6日リリース", date: "Released April 6, 2026",
      summaryJa: "行動経済学の「損失回避」の原理を活用し、意志力に頼らない習慣化を実現するサービス。ユーザーはポイントを預けて目標を宣言し、達成すればポイントを保持、未達成なら失う。アーリーアクセス版では朝のランニング習慣を支援し、目標時刻のアラームと位置情報によるチェックインで達成を計測する。",
      summary: "A habit app built on loss aversion from behavioural economics, so habits do not depend on willpower. Users stake points and declare a goal: meet it and the points stay, miss it and they are lost. The early-access version supports a morning running habit, measuring completion through an alarm at the target time and a location-based check-in.",
      url: "https://okigo.jp/",
      image: "assets/products/okigo.png",
      links: [
        { label: "okigo.jp", url: "https://okigo.jp/" },
        { labelJa: "ニュースリリース", label: "News release", url: "https://ozu-inc.com/news/MYIfUrjo" }
      ]
    },
    {
      name: "OASIS PASS — restroom queue solution",
      nameJa: "トイレ待機列ソリューション『OASIS PASS』",
      dateJa: "2025年8月20日リリース", date: "Released August 20, 2025",
      summaryJa: "野外フェスティバルや大型イベント会場のトイレ待機列問題を解決する統合型ソリューション。リアルタイム混雑可視化と誘導サポート、ダイナミックプライシング型「プレミアムトイレ」、無料トイレの一元管理ダッシュボードをまとめて提供する。2025年8月より実証実験を順次実施。",
      summary: "An integrated solution to restroom queues at outdoor festivals and large events, combining real-time congestion visualisation with on-site guidance, dynamically priced premium restrooms, and a dashboard that manages free restrooms in one place. Field trials began in August 2025.",
      url: "https://ozu-inc.com/news/20250820",
      image: "assets/products/oasis-pass.png",
      links: [
        { labelJa: "ニュースリリース", label: "News release", url: "https://ozu-inc.com/news/20250820" }
      ]
    }
  ],
  members: [
    {
      handle: "shinjo",
      name: "新城 良明", nameEn: "Yoshiaki Shinjo",
      roleJa: "Head of Research, OZU Research", role: "Head of Research, OZU Research",
      photo: "assets/people/shinjo.png",
      bio: "Head of Research at OZU Research and CEO of OZU Inc. (Shibuya, Tokyo). He builds video and VFX production pipelines for the AI era, developing and deploying creative technology across AI and creative work. In 2026 he opened the OZU AI Creative Lab, an AI×VFX research base at PENS (Politeknik Elektronika Negeri Surabaya) in Indonesia, and runs an international internship programme with Chulalongkorn University in Thailand, building a network of AI talent rooted in Southeast Asia.",
      bioJa: "OZU Research研究所長。株式会社OZU（東京・渋谷）代表取締役。AI時代の映像・VFX制作体制の構築を目指し、AI×クリエイティブ領域で映像制作・VFX・クリエイティブテクノロジーの開発・実装を手がける。2026年、インドネシアの名門ポリテクニックPENS（スラバヤ電子工学ポリテクニック）にAI×VFX研究拠点「OZU AIクリエイティブ・ラボ」を開設。タイ・チュラロンコン大学との国際インターンシップも並行して推進し、東南アジアを起点としたAI人材ネットワークの構築を進める。"
    },
    {
      handle: "takahashi",
      name: "高橋 雄介 博士", nameEn: "Yusuke Takahashi, PhD",
      roleJa: "Head of Research, OZU Research", role: "Head of Research, OZU Research",
      photo: "assets/people/takahashi.jpg",
      bio: "Co-Head of Research at OZU Research. Associate Professor, Faculty of Data Science, Musashino University. PhD in Media and Governance from Keio University. A computer scientist and serial entrepreneur, he co-founded AIx{} and EKIDEN.AI, a conversational AI running coach. His research concerns adaptive semantic infrastructure and knowledge bases built on orthogonalized meaning spaces. He has founded software startups in Silicon Valley and Tokyo, working across product design, growth and customer development. 500 Startups alumnus.",
      bioJa: "OZU Research共同研究所長。武蔵野大学データサイエンス学部 准教授。慶應義塾大学にてメディア・ガバナンス博士号取得。計算機科学者であり連続起業家。AIx{} を共同創業。AI対話型ランニングコーチ EKIDEN.AI を共同創業。直交化された意味空間に基づく適応的セマンティック基盤と知識ベースを研究する。シリコンバレーと東京でソフトウェアスタートアップを創業し、プロダクトデザイン・グロース・顧客開発に携わってきた。500 Startups 出身。"
    },
    {
      handle: "tamura",
      name: "田村 昂大", nameEn: "Takashiro Tamura",
      roleJa: "主任研究員", role: "Principal Researcher",
      photo: "assets/people/tamura.jpg",
      bio: "Principal Researcher at OZU Research. Head of international and industry–academia partnerships at OZU Inc.",
      bioJa: "OZU Research主任研究員。株式会社OZU 国際・産学連携責任者。"
    },
    {
      handle: "obed",
      name: "オベド クリスチャン", nameEn: "Obed Christian",
      roleJa: "研究員", role: "Researcher",
      photo: "assets/people/obed.jpg",
      bio: "Researcher at OZU Research. Fourth-year student, Musashino International Data Science (MIDS), Musashino University. Graduate of PENS, Surabaya.",
      bioJa: "OZU Research研究員。武蔵野大学国際データサイエンス学部（MIDS）学部4年。スラバヤ工科大学（PENS）卒業。"
    },
    {
      handle: "wajdi",
      name: "アクマド ザヒル ワジ", nameEn: "Achmad Zahir Wajdi",
      roleJa: "研究員", role: "Researcher",
      photo: "assets/people/wajdi.jpg",
      bio: "Researcher at OZU Research. Fourth-year student, Musashino International Data Science (MIDS), Musashino University. Graduate of PENS, Surabaya.",
      bioJa: "OZU Research研究員。武蔵野大学国際データサイエンス学部（MIDS）学部4年。スラバヤ工科大学（PENS）卒業。"
    }
  ],
  publications: [
    {
      type: "paper", year: 2026,
      statusJa: "採択（登壇予定）", status: "To appear",
      title: "Closing the Loop: Verdict-Informed Stopping for Autonomous Brand-Consistent Image Revision",
      titleJa: "ループを閉じる —— ブランド整合的な画像修正を自律化する判定情報型ストッピング",
      venue: "ICAST 2026, Surabaya, Indonesia, October 9–10, 2026",
      venueJa: "ICAST 2026, インドネシア・スラバヤ, 2026年10月9〜10日",
      authors: ["wajdi", "obed", "takahashi"],
      url: "https://aix.sc/publications/icast2026-closing-the-loop",
      figureJa: "assets/papers/icast2026-closing-the-loop-ja.png",
      figure: "assets/papers/icast2026-closing-the-loop-en.png",
      summaryJa: "生成AIによる広告画像の修正ループにおける「いつ止めるか」を扱う。6次元の実用到達度ルーブリックと修正可能性を付与した失敗モード分類を土台に、閉ループ修正エンジンと判定情報型ストッピング（VIS）を提案。ブランドXの7成果物・21回の実行で、収束率を維持しながら（81%対81%）生成呼び出しを28%削減した（59回対82回）。",
      summary: "Addresses when to stop in closed-loop revision of advertising images with generative AI. Building on a six-dimensional production-survivability rubric and a failure-mode taxonomy annotated with repairability, the paper proposes a closed-loop revision engine with Verdict-Informed Stopping (VIS). Across 7 deliverables and 21 runs for Brand X, VIS cut generation calls by 28% (59 vs. 82) while holding final convergence at 81%.",
      tags: ["Production_Survivability", "generative_AI", "closed-loop_revision", "verdict-informed_stopping", "advertising_technology"],
      links: [{ label: "AIx{} で読む", url: "https://aix.sc/publications/icast2026-closing-the-loop" }]
    },
    {
      type: "paper", year: 2026,
      statusJa: "発表済み", status: "Presented",
      title: "Will It Ship? Production Survivability of Generative AI for Commercial Video",
      titleJa: "これは納品できるか —— 商用映像における生成AIの実用到達度",
      venue: "IES 2026, Yogyakarta, Indonesia, August 1–3, 2026",
      venueJa: "IES 2026, インドネシア・ジョグジャカルタ, 2026年8月1〜3日",
      authors: ["obed", "wajdi", "tamura", "shinjo", "takahashi", { name: "浦木 麻子", nameEn: "Asako Uraki" }],
      url: "https://aix.sc/publications/ies2026-will-it-ship",
      figureJa: "assets/papers/ies2026-will-it-ship-ja.png",
      figure: "assets/papers/ies2026-will-it-ship-en.png",
      summaryJa: "商用のボディケアキャンペーンで実際に納品された7本のショート動画を基準に、11の生成モデル（画像4・動画7）を比較した埋め込み型ケーススタディ。実用到達度を6次元のルーブリックとして定義し、77セルの評価マトリクスで判定した。静止画はリファレンスを軸にしたプロンプト設計で商用水準に達する一方、動画は5〜8秒のチャンクに分割して得意なモデルへ振り分ける必要があり、人物の表情については試したすべてのモデルが実用の閾値に届かなかった。",
      summary: "An embedded case study comparing 11 generative models (4 image, 7 video) against seven short videos actually delivered for a commercial body-care campaign. Production survivability is defined as a six-dimensional rubric and judged over a 77-cell evaluation matrix. Stills reach commercial quality through reference-anchored prompting, while video must be split into 5–8 second chunks routed to the model best suited to each; for human facial expression, every model tested fell short of the usable threshold.",
      tags: ["Production_Survivability", "generative_AI", "commercial_video", "multimedia_quality", "model_routing"],
      links: [{ label: "AIx{} で読む", url: "https://aix.sc/publications/ies2026-will-it-ship" }]
    }
  ]
};

import { useState, useEffect } from "react";

function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 375);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

const isMobile  = (w) => w < 640;
const isTablet  = (w) => w >= 640 && w < 1024;
const isDesktop = (w) => w >= 1024;

const TABS = [
  { id: "sales",   label: "③ 営業スクリプト", shortLabel: "営業",  icon: "🎯", color: "#FF4B2B" },
  { id: "meeting", label: "② 会議・MTG",       shortLabel: "会議",  icon: "🤝", color: "#4B6FFF" },
  { id: "admin",   label: "① 事務処理",         shortLabel: "事務",  icon: "📋", color: "#00C9A7" },
];

const MONETIZE = {
  sales: {
    title: "営業スクリプト生成",
    models: [
      { name: "個人販売（単品）",       price: "¥3,980〜¥9,800／本",       note: "Brain・noteのDL商品" },
      { name: "月額サブスク",           price: "¥980〜¥2,980／月",          note: "業種別でセグメント化" },
      { name: "企業ライセンス",         price: "¥50,000〜¥300,000／年",     note: "営業チーム10名以上" },
      { name: "コンサル込みパッケージ", price: "¥500,000〜¥2,000,000",      note: "導入支援・カスタマイズ" },
    ],
    total: "月商 30〜300万円 が現実的なターゲットライン",
  },
  meeting: {
    title: "会議・MTG効率化",
    models: [
      { name: "テンプレDL販売",   price: "¥1,980〜¥4,980／本",    note: "議事録・アジェンダ自動化" },
      { name: "月額SaaS的販売",   price: "¥1,480〜¥3,980／月",    note: "Notionテンプレ連携型" },
      { name: "研修・セミナー",   price: "¥30,000〜¥150,000／回", note: "企業向けAI活用研修" },
      { name: "顧問契約",         price: "¥100,000〜¥300,000／月",note: "継続的な会議効率化支援" },
    ],
    total: "月商 20〜200万円 が現実的なターゲットライン",
  },
  admin: {
    title: "事務処理自動化",
    models: [
      { name: "プロンプト集販売", price: "¥2,980〜¥7,980／本",     note: "業務別・場面別で販売" },
      { name: "Udemy/教材化",     price: "¥9,800〜¥29,800／講座",  note: "AI×営業事務効率化コース" },
      { name: "SaaS化",           price: "¥2,000〜¥10,000／月",    note: "フォーム入力→即出力化" },
      { name: "BPO受託",          price: "¥200,000〜¥800,000／月", note: "AIを使った業務代行" },
    ],
    total: "月商 15〜150万円 が現実的なターゲットライン",
  },
};

const ADMIN_CATEGORIES = [
  { id: "crm",          label: "顧客データ入力・CRM更新",
    prompt: "# 役割\nあなたは営業DX支援の専門家AIです。\n\n# タスク\n以下の商談情報を整理し、CRM入力用テキストと次回アクション提案を出力してください。\n\n# 入力情報\n- 顧客名：{{顧客名}}\n- 商談日：{{商談日}}\n- 担当者：{{担当者名}}\n- 商談内容（メモ）：{{商談メモ}}\n- 現在のフェーズ：{{商談フェーズ（初回接触/ヒアリング/提案/クロージング等）}}\n\n# 出力フォーマット\n## 【CRM入力用サマリー】\n（200字以内で要点を整理）\n\n## 【次回アクション（TOP3）】\n1. \n2. \n3. \n\n## 【フォローメール文案】\n（件名と本文を出力）" },
  { id: "estimate",     label: "見積書・提案資料作成",
    prompt: "# 役割\nあなたは法人営業の提案書作成の専門家です。\n\n# タスク\n以下の情報をもとに、顧客に送付できる見積書の文章パーツと提案書構成案を作成してください。\n\n# 入力情報\n- 自社名・商品名：{{自社名・商品サービス名}}\n- 顧客名（法人）：{{顧客企業名}}\n- 提案内容の概要：{{提案内容}}\n- 金額（税抜）：{{金額}}円\n- 有効期限：{{見積有効期限}}\n- 備考・条件：{{特記事項}}\n\n# 出力フォーマット\n## 【見積書 頭書き文】\n## 【提案書 構成案（スライド5枚想定）】\n## 【金額の根拠・説明文】\n## 【よくある懸念点と切り返しトーク】" },
  { id: "email",        label: "メール・チャット文面作成",
    prompt: "# 役割\nあなたはビジネスコミュニケーションの専門家AIです。\n\n# タスク\n以下の状況に合わせたビジネスメール（または社内チャット文）を作成してください。\n\n# 入力情報\n- 送り先：{{送り先（顧客名 or 社内関係者）}}\n- 目的：{{メールの目的（アポ依頼/フォロー/謝罪/提案送付など）}}\n- 背景・文脈：{{前回のやり取りや状況}}\n- トーン：{{丁寧/カジュアル/謝罪/催促}}\n- 文字数目安：{{長め/短め/普通}}\n\n# 出力フォーマット\n## 【件名】\n## 【本文】\n## 【補足：送信前チェックリスト】" },
  { id: "expense",      label: "経費精算・出張精算補助",
    prompt: "# 役割\nあなたは経理・バックオフィス支援の専門家AIです。\n\n# タスク\n以下の出張・経費情報を整理し、申請書類の文章と上長への報告コメントを作成してください。\n\n# 入力情報\n- 出張・経費の目的：{{訪問目的・商談内容}}\n- 訪問先：{{訪問先名・場所}}\n- 日程：{{日付}}\n- 主な費用項目：{{交通費/宿泊費/接待費など＋金額}}\n- 備考：{{特記事項}}\n\n# 出力フォーマット\n## 【経費申請 目的コメント文】\n## 【上長への報告メモ（3行サマリー）】\n## 【注意点・添付書類チェックリスト】" },
  { id: "inquiry",      label: "顧客問い合わせ初期対応",
    prompt: "# 役割\nあなたは顧客サポート・営業アシスタントの専門家AIです。\n\n# タスク\n以下の問い合わせ内容に対して、初期対応メールの文案と社内エスカレーション判断基準を出力してください。\n\n# 入力情報\n- 顧客名・企業名：{{顧客名}}\n- 問い合わせ内容：{{問い合わせの詳細}}\n- 緊急度：{{高/中/低}}\n- 担当者が即答できるか：{{YES/NO}}\n\n# 出力フォーマット\n## 【初期返信メール文案】\n## 【社内エスカレーション判断（YES/NOチャート）】\n## 【同様の問い合わせへの対応マニュアル（3ステップ）】" },
  { id: "sales_report", label: "売上・実績入力・管理",
    prompt: "# 役割\nあなたは営業マネジメントと数値分析の専門家AIです。\n\n# タスク\n以下の実績データを分析し、上長への報告レポートと改善アクション提案を作成してください。\n\n# 入力情報\n- 対象期間：{{月/週}}\n- 目標数値：{{売上目標・件数目標}}\n- 実績数値：{{実際の売上・件数}}\n- 主な商談・受注内容：{{案件名と金額のリスト}}\n- 失注した案件と理由：{{失注案件・理由}}\n\n# 出力フォーマット\n## 【実績サマリー（達成率・前月比）】\n## 【上長向け報告コメント（3行）】\n## 【来月の改善アクション TOP3】\n## 【リカバリーが必要な案件と対策】" },
];

const MEETING_CATEGORIES = [
  { id: "agenda",          label: "アジェンダ・議事録作成",
    prompt: "# 役割\nあなたは会議ファシリテーション・議事録作成の専門家AIです。\n\n# タスク\n以下の会議情報をもとに、アジェンダと会議後の議事録テンプレートを作成してください。\n\n# 入力情報\n- 会議名：{{会議名}}\n- 参加者：{{参加者リスト}}\n- 目的・ゴール：{{この会議で決めたいこと}}\n- 事前共有事項：{{事前に参加者が知っておくべき情報}}\n- 時間：{{会議時間（分）}}\n\n# 出力フォーマット\n## 【アジェンダ（タイムテーブル付き）】\n## 【議事録テンプレート】\n## 【決定事項・ネクストアクション欄】\n## 【ファシリテーターへのアドバイス】" },
  { id: "1on1",            label: "1on1ミーティング準備",
    prompt: "# 役割\nあなたは営業マネジメントの専門家AIです。\n\n# タスク\n以下の情報をもとに、1on1ミーティングの準備シートと、上司への効果的な報告・相談の構成を作成してください。\n\n# 入力情報\n- 自分の役職・担当：{{役職・担当エリアや商材}}\n- 今月の目標vs実績：{{目標数値と現在の実績}}\n- 困っていること：{{課題・悩み}}\n- 上司に承認してほしいこと：{{決裁事項}}\n- 直近の成功体験：{{成果}}\n\n# 出力フォーマット\n## 【1on1 報告シート（PREP法）】\n## 【相談の切り出し方トーク例】\n## 【承認取りのロジック構成】\n## 【上司から聞かれそうな質問と準備回答】" },
  { id: "proposal_review", label: "提案レビュー・ブラッシュアップ",
    prompt: "# 役割\nあなたはトップ営業マンの視点を持つ提案コンサルタントAIです。\n\n# タスク\n以下の提案内容を評価し、改善点と強化ポイントを提示してください。\n\n# 入力情報\n- 顧客名・業種：{{顧客名・業種}}\n- 顧客の課題・ニーズ：{{ヒアリングで把握した課題}}\n- 現在の提案内容：{{提案しようとしている内容}}\n- 想定される懸念：{{顧客が断りそうな理由}}\n- 競合との比較：{{競合他社との違い}}\n\n# 出力フォーマット\n## 【提案の強み（3点）】\n## 【弱点・改善すべき点（3点）】\n## 【刺さるキャッチコピー・表現案（3案）】\n## 【プレゼン冒頭30秒トーク】\n## 【想定Q&Aと切り返しトーク】" },
  { id: "claim",           label: "クレーム対応・トラブル会議",
    prompt: "# 役割\nあなたはクレーム対応・危機管理の専門家AIです。\n\n# タスク\n以下のクレーム・トラブル情報をもとに、社内報告書の文案と顧客への謝罪トークを作成してください。\n\n# 入力情報\n- 顧客名：{{顧客名}}\n- トラブルの内容：{{何が起きたか・いつ・どんな影響}}\n- 自社の責任範囲：{{自社に非がある部分}}\n- 現在取れる対応策：{{すぐにできる対応・代替案}}\n- 顧客の感情温度：{{激怒/不満/冷静など}}\n\n# 出力フォーマット\n## 【社内緊急報告文（上長向け）】\n## 【顧客への第一声トーク（電話・訪問用）】\n## 【謝罪メール文案】\n## 【再発防止策の提案文】" },
  { id: "cross_dept",      label: "部署間調整ミーティング準備",
    prompt: "# 役割\nあなたは社内調整・ステークホルダーマネジメントの専門家AIです。\n\n# タスク\n以下の情報をもとに、部署間調整ミーティングの準備資料と合意形成のための交渉戦略を作成してください。\n\n# 入力情報\n- 調整したい内容：{{何について合意が必要か}}\n- 関係部署と担当者：{{部署名・担当者名}}\n- 自部署の要望：{{営業側が求めること}}\n- 相手部署の懸念：{{相手が難色を示しそうな点}}\n- 期限・優先度：{{いつまでに決めたいか}}\n\n# 出力フォーマット\n## 【調整ミーティングのアジェンダ】\n## 【Win-Win提案の構成】\n## 【想定される反論と切り返し】\n## 【合意形成後のネクストアクション】" },
  { id: "study",           label: "新商品・サービス勉強会準備",
    prompt: "# 役割\nあなたは営業研修・商品教育の専門家AIです。\n\n# タスク\n以下の情報をもとに、社内勉強会の構成と営業メンバーが即使えるトークポイントを作成してください。\n\n# 入力情報\n- 商品・サービス名：{{商品名}}\n- 主な特徴・スペック：{{機能・特長}}\n- 競合との違い：{{差別化ポイント}}\n- 想定顧客層：{{誰に売るか}}\n- 勉強会時間：{{分数}}\n\n# 出力フォーマット\n## 【勉強会タイムテーブル（60分想定）】\n## 【営業トークポイント TOP5】\n## 【よくある質問と模範回答】\n## 【ロールプレイシナリオ（練習用）】" },
];

const COMPANY_FIELDS = [
  { id: "company_name", label: "自社名・ブランド名",    placeholder: "例：株式会社〇〇" },
  { id: "product",      label: "商品・サービス名",      placeholder: "例：法人向けクラウドCRM" },
  { id: "usp",          label: "強み・差別化ポイント",  placeholder: "例：導入最短1日、サポート無制限" },
  { id: "price",        label: "価格帯",                placeholder: "例：月額9,800円〜" },
  { id: "target_pain",  label: "解決できる顧客の悩み",  placeholder: "例：営業管理が属人化している" },
];

const CUSTOMER_TYPE = ["個人", "法人・個人事業主"];

const PERSONAL_FIELDS = [
  { id: "gender", label: "性別",   options: ["指定なし","男性","女性"] },
  { id: "age",    label: "年代",   options: ["指定なし","20代","30代","40代","50代","60代以上"] },
  { id: "region", label: "地域",   options: ["指定なし","首都圏","関西圏","東海圏","地方都市","地方農村部"] },
  { id: "job",    label: "職業",   options: ["指定なし","会社員（一般）","管理職・課長以上","役員・経営者","公務員","フリーランス","主婦・主夫","学生","無職・求職中"] },
  { id: "income", label: "年収感", options: ["指定なし","〜300万","300〜500万","500〜800万","800万〜1,200万","1,200万以上"] },
];

const CORPORATE_FIELDS = [
  { id: "industry",  label: "業種",     options: ["指定なし","IT・SaaS","製造業","建設・不動産","小売・EC","飲食・フード","医療・介護","教育・研修","金融・保険","人材・HR","コンサル・士業","その他サービス業"] },
  { id: "employees", label: "従業員数", options: ["指定なし","1〜5名","6〜30名","31〜100名","101〜500名","501名以上"] },
  { id: "region",    label: "地域",     options: ["指定なし","首都圏","関西圏","東海圏","地方都市","全国展開"] },
  { id: "revenue",   label: "売上規模", options: ["指定なし","〜1,000万","1,000万〜1億","1億〜10億","10億〜100億","100億以上"] },
  { id: "purpose",   label: "導入目的", options: ["指定なし","コスト削減","業務効率化","売上拡大","人材育成","コンプライアンス強化","新規事業立ち上げ","競合対策"] },
];

const SCRIPT_TYPES = [
  "初回アポイント（テレアポ）",
  "初回訪問・ヒアリング",
  "提案・プレゼン",
  "クロージング",
  "既存顧客フォロー",
  "失注顧客の掘り起こし",
  "紹介依頼トーク",
];

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
function SectionLabel({ children, color = "rgba(255,255,255,0.42)" }) {
  return (
    <div style={{ fontSize: "11px", color, fontWeight: "800", marginBottom: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
      {children}
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "7px", fontWeight: "600" }}>
      {children}
    </div>
  );
}

function StyledSelect({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "13px 40px 13px 14px",
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "10px",
        color: value ? "#fff" : "rgba(255,255,255,0.38)",
        fontSize: "16px",
        outline: "none",
        cursor: "pointer",
        appearance: "none",
        WebkitAppearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7' viewBox='0 0 11 7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 14px center",
        touchAction: "manipulation",
        boxSizing: "border-box",
      }}
    >
      {placeholder && <option value="" disabled hidden>{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o} style={{ background: "#16162a", color: "#fff" }}>{o}</option>
      ))}
    </select>
  );
}

function StyledInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "13px 14px",
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "10px",
        color: "#fff",
        fontSize: "16px",
        outline: "none",
        boxSizing: "border-box",
        touchAction: "manipulation",
        WebkitAppearance: "none",
      }}
    />
  );
}

function CopyButton({ text, fullWidth }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };
  return (
    <button
      onClick={copy}
      style={{
        width: fullWidth ? "100%" : "auto",
        padding: "13px 22px",
        background: copied ? "rgba(0,201,167,0.22)" : "rgba(255,255,255,0.09)",
        border: `1.5px solid ${copied ? "#00C9A7" : "rgba(255,255,255,0.18)"}`,
        borderRadius: "10px",
        color: copied ? "#00C9A7" : "#fff",
        fontSize: "14px",
        cursor: "pointer",
        fontWeight: "700",
        transition: "all 0.2s",
        touchAction: "manipulation",
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      {copied ? "✓ コピー済み！" : "📋 プロンプトをコピー"}
    </button>
  );
}

function PrimaryButton({ onClick, children, style: extra = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        padding: "16px",
        background: "linear-gradient(135deg, #FF4B2B, #FF6B35)",
        border: "none",
        borderRadius: "12px",
        color: "#fff",
        fontSize: "15px",
        fontWeight: "800",
        cursor: "pointer",
        letterSpacing: "0.04em",
        touchAction: "manipulation",
        boxShadow: "0 4px 20px rgba(255,75,43,0.28)",
        ...extra,
      }}
    >
      {children}
    </button>
  );
}

function PromptBox({ prompt, accentColor }) {
  return (
    <>
      <pre style={{
        background: "rgba(0,0,0,0.4)",
        border: `1px solid ${accentColor}44`,
        borderRadius: "12px",
        padding: "16px",
        fontSize: "12px",
        lineHeight: "1.8",
        color: "rgba(255,255,255,0.84)",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        overflowX: "hidden",
        maxHeight: "48vh",
        overflowY: "auto",
        marginBottom: "12px",
        WebkitOverflowScrolling: "touch",
      }}>
        {prompt}
      </pre>
      <CopyButton text={prompt} fullWidth />
    </>
  );
}

function MonetizeSection({ data, w }) {
  return (
    <div style={{
      marginTop: "28px",
      padding: "18px",
      background: "linear-gradient(135deg, rgba(255,215,0,0.07), rgba(255,165,0,0.025))",
      border: "1px solid rgba(255,215,0,0.2)",
      borderRadius: "14px",
    }}>
      <div style={{ fontSize: "11px", color: "rgba(255,215,0,0.75)", fontWeight: "800", marginBottom: "14px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        💰 マネタイズ戦略 — {data.title}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "9px", marginBottom: "13px" }}>
        {data.models.map((m) => (
          <div key={m.name} style={{
            padding: "12px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.07)",
          }}>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "5px", lineHeight: 1.3 }}>{m.name}</div>
            <div style={{ fontSize: isMobile(w) ? "12px" : "13px", fontWeight: "700", color: "#FFD700", marginBottom: "4px", lineHeight: 1.3 }}>{m.price}</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.32)", lineHeight: 1.4 }}>{m.note}</div>
          </div>
        ))}
      </div>
      <div style={{
        padding: "11px 14px",
        background: "rgba(255,215,0,0.1)",
        borderRadius: "9px",
        fontSize: isMobile(w) ? "11px" : "13px",
        color: "#FFD700",
        fontWeight: "700",
        textAlign: "center",
        lineHeight: 1.5,
      }}>
        🎯 {data.total}
      </div>
    </div>
  );
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
function AdminTab({ w }) {
  const [sel, setSel] = useState(null);
  const cat  = ADMIN_CATEGORIES.find((c) => c.id === sel);
  const cols = isMobile(w) ? "1fr" : "1fr 1fr";
  return (
    <div>
      <SectionLabel>カテゴリを選択</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: cols, gap: "10px", marginBottom: "20px" }}>
        {ADMIN_CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setSel(sel === c.id ? null : c.id)} style={{
            padding: "14px 12px",
            background: sel === c.id ? "rgba(0,201,167,0.16)" : "rgba(255,255,255,0.04)",
            border: `1.5px solid ${sel === c.id ? "#00C9A7" : "rgba(255,255,255,0.09)"}`,
            borderRadius: "11px",
            color: sel === c.id ? "#00C9A7" : "rgba(255,255,255,0.68)",
            fontSize: "13px", cursor: "pointer", textAlign: "left",
            fontWeight: sel === c.id ? "700" : "400",
            lineHeight: 1.4, touchAction: "manipulation", transition: "all 0.18s",
          }}>
            {sel === c.id && "✓ "}{c.label}
          </button>
        ))}
      </div>
      {cat && (
        <div style={{ animation: "fadeIn 0.25s ease" }}>
          <SectionLabel color="#00C9A7">{cat.label}</SectionLabel>
          <PromptBox prompt={cat.prompt} accentColor="#00C9A7" />
        </div>
      )}
      <MonetizeSection data={MONETIZE.admin} w={w} />
    </div>
  );
}

function MeetingTab({ w }) {
  const [sel, setSel] = useState(null);
  const cat  = MEETING_CATEGORIES.find((c) => c.id === sel);
  const cols = isMobile(w) ? "1fr" : "1fr 1fr";
  return (
    <div>
      <SectionLabel>会議タイプを選択</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: cols, gap: "10px", marginBottom: "20px" }}>
        {MEETING_CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setSel(sel === c.id ? null : c.id)} style={{
            padding: "14px 12px",
            background: sel === c.id ? "rgba(75,111,255,0.16)" : "rgba(255,255,255,0.04)",
            border: `1.5px solid ${sel === c.id ? "#4B6FFF" : "rgba(255,255,255,0.09)"}`,
            borderRadius: "11px",
            color: sel === c.id ? "#8AA4FF" : "rgba(255,255,255,0.68)",
            fontSize: "13px", cursor: "pointer", textAlign: "left",
            fontWeight: sel === c.id ? "700" : "400",
            lineHeight: 1.4, touchAction: "manipulation", transition: "all 0.18s",
          }}>
            {sel === c.id && "✓ "}{c.label}
          </button>
        ))}
      </div>
      {cat && (
        <div style={{ animation: "fadeIn 0.25s ease" }}>
          <SectionLabel color="#4B6FFF">{cat.label}</SectionLabel>
          <PromptBox prompt={cat.prompt} accentColor="#4B6FFF" />
        </div>
      )}
      <MonetizeSection data={MONETIZE.meeting} w={w} />
    </div>
  );
}

function SalesTab({ w }) {
  const [companyData,  setCompanyData]  = useState({});
  const [custType,     setCustType]     = useState("法人・個人事業主");
  const [personalData, setPersonalData] = useState({});
  const [corpData,     setCorpData]     = useState({});
  const [scriptType,   setScriptType]   = useState(SCRIPT_TYPES[0]);
  const [generated,    setGenerated]    = useState("");
  const [step,         setStep]         = useState(1);

  const upCo  = (id, v) => setCompanyData((p)  => ({ ...p, [id]: v }));
  const upPer = (id, v) => setPersonalData((p) => ({ ...p, [id]: v }));
  const upCor = (id, v) => setCorpData((p)     => ({ ...p, [id]: v }));

  const build = () => {
    const c = companyData;
    const isP  = custType === "個人";
    const flds = isP ? PERSONAL_FIELDS : CORPORATE_FIELDS;
    const data = isP ? personalData : corpData;
    const lines = flds.map((f) => `- ${f.label}：${data[f.id] || "指定なし"}`).join("\n");
    setGenerated(`# ロール設定
あなたはトップ1%の営業コンサルタントAIです。心理学・行動経済学・説得理論に精通しており、日本の商習慣に沿った最高水準の営業スクリプトを生成できます。

---

# 【自社・商品情報】
- 会社名：${c.company_name || "（未入力）"}
- 商品・サービス：${c.product || "（未入力）"}
- 強み・差別化：${c.usp || "（未入力）"}
- 価格帯：${c.price || "（未入力）"}
- 解決できる顧客の悩み：${c.target_pain || "（未入力）"}

---

# 【顧客属性】
- 顧客タイプ：${custType}
${lines}

---

# 【スクリプト種別】
${scriptType}

---

# 出力指示

## ① オープニングトーク（最初の15秒）
- 相手の警戒を解くための第一声
- 「なぜあなたに連絡したか」を1文で明示
- 時間の許可取り

## ② ニーズ喚起・課題提示（SPIN話法ベース）
- 状況質問（Situation）
- 問題質問（Problem）
- 示唆質問（Implication）
- 解決質問（Need-payoff）

## ③ 商品・サービス提案トーク
- 顧客の課題に直結したベネフィット訴求
- 数字・実績・事例を使った説得力のある説明
- 競合との差別化ポイントの伝え方

## ④ 想定される断り文句TOP3と切り返しトーク
1. 
2. 
3. 

## ⑤ クロージングトーク（決断を促す）
- YESを引き出すための質問設計
- 緊急性・希少性の演出（不誠実にならない範囲で）
- 次のアクション（アポ・資料送付・成約）への誘導

## ⑥ フォローメール文案（商談後24時間以内）
- 件名と本文

---

# 注意事項
- 押し売り・不誠実な表現は使わない
- 顧客属性に合わせたトーン・言葉選びをする
- 日本語のビジネス敬語・自然な話し言葉で出力する
- 各パートにセリフ例（カギカッコ付き）を必ず入れる`);
    setStep(3);
  };

  const fieldCols = isDesktop(w) ? "1fr 1fr" : "1fr";

  return (
    <div>
      {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "22px", flexWrap: "wrap" }}>
        {[1, 2, 3].map((s) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{
              width: "30px", height: "30px", borderRadius: "50%", flexShrink: 0,
              background: step >= s ? "#FF4B2B" : "rgba(255,255,255,0.08)",
              border: `2px solid ${step >= s ? "#FF4B2B" : "rgba(255,255,255,0.14)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", fontWeight: "800",
              color: step >= s ? "#fff" : "rgba(255,255,255,0.28)",
              transition: "all 0.3s",
            }}>{s}</div>
            {s < 3 && <div style={{ width: "24px", height: "2px", background: step > s ? "#FF4B2B" : "rgba(255,255,255,0.1)", borderRadius: "2px", transition: "all 0.3s" }} />}
          </div>
        ))}
        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", marginLeft: "8px" }}>
          {step === 1 ? "自社情報を入力" : step === 2 ? "顧客属性を設定" : "✅ 完成！"}
        </span>
      </div>

      {step === 1 && (
        <div>
          <SectionLabel>STEP 1 — 自社・商品情報（一度だけ設定OK）</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: fieldCols, gap: "13px" }}>
            {COMPANY_FIELDS.map((f) => (
              <div key={f.id}>
                <FieldLabel>{f.label}</FieldLabel>
                <StyledInput value={companyData[f.id] || ""} onChange={(v) => upCo(f.id, v)} placeholder={f.placeholder} />
              </div>
            ))}
          </div>
          <PrimaryButton onClick={() => setStep(2)} style={{ marginTop: "22px" }}>
            STEP 2 へ → 顧客属性を設定
          </PrimaryButton>
        </div>
      )}

      {step === 2 && (
        <div>
          <SectionLabel>STEP 2 — 顧客属性をプルダウンで選択</SectionLabel>
          <div style={{ marginBottom: "18px" }}>
            <FieldLabel>顧客タイプ</FieldLabel>
            <div style={{ display: "flex", gap: "10px" }}>
              {CUSTOMER_TYPE.map((t) => (
                <button key={t} onClick={() => setCustType(t)} style={{
                  flex: 1, padding: "13px 10px",
                  background: custType === t ? "rgba(255,75,43,0.18)" : "rgba(255,255,255,0.05)",
                  border: `1.5px solid ${custType === t ? "#FF4B2B" : "rgba(255,255,255,0.11)"}`,
                  borderRadius: "10px",
                  color: custType === t ? "#FF6B35" : "rgba(255,255,255,0.6)",
                  fontSize: "14px", cursor: "pointer",
                  fontWeight: custType === t ? "800" : "400",
                  transition: "all 0.18s", touchAction: "manipulation",
                }}>{t}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: fieldCols, gap: "13px", marginBottom: "18px" }}>
            {(custType === "個人" ? PERSONAL_FIELDS : CORPORATE_FIELDS).map((f) => (
              <div key={f.id}>
                <FieldLabel>{f.label}</FieldLabel>
                <StyledSelect
                  value={(custType === "個人" ? personalData[f.id] : corpData[f.id]) || ""}
                  onChange={(v) => custType === "個人" ? upPer(f.id, v) : upCor(f.id, v)}
                  options={f.options}
                  placeholder="▼ 選択してください"
                />
              </div>
            ))}
          </div>
          <div style={{ marginBottom: "22px" }}>
            <FieldLabel>スクリプト種別</FieldLabel>
            <StyledSelect value={scriptType} onChange={setScriptType} options={SCRIPT_TYPES} />
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setStep(1)} style={{
              padding: "15px 18px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.11)",
              borderRadius: "11px", color: "rgba(255,255,255,0.55)",
              fontSize: "14px", cursor: "pointer", touchAction: "manipulation", flexShrink: 0,
            }}>← 戻る</button>
            <PrimaryButton onClick={build} style={{ flex: 1, width: "auto" }}>
              🚀 最強プロンプトを生成する
            </PrimaryButton>
          </div>
        </div>
      )}

      {step === 3 && generated && (
        <div style={{ animation: "fadeIn 0.25s ease" }}>
          <SectionLabel color="#FF4B2B">✅ 営業スクリプト生成プロンプト — 完成！</SectionLabel>
          <PromptBox prompt={generated} accentColor="#FF4B2B" />
          <button onClick={() => { setStep(1); setGenerated(""); }} style={{
            marginTop: "14px", padding: "11px 20px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "9px", color: "rgba(255,255,255,0.5)",
            fontSize: "13px", cursor: "pointer", touchAction: "manipulation",
          }}>🔄 最初からやり直す</button>
        </div>
      )}

      <MonetizeSection data={MONETIZE.sales} w={w} />
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const w = useWindowWidth();
  const [activeTab, setActiveTab] = useState("sales");

  const maxW = isDesktop(w) ? "920px" : isTablet(w) ? "700px" : "100%";
  const px   = isMobile(w) ? "14px" : isTablet(w) ? "28px" : "36px";
  const py   = isMobile(w) ? "18px" : "30px";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(150deg, #07070f 0%, #0c0c20 55%, #07070f 100%)",
      fontFamily: "'Hiragino Kaku Gothic ProN','Noto Sans JP','Helvetica Neue',sans-serif",
      color: "#fff",
      padding: `${py} ${px}`,
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(7px)} to{opacity:1;transform:none} }
        *{-webkit-tap-highlight-color:transparent;box-sizing:border-box}
        input::placeholder{color:rgba(255,255,255,0.26)}
        select option{background:#14142a}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.14);border-radius:4px}
      `}</style>

      <div style={{ maxWidth: maxW, margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: isDesktop(w) ? "38px" : "24px" }}>
          <div style={{
            display: "inline-block", padding: "5px 16px",
            background: "rgba(255,75,43,0.13)",
            border: "1px solid rgba(255,75,43,0.28)",
            borderRadius: "20px", fontSize: "10px",
            color: "#FF6B35", letterSpacing: "0.13em",
            fontWeight: "800", marginBottom: "13px", textTransform: "uppercase",
          }}>💼 Sales AI Prompt Generator</div>

          <h1 style={{
            fontSize: `clamp(22px, ${isMobile(w) ? "7.5vw" : "3.8vw"}, 44px)`,
            fontWeight: "900", margin: "0 0 10px",
            background: "linear-gradient(135deg,#ffffff 20%,rgba(255,255,255,0.42))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            letterSpacing: "-0.03em", lineHeight: 1.14,
          }}>
            営業マン最強AI<br />プロンプトツール
          </h1>

          <p style={{ color: "rgba(255,255,255,0.36)", fontSize: isMobile(w) ? "12px" : "14px", margin: 0, lineHeight: 1.65 }}>
            自社情報 × 顧客属性 → 最高品質のプロンプトを即生成<br />
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.24)" }}>
              Claude / ChatGPT / Gemini にそのまま貼り付けてOK ✦ スマホ・タブレット・PC対応
            </span>
          </p>
        </div>

        {/* TABS */}
        <div style={{
          display: "flex", gap: "6px", marginBottom: "18px",
          background: "rgba(255,255,255,0.035)",
          padding: "5px", borderRadius: "15px",
          border: "1px solid rgba(255,255,255,0.065)",
        }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              flex: 1,
              padding: isMobile(w) ? "10px 3px" : "12px 8px",
              background: activeTab === t.id ? `linear-gradient(135deg,${t.color}2c,${t.color}10)` : "transparent",
              border: activeTab === t.id ? `1.5px solid ${t.color}50` : "1.5px solid transparent",
              borderRadius: "11px",
              color: activeTab === t.id ? "#fff" : "rgba(255,255,255,0.36)",
              fontSize: isMobile(w) ? "10px" : "12px",
              fontWeight: activeTab === t.id ? "800" : "400",
              cursor: "pointer", transition: "all 0.22s",
              lineHeight: 1.4, touchAction: "manipulation",
            }}>
              <div style={{ fontSize: isMobile(w) ? "20px" : "22px", marginBottom: "3px" }}>{t.icon}</div>
              {isMobile(w) ? t.shortLabel : t.label}
            </button>
          ))}
        </div>

        {/* CARD */}
        <div style={{
          background: "rgba(255,255,255,0.022)",
          border: "1px solid rgba(255,255,255,0.065)",
          borderRadius: "18px",
          padding: isMobile(w) ? "16px" : isTablet(w) ? "26px" : "32px",
        }}>
          {activeTab === "sales"   && <SalesTab   w={w} />}
          {activeTab === "meeting" && <MeetingTab w={w} />}
          {activeTab === "admin"   && <AdminTab   w={w} />}
        </div>

        <div style={{ textAlign: "center", marginTop: "22px", color: "rgba(255,255,255,0.16)", fontSize: "10px" }}>
          📱 スマホ　🖥 PC　📟 タブレット — 全デバイス完全対応
        </div>
      </div>
    </div>
  );
}

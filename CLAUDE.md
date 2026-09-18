# task2-app — 業務内容整理アプリ

## 概要

複数プロジェクトの業務項目・期限・スケジュールを一元管理し、手書き整理をなくして「抜け漏れ確認にかかる時間」を短縮するアプリ。
まずは自分専用で使い、有用であれば社内展開する。

## 技術スタック

- フロントエンド/バックエンド: Next.js (App Router)
- データベース/認証: Supabase (Postgres)

## アプリ仕様

### Step 1: Strategy
- アプリの名称: 業務内容整理アプリ
- ターゲットユーザー: 自分（まずは個人利用、有用なら社内展開）
- 解決したい課題: 手書きで整理している各プロジェクトの業務項目・スケジュール・期日を効率的に整理したい
- 成功の定義（ゴール）: 抜けをなくす／毎日の確認時間を短縮する
- 参考アプリ・サービス: Googleカレンダー
- 公開範囲: まず自分専用 → 有用なら社内

### Step 2: Interface
- 核となるメイン機能: 業務内容をプロジェクトごとに入力しリスト化する
- デザイントーン: シンプルでさわやか、色数を絞る
- 画面リスト:
  1. 入力画面（プロジェクト／業務項目の登録・編集）
  2. プロジェクト一覧画面
  3. 各業務リスト画面（プロジェクト内の業務項目一覧）
  4. スケジュール画面（全プロジェクト横断・時系列で期限順に表示）
- 優先デバイス: PCメイン、スマホでも確認できるようにする
- 操作フロー: プロジェクト作成 → 業務入力 → 期限/実行日入力 → 保存 → 表示 → 編集
- 通知/フィードバック: 締切が近いことを視覚的に知らせる（音のアラートではなく、色や表示で強調）

### Step 3: Logic & Data
- データ項目: プロジェクト（名称、開始予定時期）、業務項目（プロジェクトに紐づく、期限、次回打ち合わせ日、担当者）
- サンプルデータ:
  - プロジェクトA / 開始予定時期: 2026-10-01
  - 業務項目: ①要件整理 ②設計 ③実装 …
  - 期限: 各業務項目ごとに設定
  - 次回打ち合わせ日、担当者も業務項目に紐づけて記録
- ビジネスロジック: 業務項目と期限をセットで管理し、締切が早い順に表示する。表示は「プロジェクト内でのリスト」と「全プロジェクト横断でのリスト」の両方に対応する
- ファイル/画像の扱い: テキスト情報のみ（画像・PDF等は非対応）
- 検索/並び替え: 期限が近い順（デフォルト）。それ以外は標準的な構成で良い
- 将来的な拡張: LINEへの通知連携（締切が近い業務をLINEに通知）

## 提案するディレクトリ構造

```
task2-app/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # スケジュール画面（全プロジェクト横断・期限順）
│   ├── projects/
│   │   ├── page.tsx             # プロジェクト一覧画面
│   │   ├── new/page.tsx         # プロジェクト新規作成
│   │   └── [projectId]/
│   │       ├── page.tsx         # 業務リスト画面（プロジェクト内）
│   │       └── tasks/
│   │           ├── new/page.tsx     # 業務項目の新規入力
│   │           └── [taskId]/edit/page.tsx  # 業務項目の編集
│   └── api/                     # 必要に応じてRoute Handlersを配置
├── components/
│   ├── ProjectCard.tsx
│   ├── ProjectForm.tsx
│   ├── TaskList.tsx
│   ├── TaskForm.tsx
│   └── DeadlineBadge.tsx        # 期限までの近さを色で視覚化
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # ブラウザ用クライアント
│   │   └── server.ts            # サーバー用クライアント
│   └── types.ts                 # Project / Task の型定義
├── supabase/
│   └── migrations/
│       └── 0001_init.sql
├── styles/
│   └── globals.css
├── .env.local.example
├── package.json
├── next.config.js
└── tsconfig.json
```

## 提案するDB設計（Supabase / Postgres）

```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  due_date date,
  next_meeting_date date,
  assignee text,
  sort_order integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_due_date_idx on tasks(due_date);
create index tasks_project_id_idx on tasks(project_id);
```

- スケジュール画面（全プロジェクト横断）は `tasks` を `due_date` 昇順でJOINして表示する。
- 業務リスト画面（プロジェクト内）は `project_id` で絞り込み、同様に `due_date` 昇順で表示する。
- 将来のLINE通知連携は、Supabase Edge Functions + Cron（pg_cron）で `due_date` が近い `tasks` を検出し、LINE Messaging APIへ送信する構成を想定。

## 開発の進め方

1. Next.jsプロジェクトの雛形を作成し、Supabaseプロジェクトを接続する。
2. 上記DB設計に沿ってマイグレーションを作成する。
3. スケジュール画面 → プロジェクト一覧 → 業務リスト → 入力/編集画面の順に実装する（コア機能を最優先）。
4. 区切りの良い単位でコミットし、GitHubにプッシュする。

## リポジトリ

- GitHub: https://github.com/YYYY-24/task2-app

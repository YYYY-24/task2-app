-- 次回打ち合わせ日は業務項目ではなくプロジェクト単位の情報のため移動する。
alter table projects add column next_meeting_at timestamptz;
alter table tasks drop column next_meeting_at;

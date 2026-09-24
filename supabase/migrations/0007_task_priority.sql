-- 具体的な期限日は無いが優先度だけ管理したい業務項目のためのフィールド。
-- due_at が設定されている場合は使用しない（期限側の表示・並び順が優先される）。
alter table tasks add column priority text check (priority in ('soon', 'someday'));

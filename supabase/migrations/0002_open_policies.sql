-- 個人利用（未ログイン・anonキーのみ）のため、まずは読み書きを許可する。
-- 将来ログイン機能を追加する際は、ここを本人のみに絞るポリシーへ差し替える。

alter table projects enable row level security;
alter table tasks enable row level security;

create policy "allow all on projects" on projects
  for all
  using (true)
  with check (true);

create policy "allow all on tasks" on tasks
  for all
  using (true)
  with check (true);

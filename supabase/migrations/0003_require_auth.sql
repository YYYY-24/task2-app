-- ログイン機能の追加に伴い、匿名アクセスを廃止しログイン済みユーザーのみ許可する。

drop policy if exists "allow all on projects" on projects;
drop policy if exists "allow all on tasks" on tasks;

create policy "authenticated only on projects" on projects
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "authenticated only on tasks" on tasks
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

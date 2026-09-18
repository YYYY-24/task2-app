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
  due_at timestamptz,
  next_meeting_at timestamptz,
  assignee text,
  sort_order integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_due_at_idx on tasks(due_at);
create index tasks_project_id_idx on tasks(project_id);

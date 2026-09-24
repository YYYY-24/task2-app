import { createClient } from "./supabase/server";
import { Project, Task } from "./types";

export type TaskWithProject = Task & { project_name: string };

const TASK_COLUMNS = "id, project_id, name, due_at, priority, assignee, created_at, completed_at";
const PROJECT_COLUMNS = "id, name, start_date, completion_date, next_meeting_at, created_at";

export async function getTasksWithProject(
  options: { includeCompleted?: boolean } = {}
): Promise<TaskWithProject[]> {
  const supabase = await createClient();
  let query = supabase.from("tasks").select(`${TASK_COLUMNS}, projects(name)`);
  if (!options.includeCompleted) {
    query = query.is("completed_at", null);
  }
  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []).map((t) => ({
    id: t.id,
    project_id: t.project_id,
    name: t.name,
    due_at: t.due_at,
    priority: t.priority,
    assignee: t.assignee,
    created_at: t.created_at,
    completed_at: t.completed_at,
    project_name: (t.projects as unknown as { name: string } | null)?.name ?? "不明なプロジェクト",
  }));
}

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// プロジェクト詳細画面では「完了済みを表示」トグルを持たせるため、
// 完了・未完了の両方をここで取得し、絞り込みはクライアント側で行う。
export async function getTasksByProject(projectId: string): Promise<Task[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_COLUMNS)
    .eq("project_id", projectId);

  if (error) throw error;
  return data ?? [];
}

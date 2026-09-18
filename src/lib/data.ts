import { supabase } from "./supabase/client";
import { Project, Task } from "./types";

export type TaskWithProject = Task & { project_name: string };

export async function getTasksWithProject(): Promise<TaskWithProject[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("id, project_id, name, due_at, next_meeting_at, assignee, created_at, projects(name)");

  if (error) throw error;

  return (data ?? []).map((t) => ({
    id: t.id,
    project_id: t.project_id,
    name: t.name,
    due_at: t.due_at,
    next_meeting_at: t.next_meeting_at,
    assignee: t.assignee,
    created_at: t.created_at,
    project_name: (t.projects as unknown as { name: string } | null)?.name ?? "不明なプロジェクト",
  }));
}

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, start_date, created_at")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, start_date, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("id, project_id, name, due_at, next_meeting_at, assignee, created_at")
    .eq("project_id", projectId);

  if (error) throw error;
  return data ?? [];
}

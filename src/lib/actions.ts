"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createProject(input: {
  name: string;
  startDate: string | null;
  completionDate: string | null;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").insert({
    name: input.name,
    start_date: input.startDate,
    completion_date: input.completionDate,
  });

  if (error) return { error: error.message };

  revalidatePath("/projects");
  revalidatePath("/");
  return { error: null };
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", projectId);

  if (error) return { error: error.message };

  revalidatePath("/projects");
  revalidatePath("/");
  return { error: null };
}

export async function updateProjectMeeting(projectId: string, nextMeetingAt: string | null) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ next_meeting_at: nextMeetingAt })
    .eq("id", projectId);

  if (error) return { error: error.message };

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  return { error: null };
}

export async function updateProjectDates(
  projectId: string,
  startDate: string | null,
  completionDate: string | null
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ start_date: startDate, completion_date: completionDate })
    .eq("id", projectId);

  if (error) return { error: error.message };

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  return { error: null };
}

export async function createTask(input: {
  projectId: string;
  name: string;
  dueAt: string | null;
  assignee: string | null;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    project_id: input.projectId,
    name: input.name,
    due_at: input.dueAt,
    assignee: input.assignee,
  });

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath(`/projects/${input.projectId}`);
  revalidatePath("/projects");
  return { error: null };
}

export async function deleteTask(taskId: string, projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  return { error: null };
}

export async function setTaskCompletion(taskId: string, completed: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ completed_at: completed ? new Date().toISOString() : null })
    .eq("id", taskId);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/projects/[id]", "page");
  return { error: null };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

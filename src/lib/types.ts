export type Project = {
  id: string;
  name: string;
  start_date: string | null;
  created_at: string;
};

export type Task = {
  id: string;
  project_id: string;
  name: string;
  due_at: string | null;
  next_meeting_at: string | null;
  assignee: string | null;
  created_at: string;
  completed_at: string | null;
};

export type Urgency = "overdue" | "urgent" | "soon" | "later" | "none";

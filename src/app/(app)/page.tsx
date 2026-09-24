import ScheduleView from "@/components/ScheduleView";
import { getTasksWithProject } from "@/lib/data";

export default async function SchedulePage() {
  const tasks = await getTasksWithProject({ includeCompleted: true });
  return <ScheduleView tasks={tasks} />;
}

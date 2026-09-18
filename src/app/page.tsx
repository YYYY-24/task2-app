import ScheduleView from "@/components/ScheduleView";
import { getTasksWithProject } from "@/lib/data";

export default async function SchedulePage() {
  const tasks = await getTasksWithProject();
  return <ScheduleView tasks={tasks} />;
}

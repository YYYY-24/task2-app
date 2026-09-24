import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getTasksByProject } from "@/lib/data";
import ProjectTaskList from "@/components/ProjectTaskList";
import ProjectMeetingEditor from "@/components/ProjectMeetingEditor";
import ProjectDatesEditor from "@/components/ProjectDatesEditor";
import DeleteProjectButton from "@/components/DeleteProjectButton";

export default async function ProjectTasksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, tasks] = await Promise.all([getProject(id), getTasksByProject(id)]);
  if (!project) notFound();

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-[#6b7680] text-sm no-underline hover:text-[#24292b]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M15 6l-6 6 6 6" />
          </svg>
          プロジェクト一覧に戻る
        </Link>
        <DeleteProjectButton projectId={project.id} projectName={project.name} />
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xl font-bold">{project.name}</div>
          <div className="text-sm text-[#6b7680] mt-1">業務項目一覧（期限順）</div>
        </div>
        <Link
          href={`/new?type=task&project=${project.id}`}
          className="flex items-center gap-1.5 text-white px-4 py-2.5 rounded-[9px] text-sm font-semibold no-underline"
          style={{ background: "#2c7871" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path d="M12 5v14M5 12h14" />
          </svg>
          業務を追加
        </Link>
      </div>

      <ProjectDatesEditor
        projectId={project.id}
        startDate={project.start_date}
        completionDate={project.completion_date}
      />
      <ProjectMeetingEditor projectId={project.id} nextMeetingAt={project.next_meeting_at} />

      <ProjectTaskList tasks={tasks} />
    </div>
  );
}

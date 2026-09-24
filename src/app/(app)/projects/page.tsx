import Link from "next/link";
import { getProjects, getTasksWithProject } from "@/lib/data";
import { countdownLabel, formatDateTime, tokyoNow } from "@/lib/schedule";

export default async function ProjectsPage() {
  const [projects, tasks] = await Promise.all([getProjects(), getTasksWithProject()]);
  const today = tokyoNow();

  const cards = projects.map((p) => {
    const projectTasks = tasks.filter((t) => t.project_id === p.id);
    const sorted = [...projectTasks].sort((a, b) => {
      const ak = a.due_at ? new Date(a.due_at).getTime() : Infinity;
      const bk = b.due_at ? new Date(b.due_at).getTime() : Infinity;
      return ak - bk;
    });
    const nearest = sorted[0];
    return {
      ...p,
      taskCount: projectTasks.length,
      nearestLabel: nearest ? `${nearest.name} ・ ${countdownLabel(nearest.due_at, today)}` : "タスクなし",
    };
  });

  return (
    <div>
      <div className="mb-6">
        <div className="text-xl font-bold">プロジェクト一覧</div>
        <div className="text-sm text-[#6b7680] mt-1">プロジェクトを選ぶと業務リストを確認できます</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((p) => (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className="bg-white border border-[#e3e7e8] rounded-2xl p-5 flex flex-col gap-2.5 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="text-base font-bold">{p.name}</div>
              <div className="text-[11px] text-[#9aa2a9] bg-[#f1f3f4] px-2.5 py-0.5 rounded-full">
                {p.taskCount}件
              </div>
            </div>
            <div className="text-xs text-[#8a929a]">
              着工予定: {p.start_date ?? "未定"} ／ 完成予定: {p.completion_date ?? "未定"}
            </div>
            <div className="h-px bg-[#eef0f1] my-0.5" />
            <div className="text-xs text-[#6b7680]">直近の期限</div>
            <div className="text-sm font-semibold">{p.nearestLabel}</div>
            <div className="text-xs text-[#6b7680] mt-1">
              次回打ち合わせ: <span className="font-semibold text-[#24292b]">{formatDateTime(p.next_meeting_at)}</span>
            </div>
          </Link>
        ))}
        {cards.length === 0 && (
          <div className="text-sm text-[#9aa2a9]">プロジェクトがまだありません。「新規登録」から作成してください。</div>
        )}
      </div>
    </div>
  );
}

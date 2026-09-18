import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getTasksByProject } from "@/lib/data";
import { countdownLabel, formatDateTime, getUrgency, tokyoNow, URGENCY_COLOR } from "@/lib/schedule";

export default async function ProjectTasksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, tasks] = await Promise.all([getProject(id), getTasksByProject(id)]);
  if (!project) notFound();

  const today = tokyoNow();
  const sorted = [...tasks].sort((a, b) => {
    const ak = a.due_at ? new Date(a.due_at).getTime() : Infinity;
    const bk = b.due_at ? new Date(b.due_at).getTime() : Infinity;
    return ak - bk;
  });

  return (
    <div>
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 mb-2.5 text-[#6b7680] text-sm no-underline hover:text-[#24292b]"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M15 6l-6 6 6 6" />
        </svg>
        プロジェクト一覧に戻る
      </Link>

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

      <div className="flex flex-col gap-2">
        {sorted.map((t) => {
          const urgency = getUrgency(t.due_at, today);
          return (
            <div
              key={t.id}
              className="flex items-center gap-4 bg-white border border-[#e3e7e8] rounded-xl px-4.5 py-3.5"
            >
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: URGENCY_COLOR[urgency] }} />
              <div className="w-24 shrink-0">
                <div className="text-xs font-bold" style={{ color: URGENCY_COLOR[urgency] }}>
                  {countdownLabel(t.due_at, today)}
                </div>
                <div className="text-[11px] text-[#9aa2a9]">{formatDateTime(t.due_at)}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{t.name}</div>
              </div>
              <div className="w-32 shrink-0 text-right">
                <div className="text-xs text-[#6b7680]">担当: {t.assignee ?? "未定"}</div>
                <div className="text-[11px] text-[#a7aeb8] mt-0.5">
                  次回打合せ {formatDateTime(t.next_meeting_at)}
                </div>
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && (
          <div className="text-sm text-[#9aa2a9] py-8 text-center">業務項目がまだありません</div>
        )}
      </div>
    </div>
  );
}

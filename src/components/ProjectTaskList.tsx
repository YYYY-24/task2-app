"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTask, setTaskCompletion } from "@/lib/actions";
import { Task } from "@/lib/types";
import { countdownLabel, formatDateTime, getUrgency, tokyoNow, URGENCY_COLOR } from "@/lib/schedule";

export default function ProjectTaskList({ tasks }: { tasks: Task[] }) {
  const router = useRouter();
  const [showCompleted, setShowCompleted] = useState(false);
  const today = useMemo(() => tokyoNow(), []);

  async function toggleComplete(task: Task) {
    await setTaskCompletion(task.id, !task.completed_at);
    router.refresh();
  }

  async function handleDelete(task: Task) {
    if (!confirm(`「${task.name}」を削除しますか？`)) return;
    await deleteTask(task.id, task.project_id);
    router.refresh();
  }

  const visible = tasks
    .filter((t) => showCompleted || !t.completed_at)
    .sort((a, b) => {
      const ak = a.due_at ? new Date(a.due_at).getTime() : Infinity;
      const bk = b.due_at ? new Date(b.due_at).getTime() : Infinity;
      return ak - bk;
    });

  const completedCount = tasks.filter((t) => t.completed_at).length;

  return (
    <div>
      <label className="flex items-center gap-2 mb-4 text-sm text-[#6b7680] w-fit cursor-pointer">
        <input
          type="checkbox"
          checked={showCompleted}
          onChange={(e) => setShowCompleted(e.target.checked)}
          className="w-4 h-4 accent-[#2c7871] cursor-pointer"
        />
        完了済みを表示（{completedCount}件）
      </label>

      <div className="flex flex-col gap-2">
        {visible.map((t) => {
          const urgency = t.completed_at ? "none" : getUrgency(t.due_at, today);
          return (
            <div
              key={t.id}
              className="flex items-center gap-4 bg-white border border-[#e3e7e8] rounded-xl px-4.5 py-3.5"
              style={t.completed_at ? { opacity: 0.55 } : undefined}
            >
              <input
                type="checkbox"
                aria-label="完了にする"
                checked={!!t.completed_at}
                onChange={() => toggleComplete(t)}
                className="w-4.5 h-4.5 shrink-0 accent-[#2c7871] cursor-pointer"
              />
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: URGENCY_COLOR[urgency] }} />
              <div className="w-24 shrink-0">
                <div className="text-xs font-bold" style={{ color: URGENCY_COLOR[urgency] }}>
                  {t.completed_at ? "完了" : countdownLabel(t.due_at, today)}
                </div>
                <div className="text-[11px] text-[#9aa2a9]">{formatDateTime(t.due_at)}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold" style={t.completed_at ? { textDecoration: "line-through" } : undefined}>
                  {t.name}
                </div>
              </div>
              <div className="w-24 shrink-0 text-right">
                <div className="text-xs text-[#6b7680]">担当: {t.assignee ?? "未定"}</div>
              </div>
              <button
                type="button"
                aria-label="削除"
                onClick={() => handleDelete(t)}
                className="shrink-0 text-[#a7aeb8] hover:text-[#c14a34] cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path d="M4 7h16M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m-7 0v12a2 2 0 002 2h4a2 2 0 002-2V7" />
                </svg>
              </button>
            </div>
          );
        })}
        {visible.length === 0 && (
          <div className="text-sm text-[#9aa2a9] py-8 text-center">業務項目がまだありません</div>
        )}
      </div>
    </div>
  );
}

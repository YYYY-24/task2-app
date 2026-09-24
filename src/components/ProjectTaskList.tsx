"use client";

import { useMemo, useState } from "react";
import { Task } from "@/lib/types";
import { getBadge, tokyoNow } from "@/lib/schedule";
import TaskRow from "@/components/TaskRow";

export default function ProjectTaskList({ tasks }: { tasks: Task[] }) {
  const [showCompleted, setShowCompleted] = useState(false);
  const today = useMemo(() => tokyoNow(), []);

  const visible = tasks
    .filter((t) => showCompleted || !t.completed_at)
    .map((t) => ({ task: t, badge: getBadge(t.due_at, t.priority, today) }))
    .sort((a, b) => {
      if (a.badge.group !== b.badge.group) return a.badge.group - b.badge.group;
      const ak = a.task.due_at ? new Date(a.task.due_at).getTime() : new Date(a.task.created_at).getTime();
      const bk = b.task.due_at ? new Date(b.task.due_at).getTime() : new Date(b.task.created_at).getTime();
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
        {visible.map(({ task, badge }) => (
          <TaskRow key={task.id} task={task} badge={badge} />
        ))}
        {visible.length === 0 && (
          <div className="text-sm text-[#9aa2a9] py-8 text-center">業務項目がまだありません</div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTask, setTaskCompletion } from "@/lib/actions";
import { TaskWithProject } from "@/lib/data";
import {
  formatDateTime,
  getBadge,
  getMonthRange,
  getUrgency,
  getWeekRange,
  isWithinRange,
  tokyoNow,
  URGENCY_COLOR,
} from "@/lib/schedule";

type PeriodFilter = "week" | "month" | "all";
type SortBy = "due" | "assignee";

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  week: "今週",
  month: "今月",
  all: "すべて",
};

const SORT_LABELS: Record<SortBy, string> = {
  due: "期限順",
  assignee: "担当者順",
};

const GROUP_HEADING: Record<number, string> = {
  1: "早めに対応",
  2: "急がない",
  3: "期限未定",
};

export default function ScheduleView({ tasks }: { tasks: TaskWithProject[] }) {
  const router = useRouter();
  const [period, setPeriod] = useState<PeriodFilter>("week");
  const [sortBy, setSortBy] = useState<SortBy>("due");
  const [showCompleted, setShowCompleted] = useState(false);
  const today = useMemo(() => tokyoNow(), []);

  async function toggleComplete(id: string, completed: boolean) {
    await setTaskCompletion(id, completed);
    router.refresh();
  }

  async function handleDelete(id: string, projectId: string, name: string) {
    if (!confirm(`「${name}」を削除しますか？`)) return;
    await deleteTask(id, projectId);
    router.refresh();
  }

  const completedCount = tasks.filter((t) => t.completed_at).length;

  const { visible, hiddenCount, rangeLabel } = useMemo(() => {
    const withMeta = tasks
      .filter((t) => showCompleted || !t.completed_at)
      .map((t) => {
        const badge = t.completed_at
          ? { label: "完了", color: URGENCY_COLOR.none, group: 0 }
          : getBadge(t.due_at, t.priority, today);
        const isOverdue = !t.completed_at && t.due_at ? getUrgency(t.due_at, today) === "overdue" : false;
        const sortKey = t.due_at ? new Date(t.due_at).getTime() : new Date(t.created_at).getTime();
        return { ...t, badge, isOverdue, sortKey };
      });

    let range: { start: Date; end: Date } | null = null;
    let label: string | null = null;
    if (period === "week") {
      range = getWeekRange(today);
      const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
      label = `${fmt(range.start)}(月)〜${fmt(range.end)}(日)`;
    } else if (period === "month") {
      range = getMonthRange(today);
      label = `${today.getMonth() + 1}月`;
    }

    const filtered = withMeta.filter((t) => {
      if (t.completed_at) return true; // 完了済みは表示ONの間は期間に関係なく表示
      if (t.badge.group !== 0) return true; // 期限未定・優先度のみの項目は常に表示
      if (t.isOverdue) return true;
      if (!range) return true;
      return t.due_at ? isWithinRange(t.due_at, range) : true;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "assignee") {
        const an = a.assignee ?? "";
        const bn = b.assignee ?? "";
        if (an !== bn) {
          if (!an) return 1;
          if (!bn) return -1;
          return an.localeCompare(bn, "ja");
        }
      }
      if (a.badge.group !== b.badge.group) return a.badge.group - b.badge.group;
      return a.sortKey - b.sortKey;
    });

    return { visible: sorted, hiddenCount: withMeta.length - filtered.length, rangeLabel: label };
  }, [tasks, period, sortBy, today, showCompleted]);

  const showGroupHeadings = sortBy === "due";

  return (
    <div>
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="text-xl font-bold">スケジュール</div>
          <div className="text-sm text-[#6b7680] mt-1">
            全プロジェクトの業務項目を{sortBy === "assignee" ? "担当者ごとに" : "期限が近い順に"}表示しています（超過分は常に表示）
          </div>
        </div>
        <div className="flex gap-1 bg-[#f1f3f4] p-1 rounded-[10px]">
          {(Object.keys(PERIOD_LABELS) as PeriodFilter[]).map((key) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              style={{
                background: period === key ? "#ffffff" : "transparent",
                color: period === key ? "#24292b" : "#8a929a",
              }}
            >
              {PERIOD_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <label className="flex items-center gap-2 text-sm text-[#6b7680] cursor-pointer">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="w-4 h-4 accent-[#2c7871] cursor-pointer"
          />
          完了済みを表示（{completedCount}件）
        </label>
        <div className="flex gap-1 bg-[#f1f3f4] p-1 rounded-[10px]">
          {(Object.keys(SORT_LABELS) as SortBy[]).map((key) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className="px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer"
              style={{
                background: sortBy === key ? "#ffffff" : "transparent",
                color: sortBy === key ? "#24292b" : "#8a929a",
              }}
            >
              {SORT_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-[#9aa2a9] mb-3">
        {rangeLabel
          ? `${rangeLabel} ・ ${visible.length}件を表示中（超過分・期限未定を含む、範囲外${hiddenCount}件は非表示）`
          : `${visible.length}件を表示中`}
      </div>

      <div className="flex flex-col gap-2">
        {visible.map((t, i) => {
          const showHeading =
            showGroupHeadings && !t.completed_at && t.badge.group > 0 && visible[i - 1]?.badge.group !== t.badge.group;
          return (
            <div key={t.id}>
              {showHeading && (
                <div className="text-xs font-bold text-[#8a929a] mt-4 mb-2 first:mt-0">
                  {GROUP_HEADING[t.badge.group]}
                </div>
              )}
              <div
                onClick={() => router.push(`/projects/${t.project_id}`)}
                className="flex items-center gap-4 bg-white border border-[#e3e7e8] rounded-xl px-4.5 py-3.5 cursor-pointer hover:bg-[#fafbfb] hover:border-[#d5dadc] transition-colors"
                style={t.completed_at ? { opacity: 0.55 } : undefined}
              >
                <input
                  type="checkbox"
                  aria-label="完了にする"
                  checked={!!t.completed_at}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => toggleComplete(t.id, !t.completed_at)}
                  className="w-4.5 h-4.5 shrink-0 accent-[#2c7871] cursor-pointer"
                />
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: t.badge.color }} />
                <div className="w-24 shrink-0">
                  <div className="text-xs font-bold" style={{ color: t.badge.color }}>
                    {t.badge.label}
                  </div>
                  {t.due_at && <div className="text-[11px] text-[#9aa2a9]">{formatDateTime(t.due_at)}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={t.completed_at ? { textDecoration: "line-through" } : undefined}>
                    {t.name}
                  </div>
                  <div className="text-xs text-[#8a929a] mt-0.5">{t.project_name}</div>
                </div>
                <div className="w-24 shrink-0 text-right">
                  <div className="text-xs text-[#6b7680]">担当: {t.assignee ?? "未定"}</div>
                </div>
                <button
                  type="button"
                  aria-label="削除"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(t.id, t.project_id, t.name);
                  }}
                  className="shrink-0 text-[#a7aeb8] hover:text-[#c14a34] cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path d="M4 7h16M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m-7 0v12a2 2 0 002 2h4a2 2 0 002-2V7" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
        {visible.length === 0 && (
          <div className="text-sm text-[#9aa2a9] py-8 text-center">表示できる業務項目がありません</div>
        )}
      </div>
    </div>
  );
}

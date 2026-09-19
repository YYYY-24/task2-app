"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { setTaskCompletion } from "@/lib/actions";
import { TaskWithProject } from "@/lib/data";
import {
  countdownLabel,
  formatDateTime,
  getMonthRange,
  getUrgency,
  getWeekRange,
  isWithinRange,
  tokyoNow,
  URGENCY_COLOR,
} from "@/lib/schedule";

type PeriodFilter = "week" | "month" | "all";

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  week: "今週",
  month: "今月",
  all: "すべて",
};

export default function ScheduleView({ tasks }: { tasks: TaskWithProject[] }) {
  const router = useRouter();
  const [period, setPeriod] = useState<PeriodFilter>("week");
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const today = useMemo(() => tokyoNow(), []);

  async function handleComplete(id: string) {
    setCompletedIds((prev) => new Set(prev).add(id));
    await setTaskCompletion(id, true);
    router.refresh();
  }

  const { visible, hiddenCount, rangeLabel } = useMemo(() => {
    const withMeta = tasks.map((t) => ({
      ...t,
      urgency: getUrgency(t.due_at, today),
      sortKey: t.due_at ? new Date(t.due_at).getTime() : Infinity,
    }));
    const sorted = [...withMeta].sort((a, b) => a.sortKey - b.sortKey);

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

    const filtered = sorted.filter((t) => {
      if (t.urgency === "overdue" || t.urgency === "none") return true;
      if (!range) return true;
      return t.due_at ? isWithinRange(t.due_at, range) : true;
    });

    const withoutCompleted = filtered.filter((t) => !completedIds.has(t.id));

    return { visible: withoutCompleted, hiddenCount: sorted.length - filtered.length, rangeLabel: label };
  }, [tasks, period, today, completedIds]);

  return (
    <div>
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="text-xl font-bold">スケジュール</div>
          <div className="text-sm text-[#6b7680] mt-1">
            全プロジェクトの業務項目を、期限が近い順に表示しています（超過分は常に表示）
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

      <div className="text-xs text-[#9aa2a9] mb-3">
        {rangeLabel
          ? `${rangeLabel} ・ ${visible.length}件を表示中（超過分を含む、範囲外${hiddenCount}件は非表示）`
          : `${visible.length}件を表示中`}
      </div>

      <div className="flex flex-col gap-2">
        {visible.map((t) => (
          <div
            key={t.id}
            onClick={() => router.push(`/projects/${t.project_id}`)}
            className="flex items-center gap-4 bg-white border border-[#e3e7e8] rounded-xl px-4.5 py-3.5 cursor-pointer hover:bg-[#fafbfb] hover:border-[#d5dadc] transition-colors"
          >
            <input
              type="checkbox"
              aria-label="完了にする"
              onClick={(e) => e.stopPropagation()}
              onChange={() => handleComplete(t.id)}
              className="w-4.5 h-4.5 shrink-0 accent-[#2c7871] cursor-pointer"
            />
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: URGENCY_COLOR[t.urgency] }}
            />
            <div className="w-24 shrink-0">
              <div className="text-xs font-bold" style={{ color: URGENCY_COLOR[t.urgency] }}>
                {countdownLabel(t.due_at, today)}
              </div>
              <div className="text-[11px] text-[#9aa2a9]">{formatDateTime(t.due_at)}</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">{t.name}</div>
              <div className="text-xs text-[#8a929a] mt-0.5">{t.project_name}</div>
            </div>
            <div className="w-32 shrink-0 text-right">
              <div className="text-xs text-[#6b7680]">担当: {t.assignee ?? "未定"}</div>
              <div className="text-[11px] text-[#a7aeb8] mt-0.5">
                次回打合せ {formatDateTime(t.next_meeting_at)}
              </div>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="text-sm text-[#9aa2a9] py-8 text-center">表示できる業務項目がありません</div>
        )}
      </div>
    </div>
  );
}

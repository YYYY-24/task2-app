"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTask, setTaskCompletion, updateTask } from "@/lib/actions";
import { Task } from "@/lib/types";
import {
  Badge,
  PRIORITY_LABEL,
  dateTimeToIso,
  formatDateTime,
  toTokyoInputParts,
  URGENCY_COLOR,
} from "@/lib/schedule";

type DueMode = "date" | "soon" | "someday";

export default function TaskRow({
  task,
  badge,
  projectName,
  onNavigate,
}: {
  task: Task;
  badge: Badge;
  projectName?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialDue = toTokyoInputParts(task.due_at);
  const [name, setName] = useState(task.name);
  const [dueMode, setDueMode] = useState<DueMode>(task.due_at ? "date" : task.priority ?? "date");
  const [dueDate, setDueDate] = useState(initialDue.date);
  const [dueTime, setDueTime] = useState(initialDue.time);
  const [notes, setNotes] = useState(task.notes ?? "");
  const [assignee, setAssignee] = useState(task.assignee ?? "");

  const inputClass =
    "border border-[#d8dcde] rounded-[9px] px-3 py-2 text-sm focus:outline-2 focus:outline-[#2c7871] focus:border-[#2c7871]";

  function startEdit() {
    setName(task.name);
    const parts = toTokyoInputParts(task.due_at);
    setDueDate(parts.date);
    setDueTime(parts.time);
    setDueMode(task.due_at ? "date" : task.priority ?? "date");
    setNotes(task.notes ?? "");
    setAssignee(task.assignee ?? "");
    setError(null);
    setEditing(true);
  }

  async function toggleComplete() {
    await setTaskCompletion(task.id, !task.completed_at);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`「${task.name}」を削除しますか？`)) return;
    await deleteTask(task.id, task.project_id);
    router.refresh();
  }

  async function handleSave() {
    if (!name.trim()) {
      setError("業務項目名称を入力してください");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await updateTask(task.id, task.project_id, {
      name: name.trim(),
      dueAt: dueMode === "date" ? dateTimeToIso(dueDate, dueTime) : null,
      priority: dueMode === "date" ? null : dueMode,
      notes: notes.trim() || null,
      assignee: assignee.trim() || null,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <div className="bg-white border border-[#2c7871] rounded-xl px-4.5 py-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5 text-xs text-[#6b7680]">
          業務項目名称
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <div className="flex flex-col gap-1.5 text-xs text-[#6b7680]">
          期限
          <div className="flex gap-1 bg-[#f1f3f4] p-1 rounded-[10px] w-fit">
            {(["date", "soon", "someday"] as DueMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setDueMode(mode)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                style={{ background: dueMode === mode ? "#ffffff" : "transparent", color: dueMode === mode ? "#24292b" : "#8a929a" }}
              >
                {mode === "date" ? "日付を指定" : PRIORITY_LABEL[mode]}
              </button>
            ))}
          </div>
          {dueMode === "date" ? (
            <div className="grid grid-cols-[2fr_1fr] gap-2.5 max-w-[320px]">
              <input type="date" className={inputClass} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              <input type="time" className={inputClass} value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
            </div>
          ) : (
            <div className="text-xs text-[#9aa2a9]">
              具体的な日程は設定せず、「{PRIORITY_LABEL[dueMode]}」として表示されます
            </div>
          )}
        </div>

        <label className="flex flex-col gap-1.5 text-xs text-[#6b7680]">
          担当者
          <input className={inputClass} value={assignee} onChange={(e) => setAssignee(e.target.value)} />
        </label>

        <label className="flex flex-col gap-1.5 text-xs text-[#6b7680]">
          メモ
          <textarea
            className={inputClass}
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="備忘録として自由に記載できます"
          />
        </label>

        {error && <div className="text-sm text-[#c14a34]">{error}</div>}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="text-white px-4 py-2 rounded-[9px] text-sm font-semibold cursor-pointer disabled:opacity-60"
            style={{ background: "#2c7871" }}
          >
            {saving ? "保存中..." : "保存"}
          </button>
          <button type="button" onClick={() => setEditing(false)} disabled={saving} className="text-sm text-[#6b7680] cursor-pointer">
            キャンセル
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onNavigate}
      className={`flex items-center gap-4 bg-white border border-[#e3e7e8] rounded-xl px-4.5 py-3.5 ${
        onNavigate ? "cursor-pointer hover:bg-[#fafbfb] hover:border-[#d5dadc] transition-colors" : ""
      }`}
      style={task.completed_at ? { opacity: 0.55 } : undefined}
    >
      <input
        type="checkbox"
        aria-label="完了にする"
        checked={!!task.completed_at}
        onClick={(e) => e.stopPropagation()}
        onChange={toggleComplete}
        className="w-4.5 h-4.5 shrink-0 accent-[#2c7871] cursor-pointer"
      />
      <div
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ background: task.completed_at ? URGENCY_COLOR.none : badge.color }}
      />
      <div className="w-24 shrink-0">
        <div className="text-xs font-bold" style={{ color: task.completed_at ? URGENCY_COLOR.none : badge.color }}>
          {task.completed_at ? "完了" : badge.label}
        </div>
        {task.due_at && <div className="text-[11px] text-[#9aa2a9]">{formatDateTime(task.due_at)}</div>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold" style={task.completed_at ? { textDecoration: "line-through" } : undefined}>
          {task.name}
        </div>
        {task.notes && <div className="text-xs text-[#9aa2a9] mt-0.5 truncate">{task.notes}</div>}
        {projectName && <div className="text-xs text-[#8a929a] mt-0.5">{projectName}</div>}
      </div>
      <div className="w-24 shrink-0 text-right">
        <div className="text-xs text-[#6b7680]">担当: {task.assignee ?? "未定"}</div>
      </div>
      <button
        type="button"
        aria-label="編集"
        onClick={(e) => {
          e.stopPropagation();
          startEdit();
        }}
        className="shrink-0 text-[#a7aeb8] hover:text-[#2c7871] cursor-pointer"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="削除"
        onClick={(e) => {
          e.stopPropagation();
          handleDelete();
        }}
        className="shrink-0 text-[#a7aeb8] hover:text-[#c14a34] cursor-pointer"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M4 7h16M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m-7 0v12a2 2 0 002 2h4a2 2 0 002-2V7" />
        </svg>
      </button>
    </div>
  );
}

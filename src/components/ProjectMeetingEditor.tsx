"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProjectMeeting } from "@/lib/actions";
import { dateTimeToIso, formatDateTime, toTokyoInputParts } from "@/lib/schedule";

export default function ProjectMeetingEditor({
  projectId,
  nextMeetingAt,
}: {
  projectId: string;
  nextMeetingAt: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const initial = toTokyoInputParts(nextMeetingAt);
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass = "border border-[#d8dcde] rounded-[9px] px-3 py-2 text-sm";

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await updateProjectMeeting(projectId, dateTimeToIso(date, time));
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function handleClear() {
    setSaving(true);
    setError(null);
    const result = await updateProjectMeeting(projectId, null);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setDate("");
    setTime("");
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-3 bg-white border border-[#e3e7e8] rounded-xl px-4 py-3 mb-6">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a929a" strokeWidth={1.8} className="shrink-0">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
        <div className="flex-1">
          <div className="text-xs text-[#6b7680]">次回打ち合わせ日</div>
          <div className="text-sm font-semibold">{formatDateTime(nextMeetingAt)}</div>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-sm font-semibold text-[#2c7871] cursor-pointer"
        >
          編集
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e3e7e8] rounded-xl px-4 py-3.5 mb-6 flex flex-col gap-3">
      <div className="text-xs text-[#6b7680]">次回打ち合わせ日</div>
      <div className="grid grid-cols-[2fr_1fr] gap-2.5 max-w-[320px]">
        <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
        <input type="time" className={inputClass} value={time} onChange={(e) => setTime(e.target.value)} />
      </div>
      {error && <div className="text-sm text-[#c14a34]">{error}</div>}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="text-white px-4 py-2 rounded-[9px] text-sm font-semibold cursor-pointer disabled:opacity-60"
          style={{ background: "#2c7871" }}
        >
          {saving ? "保存中..." : "保存"}
        </button>
        <button type="button" onClick={handleClear} disabled={saving} className="text-sm text-[#6b7680] cursor-pointer">
          未定に戻す
        </button>
        <button type="button" onClick={() => setEditing(false)} disabled={saving} className="text-sm text-[#6b7680] cursor-pointer">
          キャンセル
        </button>
      </div>
    </div>
  );
}

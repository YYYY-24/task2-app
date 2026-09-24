"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProjectDates } from "@/lib/actions";

export default function ProjectDatesEditor({
  projectId,
  startDate,
  completionDate,
}: {
  projectId: string;
  startDate: string | null;
  completionDate: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [start, setStart] = useState(startDate ?? "");
  const [completion, setCompletion] = useState(completionDate ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass = "border border-[#d8dcde] rounded-[9px] px-3 py-2 text-sm";

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await updateProjectDates(projectId, start || null, completion || null);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-6 bg-white border border-[#e3e7e8] rounded-xl px-4 py-3 mb-3">
        <div className="flex-1">
          <div className="text-xs text-[#6b7680]">着工予定</div>
          <div className="text-sm font-semibold">{startDate ?? "未定"}</div>
        </div>
        <div className="flex-1">
          <div className="text-xs text-[#6b7680]">完成予定</div>
          <div className="text-sm font-semibold">{completionDate ?? "未定"}</div>
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
    <div className="bg-white border border-[#e3e7e8] rounded-xl px-4 py-3.5 mb-3 flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-4 max-w-[400px]">
        <label className="flex flex-col gap-1.5 text-xs text-[#6b7680]">
          着工予定
          <input type="date" className={inputClass} value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1.5 text-xs text-[#6b7680]">
          完成予定
          <input type="date" className={inputClass} value={completion} onChange={(e) => setCompletion(e.target.value)} />
        </label>
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
        <button type="button" onClick={() => setEditing(false)} disabled={saving} className="text-sm text-[#6b7680] cursor-pointer">
          キャンセル
        </button>
      </div>
    </div>
  );
}

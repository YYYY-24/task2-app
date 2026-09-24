"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProjectName } from "@/lib/actions";

export default function ProjectNameEditor({ projectId, name }: { projectId: string; name: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function cancel() {
    setEditing(false);
    setValue(name);
    setError(null);
  }

  async function handleSave() {
    if (!value.trim()) {
      setError("プロジェクト名称を入力してください");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await updateProjectName(projectId, value.trim());
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
      <div className="flex items-center gap-2">
        <div className="text-xl font-bold">{name}</div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label="プロジェクト名を編集"
          className="text-[#a7aeb8] hover:text-[#2c7871] cursor-pointer"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") cancel();
          }}
          className="border border-[#d8dcde] rounded-[9px] px-3 py-1.5 text-xl font-bold w-full max-w-[360px] focus:outline-2 focus:outline-[#2c7871] focus:border-[#2c7871]"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="text-white px-3.5 py-1.5 rounded-[9px] text-sm font-semibold cursor-pointer disabled:opacity-60 shrink-0"
          style={{ background: "#2c7871" }}
        >
          {saving ? "保存中..." : "保存"}
        </button>
        <button type="button" onClick={cancel} disabled={saving} className="text-sm text-[#6b7680] cursor-pointer shrink-0">
          キャンセル
        </button>
      </div>
      {error && <div className="text-sm text-[#c14a34]">{error}</div>}
    </div>
  );
}

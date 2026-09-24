"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProject } from "@/lib/actions";

export default function DeleteProjectButton({ projectId, projectName }: { projectId: string; projectName: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm(`「${projectName}」を削除します。含まれる業務項目もすべて削除されます。よろしいですか？`)) return;
    setDeleting(true);
    setError(null);
    const result = await deleteProject(projectId);
    if (result.error) {
      setError(result.error);
      setDeleting(false);
      return;
    }
    router.push("/projects");
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#c14a34] cursor-pointer disabled:opacity-60"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M4 7h16M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m-7 0v12a2 2 0 002 2h4a2 2 0 002-2V7" />
        </svg>
        {deleting ? "削除中..." : "プロジェクトを削除"}
      </button>
      {error && <div className="text-xs text-[#c14a34]">{error}</div>}
    </div>
  );
}

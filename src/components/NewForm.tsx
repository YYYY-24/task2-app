"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject, createTask } from "@/lib/actions";
import { Project } from "@/lib/types";

type Tab = "project" | "task";

function toIsoOrNull(date: string, time: string): string | null {
  if (!date) return null;
  const t = time || "00:00";
  return new Date(`${date}T${t}:00+09:00`).toISOString();
}

export default function NewForm({
  projects,
  initialTab,
  initialProjectId,
}: {
  projects: Project[];
  initialTab: Tab;
  initialProjectId: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [projectName, setProjectName] = useState("");
  const [projectStart, setProjectStart] = useState("");
  const [projectCompletion, setProjectCompletion] = useState("");

  const [taskProjectId, setTaskProjectId] = useState(initialProjectId || projects[0]?.id || "");
  const [taskName, setTaskName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [assignee, setAssignee] = useState("");

  function switchTab(next: Tab) {
    setTab(next);
    setError(null);
  }

  async function submitProject(e: React.FormEvent) {
    e.preventDefault();
    if (!projectName.trim()) {
      setError("プロジェクト名称を入力してください");
      return;
    }
    setSaving(true);
    setError(null);

    const result = await createProject({
      name: projectName.trim(),
      startDate: projectStart || null,
      completionDate: projectCompletion || null,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/projects");
  }

  async function submitTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskProjectId) {
      setError("所属プロジェクトを選択してください");
      return;
    }
    if (!taskName.trim()) {
      setError("業務項目名称を入力してください");
      return;
    }
    setSaving(true);
    setError(null);

    const result = await createTask({
      projectId: taskProjectId,
      name: taskName.trim(),
      dueAt: toIsoOrNull(dueDate, dueTime),
      assignee: assignee.trim() || null,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push(`/projects/${taskProjectId}`);
  }

  const inputClass =
    "border border-[#d8dcde] rounded-[9px] px-3 py-2.5 text-sm focus:outline-2 focus:outline-[#2c7871] focus:border-[#2c7871]";

  return (
    <div className="max-w-[480px]">
      <div className="text-xl font-bold mb-1">新規登録</div>
      <div className="text-sm text-[#6b7680] mb-5">プロジェクトまたは業務項目を登録します</div>

      <div className="flex gap-1 bg-[#f1f3f4] p-1 rounded-[10px] mb-6 w-fit">
        <button
          type="button"
          onClick={() => switchTab("project")}
          className="px-4.5 py-2 rounded-lg text-sm font-semibold cursor-pointer"
          style={{ background: tab === "project" ? "#ffffff" : "transparent", color: tab === "project" ? "#24292b" : "#8a929a" }}
        >
          プロジェクト
        </button>
        <button
          type="button"
          onClick={() => switchTab("task")}
          className="px-4.5 py-2 rounded-lg text-sm font-semibold cursor-pointer"
          style={{ background: tab === "task" ? "#ffffff" : "transparent", color: tab === "task" ? "#24292b" : "#8a929a" }}
        >
          業務項目
        </button>
      </div>

      {tab === "project" ? (
        <form onSubmit={submitProject} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-[#6b7680]">
            プロジェクト名称
            <input className={inputClass} value={projectName} onChange={(e) => setProjectName(e.target.value)} />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-sm text-[#6b7680]">
              着工予定
              <input type="date" className={inputClass} value={projectStart} onChange={(e) => setProjectStart(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-[#6b7680]">
              完成予定
              <input type="date" className={inputClass} value={projectCompletion} onChange={(e) => setProjectCompletion(e.target.value)} />
            </label>
          </div>
          {error && <div className="text-sm text-[#c14a34]">{error}</div>}
          <button
            type="submit"
            disabled={saving}
            className="text-white px-5.5 py-2.5 rounded-[9px] text-sm font-semibold w-fit cursor-pointer disabled:opacity-60"
            style={{ background: "#2c7871" }}
          >
            {saving ? "保存中..." : "保存する"}
          </button>
        </form>
      ) : (
        <form onSubmit={submitTask} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-[#6b7680]">
            所属プロジェクト
            <select className={inputClass} value={taskProjectId} onChange={(e) => setTaskProjectId(e.target.value)}>
              {projects.length === 0 && <option value="">プロジェクトがありません</option>}
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-[#6b7680]">
            業務項目名称
            <input className={inputClass} value={taskName} onChange={(e) => setTaskName(e.target.value)} />
          </label>
          <div className="flex flex-col gap-1.5 text-sm text-[#6b7680]">
            期限
            <div className="grid grid-cols-[2fr_1fr] gap-2.5">
              <input type="date" className={inputClass} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              <input type="time" className={inputClass} value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
            </div>
          </div>
          <label className="flex flex-col gap-1.5 text-sm text-[#6b7680]">
            担当者
            <input className={inputClass} value={assignee} onChange={(e) => setAssignee(e.target.value)} />
          </label>
          {error && <div className="text-sm text-[#c14a34]">{error}</div>}
          <button
            type="submit"
            disabled={saving}
            className="text-white px-5.5 py-2.5 rounded-[9px] text-sm font-semibold w-fit cursor-pointer disabled:opacity-60"
            style={{ background: "#2c7871" }}
          >
            {saving ? "保存中..." : "保存する"}
          </button>
        </form>
      )}
    </div>
  );
}

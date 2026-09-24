import { Priority, Urgency } from "./types";

const TZ = "Asia/Tokyo";

// Re-interprets a moment's Asia/Tokyo wall-clock reading as if it were local,
// so plain Date getters (getDate/getHours/...) return JST values regardless
// of the server's actual timezone (e.g. UTC on Vercel).
function inTokyo(d: Date): Date {
  return new Date(d.toLocaleString("en-US", { timeZone: TZ }));
}

export function tokyoNow(): Date {
  return inTokyo(new Date());
}

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

export function getWeekRange(today: Date): { start: Date; end: Date } {
  // 月曜始まり・日曜終わり
  const weekday = today.getDay(); // 0=日,1=月,...6=土
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  const start = startOfDay(today);
  start.setDate(today.getDate() + mondayOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function getMonthRange(today: Date): { start: Date; end: Date } {
  const start = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

export function diffDays(dueAt: string, today: Date): number {
  const due = startOfDay(inTokyo(new Date(dueAt)));
  const base = startOfDay(today);
  return Math.round((due.getTime() - base.getTime()) / 86400000);
}

export const URGENCY_COLOR: Record<Urgency, string> = {
  overdue: "#9c3a26",
  urgent: "#c14a34",
  soon: "#2c7871",
  later: "#8a929a",
  none: "#a7aeb8",
};

export function getUrgency(dueAt: string | null, today: Date): Urgency {
  if (!dueAt) return "none";
  const diff = diffDays(dueAt, today);
  if (diff < 0) return "overdue";
  if (diff <= 3) return "urgent";
  if (diff <= 7) return "soon";
  return "later";
}

export function countdownLabel(dueAt: string | null, today: Date): string {
  if (!dueAt) return "期限未定";
  const diff = diffDays(dueAt, today);
  if (diff < 0) return `${-diff}日超過`;
  if (diff === 0) return "本日";
  if (diff === 1) return "明日";
  return `あと${diff}日`;
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "未定";
  const d = new Date(iso);
  const datePart = new Intl.DateTimeFormat("ja-JP", {
    timeZone: TZ,
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).format(d);
  const timePart = new Intl.DateTimeFormat("ja-JP", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  return `${datePart} ${timePart}`;
}

export function isWithinRange(dueAt: string, range: { start: Date; end: Date }): boolean {
  const due = inTokyo(new Date(dueAt));
  return due >= range.start && due <= range.end;
}

// 編集フォームの date/time インプットに戻すため、Asia/Tokyo基準の
// "YYYY-MM-DD" / "HH:mm" に分解する。
export function toTokyoInputParts(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}

export function dateTimeToIso(date: string, time: string): string | null {
  if (!date) return null;
  return new Date(`${date}T${time || "00:00"}:00+09:00`).toISOString();
}

// 期限日を持たない業務項目向けの優先度バッジ。日付があるものとは
// 意図的に違う色にして、混同しないようにする。
export const PRIORITY_COLOR: Record<"soon" | "someday", string> = {
  soon: "#b8863d",
  someday: "#a7aeb8",
};

export const PRIORITY_LABEL: Record<"soon" | "someday", string> = {
  soon: "早めに対応",
  someday: "急がない",
};

export type Badge = { label: string; color: string; group: number };

// group はスケジュール一覧の並び順（0=期限あり, 1=早めに, 2=急がない, 3=未設定）に使う。
export function getBadge(dueAt: string | null, priority: Priority, today: Date): Badge {
  if (dueAt) {
    const urgency = getUrgency(dueAt, today);
    return { label: countdownLabel(dueAt, today), color: URGENCY_COLOR[urgency], group: 0 };
  }
  if (priority === "soon") {
    return { label: PRIORITY_LABEL.soon, color: PRIORITY_COLOR.soon, group: 1 };
  }
  if (priority === "someday") {
    return { label: PRIORITY_LABEL.someday, color: PRIORITY_COLOR.someday, group: 2 };
  }
  return { label: "期限未定", color: URGENCY_COLOR.none, group: 3 };
}

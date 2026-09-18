"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError("メールアドレスまたはパスワードが正しくありません");
      return;
    }
    router.push("/");
    router.refresh();
  }

  const inputClass =
    "border border-[#d8dcde] rounded-[9px] px-3 py-2.5 text-sm focus:outline-2 focus:outline-[#2c7871] focus:border-[#2c7871]";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f5f7f7]">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#e3e7e8] rounded-2xl p-8 w-full max-w-[360px] flex flex-col gap-5"
      >
        <div className="flex items-center gap-2.5">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#2c7871" />
            <path d="M8 14.5l4 4 8-9" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="font-bold text-base">業務内容整理アプリ</div>
        </div>

        <label className="flex flex-col gap-1.5 text-sm text-[#6b7680]">
          メールアドレス
          <input
            type="email"
            required
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-[#6b7680]">
          パスワード
          <input
            type="password"
            required
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <div className="text-sm text-[#c14a34]">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="text-white py-2.5 rounded-[9px] text-sm font-semibold cursor-pointer disabled:opacity-60"
          style={{ background: "#2c7871" }}
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>
      </form>
    </div>
  );
}

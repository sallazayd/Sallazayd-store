"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/admin/products");
    }
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin/products");
    } catch (err) {
      console.error("Login failed:", err);
      toast.error("بيانات الدخول غير صحيحة");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-paper border border-line rounded-2xl p-8 space-y-5"
      >
        <div className="text-center mb-4">
          <div className="w-12 h-12 rounded-full bg-ink text-white flex items-center justify-center font-bold mx-auto mb-3">
            سز
          </div>
          <h1 className="text-lg font-bold">دخول لوحة التحكم</h1>
          <p className="text-sm text-muted mt-1">سلة زايد</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            required
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-line rounded-xl px-4 py-3 text-sm focus-ring focus:border-ink text-right"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            كلمة المرور
          </label>
          <input
            type="password"
            required
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-line rounded-xl px-4 py-3 text-sm focus-ring focus:border-ink text-right"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-ink text-white rounded-full py-3.5 font-medium hover:bg-black/85 transition-colors disabled:opacity-50"
        >
          {submitting ? "جارٍ الدخول..." : "دخول"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Search,
  Loader2,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  Info,
  Pencil,
  Ban,
  CircleCheck,
  X,
  Crown,
} from "lucide-react";
import { formatDate, formatNumber } from "@/lib/format";
import Pagination from "@/components/admin/Pagination";

const emptyForm = { name: "", username: "", phone: "", email: "" };

const PER_PAGE = 10;

export default function AdminUsersPage() {
  const [users, setUsers] = useState(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [editing, setEditing] = useState(null); // کاربر در حال ویرایش
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);

  const load = useCallback(async (query = "") => {
    setUsers(null);
    try {
      const res = await fetch(
        `/api/admin/users?q=${encodeURIComponent(query)}`,
        { cache: "no-store" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا");
      setUsers(data);
      setPage(1);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load("");
  }, [load]);

  useEffect(() => {
    if (users) {
      const tp = Math.max(1, Math.ceil(users.length / PER_PAGE));
      if (page > tp) setPage(tp);
    }
  }, [users, page]);

  const onSearch = (e) => {
    e.preventDefault();
    load(q);
  };

  const patchUser = async (id, payload, confirmText) => {
    if (confirmText && !confirm(confirmText)) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا در ذخیره");
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...data.user } : u)),
      );
      return data.user;
    } catch (e) {
      alert(e.message);
      return null;
    } finally {
      setBusyId("");
    }
  };

  const toggleRole = (u) =>
    patchUser(
      u.id,
      { role: u.role === "admin" ? "user" : "admin" },
      u.role === "admin"
        ? `ادمینی «${u.name}» لغو و به خریدار تبدیل شود؟`
        : `«${u.name}» به ادمین ارتقا یابد؟`,
    );

  const toggleBan = (u) =>
    patchUser(
      u.id,
      { banned: !u.banned },
      u.banned
        ? `مسدودی «${u.name}» برداشته شود؟`
        : `«${u.name}» مسدود شود؟ (ورود و سفارش او کاملاً بسته می‌شود)`,
    );

  const openEdit = (u) => {
    setEditing(u);
    setForm({
      name: u.name,
      username: u.username,
      phone: u.phone,
      email: u.email,
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const updated = await patchUser(editing.id, form, null);
    setSaving(false);
    if (updated) setEditing(null);
  };

  const total = users?.length ?? 0;
  const admins = users?.filter((u) => u.role === "admin").length ?? 0;
  const banned = users?.filter((u) => u.banned).length ?? 0;

  const paged = (users || []).slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">
        مدیریت
      </p>
      <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-black text-strong">
        <Users size={22} className="text-accent" /> کاربران سایت
      </h1>
      <p className="mt-1 text-xs text-muted">
        همهٔ ادمین‌ها و خریداران این‌جا هستند؛ نقش، اطلاعات و وضعیت مسدودی
        هرکدام را تغییر دهید.
      </p>

      {/* شمارنده‌ها */}
      {users && (
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold">
          <span className="chip border-line bg-panel2 text-soft">
            {formatNumber(total)} کاربر
          </span>
          <span className="chip border-gold/40 bg-gold/10 text-gold">
            <ShieldCheck size={11} /> {formatNumber(admins)} ادمین
          </span>
          <span className="chip border-red-500/40 bg-red-500/10 text-red-500">
            <Ban size={11} /> {formatNumber(banned)} مسدود
          </span>
        </div>
      )}

      {/* جستجو */}
      <form onSubmit={onSearch} className="mt-4 flex max-w-md gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            className="input pr-11"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="نام، نام کاربری، موبایل یا ایمیل…"
          />
        </div>
        <button type="submit" className="btn-ghost !px-4">
          جستجو
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {/* جدول کاربران */}
      <div className="card mt-4 overflow-x-auto">
        {!users ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 size={28} className="animate-spin text-accent" />
          </div>
        ) : users.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">
            کاربری یافت نشد.
          </p>
        ) : (
          <table className="w-full min-w-[900px]">
            <thead className="bg-panel2/50">
              <tr>
                <th className="th">کاربر</th>
                <th className="th">عضویت</th>
                <th className="th">سفارش‌ها</th>
                <th className="th">نقش</th>
                <th className="th">وضعیت</th>
                <th className="th">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {paged.map((u) => {
                const isAdmin = u.role === "admin";
                return (
                  <tr
                    key={u.id}
                    className={`transition hover:bg-panel2/40 ${u.banned ? "opacity-60" : ""}`}
                  >
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black ${isAdmin ? "bg-gold/15 text-gold" : "bg-panel3 text-soft"}`}
                        >
                          {isAdmin ? <Crown size={17} /> : u.name?.[0]}
                        </span>
                        <span className="min-w-0">
                          <span className="block line-clamp-1 text-xs font-bold text-strong">
                            {u.name}
                          </span>
                          {u.username && (
                            <span
                              dir="ltr"
                              style={{ textAlign: "right" }}
                              className="block text-[10px] font-mono text-gold"
                            >
                              @{u.username}
                            </span>
                          )}
                          <span
                            dir="ltr"
                            style={{ textAlign: "right" }}
                            className="block text-[10px] text-muted"
                          >
                            {u.phone || "—"}
                          </span>
                          {u.email && (
                            <span
                              dir="ltr"
                              style={{ textAlign: "right" }}
                              className="block text-[9px] text-muted"
                            >
                              {u.email}
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="td text-[11px] text-muted">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="td">
                      <span className="flex items-center gap-1 text-xs font-bold text-soft">
                        <ShoppingBag size={12} className="text-muted" />
                        {formatNumber(u.ordersCount)}
                      </span>
                    </td>
                    <td className="td">
                      {isAdmin ? (
                        <span className="chip border-gold/40 bg-gold/10 text-gold">
                          <ShieldCheck size={11} /> ادمین
                        </span>
                      ) : (
                        <span className="chip">
                          <UserRound size={11} /> خریدار
                        </span>
                      )}
                    </td>
                    <td className="td">
                      {u.banned ? (
                        <span className="chip border-red-500/40 bg-red-500/10 text-red-500">
                          <Ban size={11} /> مسدود
                        </span>
                      ) : (
                        <span className="chip border-green-500/40 bg-green-500/10 text-green-500">
                          <CircleCheck size={11} /> فعال
                        </span>
                      )}
                    </td>
                    <td className="td">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => openEdit(u)}
                          title="ویرایش اطلاعات"
                          aria-label="ویرایش"
                          className="rounded-lg border border-line p-2 text-muted transition hover:border-accent hover:text-strong"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => toggleRole(u)}
                          disabled={busyId === u.id}
                          className={`rounded-lg px-2.5 py-2 text-[10px] font-bold transition ${isAdmin ? "border border-line text-muted hover:border-red-500 hover:text-red-500" : "bg-accent text-white hover:bg-accentSoft"}`}
                        >
                          {busyId === u.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : isAdmin ? (
                            "تنزل به خریدار"
                          ) : (
                            "ارتقا به ادمین"
                          )}
                        </button>
                        <button
                          onClick={() => toggleBan(u)}
                          disabled={busyId === u.id}
                          title={u.banned ? "رفع مسدودی" : "مسدود کردن"}
                          aria-label={u.banned ? "رفع مسدودی" : "مسدود کردن"}
                          className={`rounded-lg border p-2 transition ${u.banned ? "border-green-500/40 text-green-500 hover:bg-green-500 hover:text-white" : "border-line text-muted hover:border-red-500 hover:text-red-500"}`}
                        >
                          {u.banned ? (
                            <CircleCheck size={14} />
                          ) : (
                            <Ban size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <Pagination
        total={users?.length || 0}
        page={page}
        perPage={PER_PAGE}
        onPageChange={setPage}
      />

      <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-5 text-muted">
        <Info size={12} className="mt-0.5 shrink-0" />
        موارد ایمنی: نقش یا مسدودیِ خودتان را نمی‌توانید عوض کنید و آخرین ادمین
        فعال هم هرگز تنزل/مسدود نمی‌شود. ادمین ارتقایافته با موبایل یا ایمیلش از{" "}
        <span dir="ltr">/admin/login</span> وارد می‌شود. حساب‌های مسدودشده نه
        می‌توانند وارد شوند، نه سفارش ثبت کنند.
      </p>

      {/* ======= مودال ویرایش ======= */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditing(null)}
          />
          <form
            onSubmit={saveEdit}
            className="card relative w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-black text-strong">ویرایش کاربر</h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg p-2 text-muted transition hover:bg-panel2 hover:text-strong"
                aria-label="بستن"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-1 text-[10px] text-muted">
              شناسهٔ داخلی: <span dir="ltr">{editing.id}</span>
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="label" htmlFor="e-name">
                  نام و نام‌خانوادگی *
                </label>
                <input
                  id="e-name"
                  className="input"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                  maxLength={80}
                />
              </div>
              <div>
                <label className="label" htmlFor="e-username">
                  نام کاربری (اختیاری)
                </label>
                <input
                  id="e-username"
                  dir="ltr"
                  style={{ textAlign: "right" }}
                  className="input"
                  value={form.username}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, username: e.target.value }))
                  }
                  placeholder="mohammad"
                  pattern="[A-Za-z0-9_.\-]{3,30}"
                  title="۳ تا ۳۰ کاراکتر: a-z ۰-۹ _ . -"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="e-phone">
                    شماره موبایل
                  </label>
                  <input
                    id="e-phone"
                    dir="ltr"
                    inputMode="numeric"
                    style={{ textAlign: "right" }}
                    className="input"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    placeholder="09123456789"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="e-email">
                    ایمیل
                  </label>
                  <input
                    id="e-email"
                    type="email"
                    dir="ltr"
                    style={{ textAlign: "right" }}
                    className="input"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex-1 justify-center"
              >
                {saving ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  "ذخیره تغییرات"
                )}
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="btn-ghost"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

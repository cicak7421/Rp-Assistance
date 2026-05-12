"use client";
// app/dashboard/page.jsx
import { useState, useEffect, useCallback } from "react";

// ── HELPERS ───────────────────────────────────────────────────────────────────
async function apiFetch(url, opts = {}) {
  const res = await fetch(url, { credentials: "include", ...opts });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

function getAvatarUrl(guild) {
  if (guild.icon) return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=64`;
  return null;
}

function randomColor(str) {
  const colors = ["#5865f2", "#eb459e", "#57f287", "#fee75c", "#ed4245", "#9b59b6"];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return colors[h % colors.length];
}

const EMPTY_FORM = {
  label: "", emoji: "🎫", category: "TICKETS", channelId: "", pingRole: "",
  logChannel: "", greeting: "", maxOpen: 3, allowReopen: true, enabled: true,
};

// ── TOAST ─────────────────────────────────────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", bottom: 20, right: 20,
      background: "rgba(87,242,135,.1)", border: "1px solid rgba(87,242,135,.3)",
      borderRadius: 9, padding: "10px 16px", fontSize: 13,
      display: "flex", alignItems: "center", gap: 8,
      animation: "slideIn .3s ease both", zIndex: 1000,
      color: "#57f287",
    }}>
      ✅ {msg}
    </div>
  );
}

// ── CONFIG FORM ───────────────────────────────────────────────────────────────
function ConfigForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fieldStyle = {
    width: "100%", padding: "8px 12px", borderRadius: 7,
    border: "1px solid #1e2130", background: "#0a0b0f",
    color: "#e8eaf6", fontFamily: "inherit", fontSize: 13, outline: "none",
  };
  const labelStyle = { display: "block", fontSize: 12, fontWeight: 500, marginBottom: 5, color: "#9ca3af" };

  return (
    <div style={{
      background: "#13161e", border: "1px solid #5865f2",
      borderRadius: 11, padding: "22px 24px", marginTop: 16,
      animation: "fadeIn .25s ease both",
    }}>
      <div style={{ fontFamily: "Syne, sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 18 }}>
        {initial ? "✏️ Edit Konfigurasi" : "➕ Tambah Konfigurasi"}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        {[
          ["Label *", "label", "text", "Support, Report, dll"],
          ["Emoji", "emoji", "text", "🎫"],
          ["Category Discord", "category", "text", "TICKETS"],
          ["Channel ID", "channelId", "text", "ID channel panel dikirim"],
          ["Ping Role (nama/ID)", "pingRole", "text", "@Staff"],
          ["Log Channel (nama/ID)", "logChannel", "text", "#ticket-log"],
          ["Maks ticket/user", "maxOpen", "number", "3"],
        ].map(([label, key, type, ph]) => (
          <div key={key}>
            <label style={labelStyle}>{label}</label>
            <input
              style={fieldStyle}
              type={type}
              placeholder={ph}
              value={form[key]}
              min={type === "number" ? 1 : undefined}
              onChange={e => set(key, type === "number" ? parseInt(e.target.value) || 1 : e.target.value)}
              onFocus={e => e.target.style.borderColor = "#5865f2"}
              onBlur={e => e.target.style.borderColor = "#1e2130"}
            />
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Greeting Message</label>
        <textarea
          style={{ ...fieldStyle, resize: "vertical", minHeight: 72 }}
          placeholder="Halo! Jelaskan keperluanmu..."
          value={form.greeting}
          onChange={e => set("greeting", e.target.value)}
          onFocus={e => e.target.style.borderColor = "#5865f2"}
          onBlur={e => e.target.style.borderColor = "#1e2130"}
        />
      </div>

      <div style={{ display: "flex", gap: 20, marginBottom: 18 }}>
        {[["Allow Reopen", "allowReopen"], ["Enabled", "enabled"]].map(([lbl, k]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12 }}
            onClick={() => set(k, !form[k])}>
            <div style={{
              position: "relative", width: 36, height: 20,
              background: form[k] ? "#5865f2" : "#1e2130",
              borderRadius: 10, flexShrink: 0, transition: "background .2s",
            }}>
              <div style={{
                position: "absolute", top: 2, left: form[k] ? 18 : 2,
                width: 16, height: 16, borderRadius: "50%", background: "#fff",
                transition: "left .2s",
              }} />
            </div>
            {lbl}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => onSave(form)}
          disabled={loading || !form.label}
          style={{
            padding: "8px 18px", borderRadius: 7, border: "none",
            background: loading || !form.label ? "#374151" : "#5865f2",
            color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 500,
            cursor: loading || !form.label ? "not-allowed" : "pointer",
          }}>
          {loading ? "Menyimpan..." : "💾 Simpan"}
        </button>
        <button onClick={onCancel} style={{
          padding: "8px 18px", borderRadius: 7,
          border: "1px solid #1e2130", background: "transparent",
          color: "#6b7280", fontFamily: "inherit", fontSize: 13, cursor: "pointer",
        }}>Batal</button>
      </div>
    </div>
  );
}

// ── CONFIG CARD ───────────────────────────────────────────────────────────────
function ConfigCard({ cfg, onEdit, onDelete, onToggle }) {
  return (
    <div style={{
      background: "#13161e", border: "1px solid #1e2130",
      borderRadius: 11, padding: "18px 20px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>{cfg.emoji || "🎫"}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{cfg.label}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: cfg.enabled ? "rgba(87,242,135,.1)" : "rgba(107,114,128,.1)", color: cfg.enabled ? "#57f287" : "#6b7280" }}>
                {cfg.enabled ? "✅ Aktif" : "⏸ Nonaktif"}
              </span>
              {cfg.allowReopen && <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: 11, background: "rgba(88,101,242,.15)", color: "#5865f2" }}>Reopen ✓</span>}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 7 }}>
          <button onClick={() => onToggle(cfg)} style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, border: "1px solid #1e2130", background: "transparent", color: "#6b7280", cursor: "pointer" }}>
            {cfg.enabled ? "Nonaktifkan" : "Aktifkan"}
          </button>
          <button onClick={() => onEdit(cfg)} style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, border: "1px solid #1e2130", background: "transparent", color: "#e8eaf6", cursor: "pointer" }}>
            ✏️ Edit
          </button>
          <button onClick={() => onDelete(cfg.id)} style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, border: "1px solid rgba(237,66,69,.25)", background: "rgba(237,66,69,.12)", color: "#ed4245", cursor: "pointer" }}>
            🗑️
          </button>
        </div>
      </div>

      <div style={{ height: 1, background: "#1e2130", margin: "12px 0" }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8, fontSize: 11 }}>
        {[
          ["📁 Kategori", cfg.category || "-"],
          ["📌 Channel ID", cfg.channelId || "-"],
          ["👥 Ping Role", cfg.pingRole || "-"],
          ["📋 Log Channel", cfg.logChannel || "-"],
          ["🔢 Maks/user", cfg.maxOpen],
          ["🆔 Config ID", cfg.id],
        ].map(([l, v]) => (
          <div key={l} style={{ color: "#6b7280" }}>
            {l}: <span style={{ color: "#e8eaf6", fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>

      {cfg.greeting && (
        <div style={{ marginTop: 10, padding: "7px 11px", background: "#0a0b0f", borderLeft: "2px solid #1e2130", borderRadius: "0 6px 6px 0", fontSize: 11, color: "#6b7280" }}>
          <span style={{ color: "#5865f2", marginRight: 5 }}>💬 Greeting:</span>
          {cfg.greeting}
        </div>
      )}
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [user, setUser]             = useState(null);
  const [guilds, setGuilds]         = useState([]);
  const [selectedGuild, setGuild]   = useState(null);
  const [configs, setConfigs]       = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [formOpen, setFormOpen]     = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState(null);
  const [activeTab, setTab]         = useState("configs");

  // ── Init ──
  useEffect(() => {
    (async () => {
      try {
        const [u, g] = await Promise.all([
          apiFetch("/api/auth/me"),
          apiFetch("/api/guilds"),
        ]);
        setUser(u);
        setGuilds(g);
        if (g.length > 0) setGuild(g[0]);
      } catch {
        window.location.href = "/";
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Load configs + stats when guild changes ──
  useEffect(() => {
    if (!selectedGuild) return;
    (async () => {
      try {
        const [cfgs, st] = await Promise.all([
          apiFetch(`/api/guilds/${selectedGuild.id}/configs`),
          apiFetch(`/api/guilds/${selectedGuild.id}/tickets`),
        ]);
        setConfigs(cfgs);
        setStats(st);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [selectedGuild]);

  const showToast = (msg) => setToast(msg);

  // ── CRUD ──
  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editTarget) {
        const updated = await apiFetch(`/api/guilds/${selectedGuild.id}/configs/${editTarget.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        setConfigs(c => c.map(x => x.id === updated.id ? updated : x));
        showToast("Konfigurasi berhasil diupdate!");
      } else {
        const created = await apiFetch(`/api/guilds/${selectedGuild.id}/configs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        setConfigs(c => [...c, created]);
        showToast("Konfigurasi berhasil dibuat!");
      }
      setFormOpen(false);
      setEditTarget(null);
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (configId) => {
    if (!confirm("Hapus konfigurasi ini?")) return;
    await apiFetch(`/api/guilds/${selectedGuild.id}/configs/${configId}`, { method: "DELETE" });
    setConfigs(c => c.filter(x => x.id !== configId));
    showToast("Konfigurasi dihapus.");
  };

  const handleToggle = async (cfg) => {
    const updated = await apiFetch(`/api/guilds/${selectedGuild.id}/configs/${cfg.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !cfg.enabled }),
    });
    setConfigs(c => c.map(x => x.id === updated.id ? updated : x));
    showToast(`Konfigurasi ${updated.enabled ? "diaktifkan" : "dinonaktifkan"}.`);
  };

  const handleEdit = (cfg) => {
    setEditTarget(cfg);
    setFormOpen(true);
  };

  const handleLogout = async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  // ── STYLES ──
  const s = {
    layout:   { display: "flex", height: "100vh", overflow: "hidden", background: "#0a0b0f", color: "#e8eaf6", fontFamily: "'DM Sans', sans-serif", fontSize: 14 },
    sidebar:  { width: 240, height: "100vh", background: "#111318", borderRight: "1px solid #1e2130", display: "flex", flexDirection: "column", flexShrink: 0 },
    main:     { flex: 1, overflowY: "auto", padding: "28px 32px", maxWidth: 860 },
    tab:      (active) => ({ padding: "8px 16px", fontSize: 13, color: active ? "#5865f2" : "#6b7280", cursor: "pointer", borderBottom: active ? "2px solid #5865f2" : "2px solid transparent", marginBottom: -1, fontWeight: 500, background: "transparent", border: "none", borderBottom: active ? "2px solid #5865f2" : "2px solid transparent" }),
    statCard: { background: "#13161e", border: "1px solid #1e2130", borderRadius: 10, padding: 18 },
  };

  if (loading) return (
    <div style={{ ...s.layout, alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#6b7280" }}>Memuat...</div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#0a0b0f}::-webkit-scrollbar-thumb{background:#1e2130;border-radius:3px}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}
      `}</style>

      <div style={s.layout}>
        {/* SIDEBAR */}
        <div style={s.sidebar}>
          <div style={{ padding: "18px 16px", borderBottom: "1px solid #1e2130" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#5865f2,#eb459e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🎫</div>
              <div>
                <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 15, letterSpacing: "-.3px" }}>TicketForge</div>
                <div style={{ fontSize: 10, color: "#6b7280" }}>Dashboard</div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".8px", padding: "4px 8px 8px" }}>Server</div>
            {guilds.map(g => {
              const av = getAvatarUrl(g);
              const active = selectedGuild?.id === g.id;
              return (
                <div key={g.id} onClick={() => setGuild(g)} style={{
                  display: "flex", alignItems: "center", gap: 9, padding: "8px 9px",
                  borderRadius: 8, cursor: "pointer", marginBottom: 2,
                  borderLeft: `2px solid ${active ? "#5865f2" : "transparent"}`,
                  background: active ? "rgba(88,101,242,.12)" : "transparent",
                }}>
                  {av
                    ? <img src={av} alt="" style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }} />
                    : <div style={{ width: 32, height: 32, borderRadius: 8, background: randomColor(g.id), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{g.name[0]}</div>
                  }
                  <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{g.name}</div>
                </div>
              );
            })}
          </div>

          {user && (
            <div style={{ padding: "12px 14px", borderTop: "1px solid #1e2130", display: "flex", alignItems: "center", gap: 9 }}>
              {user.avatar
                ? <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=32`} alt="" style={{ width: 30, height: 30, borderRadius: "50%" }} />
                : <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#5865f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{user.username[0].toUpperCase()}</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.username}</div>
              </div>
              <button onClick={handleLogout} style={{ background: "transparent", border: "1px solid #1e2130", color: "#6b7280", borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer" }}>
                Keluar
              </button>
            </div>
          )}
        </div>

        {/* MAIN */}
        <div style={s.main}>
          {!selectedGuild ? (
            <div style={{ color: "#6b7280", marginTop: 40, textAlign: "center" }}>Pilih server di sidebar</div>
          ) : (
            <>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {getAvatarUrl(selectedGuild)
                    ? <img src={getAvatarUrl(selectedGuild)} alt="" style={{ width: 52, height: 52, borderRadius: 14 }} />
                    : <div style={{ width: 52, height: 52, borderRadius: 14, background: randomColor(selectedGuild.id), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff" }}>{selectedGuild.name[0]}</div>
                  }
                  <div>
                    <div style={{ fontFamily: "Syne", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{selectedGuild.name}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: "rgba(87,242,135,.1)", color: "#57f287" }}>● Online</span>
                      <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: "rgba(88,101,242,.15)", color: "#5865f2" }}>{configs.length} Config</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => { setEditTarget(null); setFormOpen(!formOpen); }} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", borderRadius: 7, border: "none",
                  background: "#5865f2", color: "#fff", fontSize: 13, fontWeight: 500,
                  cursor: "pointer", boxShadow: "0 2px 10px rgba(88,101,242,.35)",
                }}>
                  ➕ Tambah Config
                </button>
              </div>

              {/* Info bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "rgba(88,101,242,.05)", border: "1px solid rgba(88,101,242,.2)", borderRadius: 10, marginBottom: 22, fontSize: 12 }}>
                🤖 Bot API Base:
                <code style={{ fontFamily: "monospace", background: "#0a0b0f", border: "1px solid #1e2130", padding: "4px 10px", borderRadius: 6, fontSize: 12, color: "#5865f2" }}>
                  {process.env.NEXT_PUBLIC_API_URL || window.location.origin}
                </code>
                <span style={{ color: "#6b7280" }}>— set <code>API_BASE</code> di .env bot ke URL ini</span>
              </div>

              {/* Stats */}
              {stats && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 28 }}>
                  {[
                    ["🎫", stats.total, "Total Ticket"],
                    ["📂", stats.open, "Ticket Terbuka"],
                    ["🔒", stats.closed, "Ticket Ditutup"],
                    ["⚙️", configs.length, "Konfigurasi"],
                  ].map(([icon, val, label]) => (
                    <div key={label} style={s.statCard}>
                      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
                      <div style={{ fontFamily: "Syne", fontSize: 26, fontWeight: 800, marginBottom: 2 }}>{val}</div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>{label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tabs */}
              <div style={{ display: "flex", borderBottom: "1px solid #1e2130", marginBottom: 22 }}>
                {["configs", "tickets"].map(t => (
                  <button key={t} onClick={() => setTab(t)} style={s.tab(activeTab === t)}>
                    {t === "configs" ? "⚙️ Konfigurasi" : "📋 Riwayat Ticket"}
                  </button>
                ))}
              </div>

              {/* Form */}
              {formOpen && (
                <ConfigForm
                  initial={editTarget}
                  onSave={handleSave}
                  onCancel={() => { setFormOpen(false); setEditTarget(null); }}
                  loading={saving}
                />
              )}

              {/* Configs tab */}
              {activeTab === "configs" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: formOpen ? 16 : 0 }}>
                  {configs.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "48px 0", color: "#6b7280" }}>
                      <div style={{ fontSize: 32, marginBottom: 12 }}>🎫</div>
                      <div style={{ marginBottom: 6 }}>Belum ada konfigurasi ticket</div>
                      <div style={{ fontSize: 12 }}>Klik "Tambah Config" untuk mulai</div>
                    </div>
                  ) : configs.map(cfg => (
                    <ConfigCard key={cfg.id} cfg={cfg} onEdit={handleEdit} onDelete={handleDelete} onToggle={handleToggle} />
                  ))}
                </div>
              )}

              {/* Tickets tab */}
              {activeTab === "tickets" && (
                <div>
                  {!stats?.recent?.length ? (
                    <div style={{ textAlign: "center", padding: "48px 0", color: "#6b7280" }}>Belum ada aktivitas ticket.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {stats.recent.map((t, i) => (
                        <div key={i} style={{ background: "#13161e", border: "1px solid #1e2130", borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, fontSize: 12 }}>
                          <span style={{ fontSize: 18 }}>{t.type === "open" ? "📂" : t.type === "close" ? "🔒" : "🗑️"}</span>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontWeight: 500, textTransform: "capitalize" }}>{t.type}</span>
                            <span style={{ color: "#6b7280", marginLeft: 8 }}>User: {t.user_id}</span>
                          </div>
                          <span style={{ color: "#6b7280" }}>{new Date(t.created_at).toLocaleString("id-ID")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </>
  );
}

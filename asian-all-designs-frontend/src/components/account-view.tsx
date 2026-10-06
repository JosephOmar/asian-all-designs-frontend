"use client";

import { LayoutDashboard, LogIn, LogOut, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

type User = { email: string; full_name: string; avatar_url?: string | null; role: "customer" | "admin" };

export function AccountView() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch(`${API_URL}/auth/me`, { credentials: "include" }).then((response) => response.ok ? response.json() : null).then(setUser).catch(() => setUser(null)).finally(() => setLoading(false)); }, []);
  async function logout() { await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" }); setUser(null); }
  if (loading) return <div className="account-card"><div className="account-skeleton" /></div>;
  if (user) return <div className="account-card signed-in">{user.avatar_url ? <Image src={user.avatar_url} alt="" width={82} height={82} /> : <div className="avatar-placeholder">{user.full_name[0]}</div>}<p className="eyebrow dark">Sesión activa · {user.role === "admin" ? "Administrador" : "Cliente"}</p><h1>Hola, {user.full_name.split(" ")[0]}</h1><p>{user.email}</p><div className="account-actions">{user.role === "admin" && <a className="button admin-account-button" href="/admin"><LayoutDashboard size={18} />Abrir administración</a>}<button className="button button-dark" onClick={logout}><LogOut size={18} /> Cerrar sesión</button></div></div>;
  return <div className="account-card"><span className="account-icon"><ShieldCheck size={34} /></span><p className="eyebrow dark">Tu cuenta</p><h1>Guarda tus datos y pedidos</h1><p>Inicia sesión de forma segura con Google. No compartiremos tu contraseña ni publicaremos nada.</p><a className="button google-button" href={`${API_URL}/auth/google/login`}><LogIn size={20} /> Continuar con Google</a><small>Al continuar aceptas el uso de tus datos únicamente para gestionar tu compra.</small></div>;
}

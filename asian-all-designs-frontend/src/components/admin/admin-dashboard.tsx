"use client";

import { BarChart3, Boxes, ClipboardList, LogIn, ShieldX } from "lucide-react";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import type { AdminUser } from "@/lib/admin-types";
import { OrdersPanel } from "./orders-panel";
import { OverviewPanel } from "./overview-panel";
import { ProductsPanel } from "./products-panel";

type Tab = "overview" | "products" | "orders";

export function AdminDashboard() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    fetch(`${API_URL}/auth/me`, { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <main className="admin-gate"><div className="admin-loading" /></main>;
  if (!user) return <main className="admin-gate"><div className="admin-gate-card"><LogIn size={36} /><p className="eyebrow dark">Administración</p><h1>Inicia sesión para continuar</h1><p>Usa la cuenta de Google configurada como administradora.</p><a className="button button-dark" href={`${API_URL}/auth/google/login`}>Continuar con Google</a></div></main>;
  if (user.role !== "admin") return <main className="admin-gate"><div className="admin-gate-card"><ShieldX size={40} /><p className="eyebrow dark">Acceso restringido</p><h1>Esta cuenta no es administradora</h1><p>Agrega <strong>{user.email}</strong> a <code>ADMIN_EMAILS</code> en el backend y vuelve a iniciar sesión.</p></div></main>;

  return <main className="admin-shell">
    <aside className="admin-sidebar">
      <div><p className="admin-overline">Panel privado</p><h1>Asian All<br />Designs</h1></div>
      <nav aria-label="Secciones administrativas">
        <button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}><BarChart3 size={18} />Resumen</button>
        <button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}><Boxes size={18} />Productos</button>
        <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}><ClipboardList size={18} />Pedidos</button>
      </nav>
      <div className="admin-user"><span>{user.full_name[0]}</span><div><strong>{user.full_name}</strong><small>{user.email}</small></div></div>
    </aside>
    <section className="admin-content">
      {tab === "overview" && <OverviewPanel onNavigate={setTab} />}
      {tab === "products" && <ProductsPanel />}
      {tab === "orders" && <OrdersPanel />}
    </section>
  </main>;
}

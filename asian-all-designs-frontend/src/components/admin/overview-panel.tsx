"use client";

import { AlertTriangle, ArrowRight, Boxes, CircleDollarSign, ClipboardClock, PackageCheck, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { adminRequest } from "@/lib/admin-api";
import type { AdminOverview } from "@/lib/admin-types";
import { money } from "@/lib/api";

export function OverviewPanel({ onNavigate }: { onNavigate: (tab: "products" | "orders") => void }) {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { adminRequest<AdminOverview>("/admin/overview").then(setData).catch((reason) => setError(reason.message)); }, []);
  if (error) return <AdminError message={error} />;
  if (!data) return <div className="admin-panel-loading" />;
  const cards = [
    { label: "Productos activos", value: data.active_products, note: `${data.products} en total`, icon: PackageCheck },
    { label: "Stock bajo", value: data.low_stock_variants, note: "5 unidades o menos", icon: AlertTriangle },
    { label: "Pedidos por atender", value: data.pending_orders, note: "WhatsApp y contactados", icon: ClipboardClock },
    { label: "Clientes", value: data.customers, note: "Cuentas registradas", icon: UsersRound },
  ];
  return <div className="admin-panel"><header className="admin-panel-header"><div><p className="admin-overline">Vista general</p><h2>Resumen del negocio</h2></div><span className="admin-date">Actualizado ahora</span></header>
    <div className="admin-metric-grid">{cards.map(({ label, value, note, icon: Icon }) => <article className="admin-metric" key={label}><span><Icon size={20} /></span><strong>{value}</strong><h3>{label}</h3><p>{note}</p></article>)}</div>
    <div className="admin-feature-grid"><article className="admin-revenue"><div><span><CircleDollarSign size={22} /></span><p>Ventas completadas</p></div><strong>{money(data.completed_revenue)}</strong><small>Ingresos confirmados históricamente</small></article><article className="admin-shortcuts"><p className="admin-overline">Acciones rápidas</p><button onClick={() => onNavigate("products")}><Boxes size={20} /><span><strong>Gestionar catálogo</strong><small>Precios, stock y publicación</small></span><ArrowRight size={18} /></button><button onClick={() => onNavigate("orders")}><ClipboardClock size={20} /><span><strong>Revisar pedidos</strong><small>Seguimiento y estados</small></span><ArrowRight size={18} /></button></article></div>
  </div>;
}

export function AdminError({ message }: { message: string }) { return <div className="admin-error"><AlertTriangle size={28} /><h2>No pudimos cargar esta sección</h2><p>{message}</p><small>Comprueba que FastAPI esté encendido y que tu sesión siga activa.</small></div>; }

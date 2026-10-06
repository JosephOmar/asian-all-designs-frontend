"use client";

import { ChevronDown, ExternalLink, PackageSearch } from "lucide-react";
import { useEffect, useState } from "react";
import { adminRequest } from "@/lib/admin-api";
import type { AdminOrder } from "@/lib/admin-types";
import { money } from "@/lib/api";
import { AdminError } from "./overview-panel";

const statuses = [
  ["pending_whatsapp", "Pendiente de WhatsApp"], ["contacted", "Contactado"],
  ["confirmed", "Confirmado"], ["preparing", "En preparación"],
  ["shipped", "Enviado"], ["completed", "Completado"], ["cancelled", "Cancelado"],
];

export function OrdersPanel() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load(status = filter) {
    setLoading(true); setError("");
    try { setOrders(await adminRequest<AdminOrder[]>(`/admin/orders${status ? `?status=${status}` : ""}`)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudieron cargar los pedidos"); }
    finally { setLoading(false); }
  }
  // La carga inicial sincroniza este panel con la API externa.
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { load(""); }, []);
  async function updateStatus(order: AdminOrder, status: string) {
    try {
      const updated = await adminRequest<AdminOrder>(`/admin/orders/${order.id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      setOrders((current) => current.map((item) => item.id === order.id ? updated : item));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo actualizar el pedido"); }
  }

  return <div className="admin-panel"><header className="admin-panel-header"><div><p className="admin-overline">Operaciones</p><h2>Pedidos</h2></div><label className="admin-order-filter">Estado<select value={filter} onChange={(event) => { setFilter(event.target.value); load(event.target.value); }}><option value="">Todos</option>{statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></header>
    {error && <AdminError message={error} />}{loading ? <div className="admin-panel-loading" /> : orders.length ? <div className="admin-orders">{orders.map((order) => <article className="admin-order" key={order.id}><div className="admin-order-main"><button className="admin-order-expand" onClick={() => setExpanded(expanded === order.id ? null : order.id)} aria-label="Mostrar detalle"><ChevronDown size={18} className={expanded === order.id ? "rotated" : ""} /></button><div><strong>{order.order_number}</strong><small>{new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.created_at))}</small></div><div><span>{order.customer_name}</span><small>{order.customer_phone}</small></div><strong>{money(order.total)}</strong><select value={order.status} onChange={(event) => updateStatus(order, event.target.value)}>{statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><a href={`https://wa.me/51${order.customer_phone.replace(/\D/g, "").replace(/^51/, "")}`} target="_blank" rel="noreferrer" aria-label={`Contactar a ${order.customer_name}`}><ExternalLink size={17} /></a></div>{expanded === order.id && <div className="admin-order-detail"><div><h3>Productos</h3>{order.items.map((item) => <p key={`${item.sku}-${item.variant_name}`}><span>{item.quantity}× {item.product_name} · {item.variant_name}</span><strong>{money(item.line_total)}</strong></p>)}</div><div><h3>Contacto</h3><p>{order.customer_email}</p><p>{order.customer_phone}</p>{order.delivery_notes && <p><em>{order.delivery_notes}</em></p>}</div></div>}</article>)}</div> : <div className="admin-empty orders"><PackageSearch size={34} /><h3>Aún no hay pedidos</h3><p>Las solicitudes enviadas desde el carrito aparecerán aquí.</p></div>}
  </div>;
}

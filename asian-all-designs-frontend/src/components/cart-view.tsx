"use client";

import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { API_URL, money } from "@/lib/api";
import { useCartStore } from "@/store/cart-store";

export function CartView() {
  const [mounted, setMounted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const { items, update, remove, clear } = useCartStore();
  // Evita mostrar el estado persistido hasta que Zustand se hidrate en el navegador.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  async function checkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSending(true);
    const form = new FormData(event.currentTarget);
    const payload = { customer_name: form.get("name"), customer_email: form.get("email"), customer_phone: form.get("phone"), delivery_notes: form.get("notes") || null, items: items.map((item) => ({ variant_id: item.variantId, quantity: item.quantity })) };
    try {
      const response = await fetch(`${API_URL}/checkout`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error("No pudimos registrar el pedido");
      const result = await response.json(); clear(); window.location.href = result.whatsapp_url;
    } catch {
      const message = ["¡Hola! Quiero comprar en Asian All Designs:", ...items.map((item) => `• ${item.quantity}x ${item.productName} (${item.variantName}) — ${money(item.price * item.quantity)}`), `Total referencial: ${money(total)}`, `Cliente: ${payload.customer_name}`].join("\n");
      setError("El catálogo local está activo, pero la API no respondió. Te llevaremos a WhatsApp para no perder tu pedido.");
      window.setTimeout(() => { window.location.href = `https://wa.me/51980002076?text=${encodeURIComponent(message)}`; }, 900);
    } finally { setSending(false); }
  }

  if (!mounted) return <div className="cart-loading" aria-label="Cargando bolsa" />;
  if (!items.length) return <div className="empty-state cart-empty"><ShoppingBag size={42} /><h1>Tu bolsa está esperando</h1><p>Descubre diseños para vestir, coleccionar o regalar.</p><Link className="button button-dark" href="/catalogo">Explorar el catálogo <ArrowRight size={18} /></Link></div>;

  return <div className="cart-layout">
    <section className="cart-list">
      <div className="cart-title"><div><p className="eyebrow dark">Tu selección</p><h1>Mi bolsa</h1></div><span>{items.reduce((sum, item) => sum + item.quantity, 0)} unidades</span></div>
      {items.map((item) => <article className="cart-item" key={item.variantId}>
        <Link className="cart-item-image" href={`/producto/${item.productSlug}`}>{item.image ? <Image src={item.image} alt="" fill sizes="130px" /> : <span className="product-image-empty">Sin imagen</span>}</Link>
        <div className="cart-item-info"><Link href={`/producto/${item.productSlug}`}>{item.productName}</Link><span>{item.variantName}</span><strong>{money(item.price)}</strong></div>
        <div className="quantity"><button aria-label="Restar uno" onClick={() => update(item.variantId, item.quantity - 1)}><Minus size={15} /></button><span>{item.quantity}</span><button aria-label="Sumar uno" onClick={() => update(item.variantId, item.quantity + 1)}><Plus size={15} /></button></div>
        <button className="remove-item" onClick={() => remove(item.variantId)} aria-label={`Quitar ${item.productName}`}><Trash2 size={18} /></button>
      </article>)}
      <Link className="continue-link" href="/catalogo">← Seguir comprando</Link>
    </section>
    <aside className="checkout-card"><p className="eyebrow">Coordina tu compra</p><h2>Resumen</h2><div className="summary-line"><span>Productos</span><strong>{money(total)}</strong></div><div className="summary-line"><span>Envío</span><span>Se coordina por WhatsApp</span></div><div className="summary-total"><span>Total referencial</span><strong>{money(total)}</strong></div>
      <form onSubmit={checkout}><label>Nombre completo<input name="name" required minLength={2} /></label><label>Correo<input type="email" name="email" required /></label><label>Teléfono<input name="phone" inputMode="tel" required minLength={7} /></label><label>Nota para el pedido <small>Opcional</small><textarea name="notes" rows={3} placeholder="Talla, distrito o alguna consulta" /></label>{error && <p className="form-message">{error}</p>}<button className="button whatsapp-button" disabled={sending}>{sending ? "Preparando pedido..." : "Continuar por WhatsApp"}<ArrowRight size={18} /></button></form>
      <p className="checkout-note">No se realizará ningún cobro en esta web. Confirmaremos stock, envío y forma de pago contigo.</p>
    </aside>
  </div>;
}

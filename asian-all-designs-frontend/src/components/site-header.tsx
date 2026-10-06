"use client";

import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart-store";

const links = [["Ropa", "ropa"], ["Accesorios", "accesorios"], ["Regalos", "regalos"], ["Anime", "anime"], ["K-pop", "kpop"]];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const count = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  // Evita mostrar el contador persistido hasta que Zustand se hidrate en el navegador.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  return <>
    <div className="announcement">Envíos a todo el Perú · Atención directa por WhatsApp</div>
    <header className="site-header shell">
      <button className="mobile-menu-button" onClick={() => setOpen(!open)} aria-label={open ? "Cerrar menú" : "Abrir menú"}>{open ? <X /> : <Menu />}</button>
      <Link className="brand" href="/" aria-label="Asian All Designs, inicio"><span className="brand-mark">AAD</span><span>Asian All Designs</span></Link>
      <nav className="desktop-nav" aria-label="Navegación principal">
        {links.map(([label, slug]) => <Link key={slug} href={`/catalogo?categoria=${slug}`}>{label}</Link>)}
      </nav>
      <div className="header-actions">
        <Link href="/catalogo" aria-label="Buscar productos"><Search size={19} /><span className="action-label">Buscar</span></Link>
        <Link href="/cuenta" aria-label="Mi cuenta"><UserRound size={19} /><span className="action-label">Cuenta</span></Link>
        <Link className="cart-pill" href="/carrito" aria-label={`Bolsa con ${mounted ? count : 0} productos`}><ShoppingBag size={18} /><span>{mounted ? count : 0}</span></Link>
      </div>
    </header>
    {open && <nav className="mobile-nav" aria-label="Navegación móvil">{links.map(([label, slug]) => <Link onClick={() => setOpen(false)} key={slug} href={`/catalogo?categoria=${slug}`}>{label}<span>↗</span></Link>)}</nav>}
  </>;
}

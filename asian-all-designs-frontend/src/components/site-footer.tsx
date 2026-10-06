import Link from "next/link";

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="shell footer-grid">
      <div><span className="brand-mark">AAD</span><h2>Hecho para<br />mostrar tu lado fan.</h2></div>
      <div><strong>Compra</strong><Link href="/catalogo">Catálogo</Link><Link href="/carrito">Mi bolsa</Link><Link href="/cuenta">Mi cuenta</Link></div>
      <div><strong>Categorías</strong><Link href="/catalogo?categoria=ropa">Ropa</Link><Link href="/catalogo?categoria=accesorios">Accesorios</Link><Link href="/catalogo?categoria=regalos">Regalos</Link></div>
      <div><strong>Atención</strong><a href="https://wa.me/51980002076" target="_blank" rel="noreferrer">WhatsApp</a><span>Lun–Sáb · 9:00–19:00</span><span>Perú</span></div>
    </div>
    <div className="shell footer-bottom"><span>© {new Date().getFullYear()} Asian All Designs</span><span>Compra coordinada y segura por WhatsApp</span></div>
  </footer>;
}

import Link from "next/link";

export default function NotFound() { return <main className="empty-state not-found"><span>404</span><h1>Este diseño no está por aquí</h1><p>Puede que el producto haya cambiado de colección.</p><Link className="button button-dark" href="/catalogo">Volver al catálogo</Link></main>; }

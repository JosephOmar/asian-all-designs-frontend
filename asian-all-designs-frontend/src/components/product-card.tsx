import Image from "next/image";
import Link from "next/link";
import { money } from "@/lib/api";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const variant = product.variants[0];
  const image = product.images[0];
  return <article className="product-card">
    <Link className="product-image" href={`/producto/${product.slug}`}>
      {image ? <Image src={image.url} alt={image.alt_text || product.name} fill sizes="(max-width: 700px) 50vw, 25vw" /> : <span className="product-image-empty">Sin imagen</span>}
      {variant.stock < 5 && <span className="stock-badge">Últimas unidades</span>}
      <span className="quick-view">Ver producto ↗</span>
    </Link>
    <div className="product-card-copy">
      <div><p>{product.categories[0]?.name ?? "Colección"}</p><Link href={`/producto/${product.slug}`}>{product.name}</Link></div>
      <strong>{money(variant.price)}</strong>
    </div>
  </article>;
}

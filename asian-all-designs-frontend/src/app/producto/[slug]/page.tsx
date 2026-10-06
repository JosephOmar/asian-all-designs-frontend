import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { ProductGallery } from "@/components/product-gallery";
import { money, getProduct } from "@/lib/api";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  return product ? { title: `${product.name} | Asian All Designs`, description: product.short_description } : {};
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();
  const minimumPrice = Math.min(...product.variants.map((variant) => Number(variant.price)));
  return <main className="product-page shell">
    <nav className="breadcrumbs" aria-label="Migas de pan"><Link href="/catalogo">Catálogo</Link><span>/</span><span>{product.categories[0]?.name}</span><span>/</span><strong>{product.name}</strong></nav>
    <div className="product-detail">
      <ProductGallery images={product.images} productName={product.name} />
      <section className="product-info"><div className="product-kicker"><span>{product.categories.map((item) => item.name).join(" · ")}</span><span>{product.variants.length} combinaciones</span></div><h1>{product.name}</h1><p className="product-price">Desde {money(minimumPrice)}</p><p className="product-description">{product.description}</p><AddToCart product={product} /><div className="product-notes"><details open><summary>Detalles</summary><p>{product.material}</p></details><details><summary>Cuidados</summary><p>{product.care_instructions}</p></details><details><summary>Envíos</summary><p>Coordinamos cobertura, costo y fecha de entrega contigo por WhatsApp.</p></details></div></section>
    </div>
  </main>;
}

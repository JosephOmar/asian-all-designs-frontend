import type { Metadata } from "next";
import { CatalogClient } from "@/components/catalog-client";
import { getProducts } from "@/lib/api";

export const metadata: Metadata = { title: "Catálogo | Asian All Designs", description: "Ropa, accesorios y regalos inspirados en K-pop y anime." };

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ categoria?: string; q?: string }> }) {
  const params = await searchParams;
  const data = await getProducts();
  return <main className="catalog-page shell">
    <header className="catalog-header"><p className="eyebrow dark">Colección completa</p><h1>Encuentra algo<br />muy tú.</h1><p>Diseños originales para vestir tu fan side, decorar tu espacio o sorprender a alguien especial.</p></header>
    <CatalogClient initialProducts={data.items} initialCategory={params.categoria ?? "todos"} />
  </main>;
}

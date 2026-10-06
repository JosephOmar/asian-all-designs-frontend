"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "./product-card";
import type { Product } from "@/lib/types";

const categoryOptions = ["todos", "ropa", "accesorios", "regalos", "anime", "kpop"];

export function CatalogClient({ initialProducts, initialCategory = "todos" }: { initialProducts: Product[]; initialCategory?: string }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState("featured");
  const products = useMemo(() => {
    let result = initialProducts.filter((product) => !query || `${product.name} ${product.short_description}`.toLowerCase().includes(query.toLowerCase()));
    if (category !== "todos") result = result.filter((product) => product.categories.some((item) => item.slug === category));
    if (sort === "price_asc") result = [...result].sort((a, b) => Number(a.variants[0].price) - Number(b.variants[0].price));
    if (sort === "price_desc") result = [...result].sort((a, b) => Number(b.variants[0].price) - Number(a.variants[0].price));
    return result;
  }, [initialProducts, query, category, sort]);

  return <>
    <div className="catalog-toolbar">
      <label className="search-field"><Search size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca polos, tazas, peluches..." /><span>⌘ K</span></label>
      <label className="sort-field"><SlidersHorizontal size={18} /><span>Ordenar</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Destacados</option><option value="price_asc">Precio: menor a mayor</option><option value="price_desc">Precio: mayor a menor</option></select></label>
    </div>
    <div className="category-tabs" role="list" aria-label="Filtrar por categoría">
      {categoryOptions.map((option) => <button key={option} className={category === option ? "active" : ""} onClick={() => setCategory(option)}>{option === "todos" ? "Todo" : option === "kpop" ? "K-pop" : option[0].toUpperCase() + option.slice(1)}</button>)}
    </div>
    <div className="results-row"><span>{products.length} productos</span>{query && <button onClick={() => setQuery("")}>Limpiar búsqueda</button>}</div>
    {products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><span>⌁</span><h2>No encontramos coincidencias</h2><p>Prueba con otra palabra o revisa todas las categorías.</p><button className="button button-dark" onClick={() => { setQuery(""); setCategory("todos"); }}>Ver todo el catálogo</button></div>}
  </>;
}

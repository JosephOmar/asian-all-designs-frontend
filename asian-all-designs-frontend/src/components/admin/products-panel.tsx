"use client";

import { Archive, Edit3, FolderPlus, PackagePlus, Search, X } from "lucide-react";
import Image from "next/image";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { adminRequest } from "@/lib/admin-api";
import type { AdminCategory, AdminProduct } from "@/lib/admin-types";
import { money } from "@/lib/api";
import { AdminError } from "./overview-panel";
import { ProductForm } from "./product-form";

export function ProductsPanel() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<AdminProduct | null | "new">(null);
  const [addingCategory, setAddingCategory] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState<string | null>(null);

  const load = useCallback(async (search = query, selectedStatus = status) => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams(); if (search) params.set("search", search); if (selectedStatus) params.set("status", selectedStatus);
      const [page, categoryData] = await Promise.all([adminRequest<{ items: AdminProduct[] }>(`/admin/products?${params}`), adminRequest<AdminCategory[]>("/admin/categories")]);
      setProducts(page.items); setCategories(categoryData);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo cargar el catálogo"); }
    finally { setLoading(false); }
  }, [query, status]);
  // La carga inicial sincroniza este panel con la API externa.
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { load("", ""); }, []);

  async function archive(product: AdminProduct) {
    if (confirmArchive !== product.id) { setConfirmArchive(product.id); return; }
    try { await adminRequest(`/admin/products/${product.id}`, { method: "DELETE" }); setConfirmArchive(null); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo archivar"); }
  }
  function search(event: FormEvent) { event.preventDefault(); load(query, status); }

  if (editing) return <div className="admin-panel"><ProductForm key={editing === "new" ? "new" : editing.id} product={editing === "new" ? null : editing} categories={categories} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} /></div>;
  return <div className="admin-panel"><header className="admin-panel-header"><div><p className="admin-overline">Catálogo</p><h2>Productos</h2></div><div className="admin-header-actions"><button onClick={() => setAddingCategory(true)}><FolderPlus size={17} />Nueva categoría</button><button className="button admin-primary" onClick={() => setEditing("new")}><PackagePlus size={18} />Nuevo producto</button></div></header>
    {addingCategory && <CategoryForm onCancel={() => setAddingCategory(false)} onSaved={() => { setAddingCategory(false); load(); }} />}
    <form className="admin-product-toolbar" onSubmit={search}><label><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre o slug" /></label><select value={status} onChange={(event) => { setStatus(event.target.value); load(query, event.target.value); }}><option value="">Todos los estados</option><option value="active">Publicados</option><option value="draft">Borradores</option><option value="archived">Archivados</option></select><button>Buscar</button></form>
    {error && <AdminError message={error} />}{loading ? <div className="admin-panel-loading" /> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Producto</th><th>Estado</th><th>Precio</th><th>Stock</th><th>Categorías</th><th><span className="sr-only">Acciones</span></th></tr></thead><tbody>{products.map((product) => { const price = Math.min(...product.variants.map((item) => Number(item.price))); const stock = product.variants.reduce((total, item) => total + item.stock, 0); const image = product.images[0]; return <tr key={product.id}><td><div className="admin-product-cell">{image ? <Image src={image.url} alt="" width={58} height={58} /> : <span className="admin-product-image-empty">Sin imagen</span>}<div><strong>{product.name}</strong><small>{product.variants.length} variantes · {product.images.length} imágenes</small></div></div></td><td><span className={`admin-status ${product.status}`}>{product.status === "active" ? "Publicado" : product.status === "draft" ? "Borrador" : "Archivado"}</span></td><td><strong>Desde {money(price)}</strong></td><td><span className={stock <= 5 ? "stock-low" : ""}>{stock}</span></td><td>{product.category_names.join(", ") || "Sin categoría"}</td><td><div className="admin-row-actions"><button onClick={() => setEditing(product)} aria-label={`Editar ${product.name}`}><Edit3 size={17} /></button>{product.status !== "archived" && <button className={confirmArchive === product.id ? "confirm" : ""} onClick={() => archive(product)} aria-label={`Archivar ${product.name}`}><Archive size={17} />{confirmArchive === product.id && <span>Confirmar</span>}</button>}</div></td></tr>; })}</tbody></table>{!products.length && <div className="admin-empty">No hay productos con estos filtros.</div>}</div>}
  </div>;
}

function CategoryForm({ onCancel, onSaved }: { onCancel: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [kind, setKind] = useState("product_type");
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    try { await adminRequest("/admin/categories", { method: "POST", body: JSON.stringify({ name, slug, kind }) }); onSaved(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo crear la categoría"); }
  }
  return <form className="admin-category-form" onSubmit={submit}><strong>Nueva categoría</strong><input required placeholder="Nombre" value={name} onChange={(event) => { const value = event.target.value; setName(value); setSlug(value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")); }} /><input required placeholder="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={slug} onChange={(event) => setSlug(event.target.value)} /><select value={kind} onChange={(event) => setKind(event.target.value)}><option value="product_type">Tipo de producto</option><option value="fandom">Fandom</option><option value="collection">Colección</option></select>{error && <span>{error}</span>}<button className="button button-dark">Crear</button><button type="button" onClick={onCancel} aria-label="Cancelar"><X size={17} /></button></form>;
}

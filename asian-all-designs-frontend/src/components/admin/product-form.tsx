"use client";

import { ImagePlus, Plus, Save, Trash2, X } from "lucide-react";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { adminRequest } from "@/lib/admin-api";
import type { AdminCategory, AdminProduct } from "@/lib/admin-types";

type ProductFormProps = { product?: AdminProduct | null; categories: AdminCategory[]; onSaved: () => void; onCancel: () => void };
type ImageRow = {
  id?: string;
  storage_key: string;
  url: string;
  alt_text: string;
  mime_type?: string;
  size_bytes?: number;
  is_new_upload?: boolean;
  uploading?: boolean;
  error?: string;
};
type UploadTicket = { upload_url: string; storage_key: string; public_url: string; headers: Record<string, string>; expires_in: number };
type Size = "S" | "M" | "L" | "XL";
type VariantRow = { id?: string; sku: string; color: string; size: Size; price: string; compare_at_price: string; stock: string };
const sizes: Size[] = ["S", "M", "L", "XL"];
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageBytes = 5 * 1024 * 1024;
const slugify = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function ProductForm({ product, categories, onSaved, onCancel }: ProductFormProps) {
  const [form, setForm] = useState(() => ({
    name: product?.name ?? "", slug: product?.slug ?? "", short_description: product?.short_description ?? "", description: product?.description ?? "",
    material: product?.material ?? "", care_instructions: product?.care_instructions ?? "", status: product?.status ?? "active",
    is_featured: product?.is_featured ?? false, category_ids: product?.category_ids ?? [],
  }));
  const [images, setImages] = useState<ImageRow[]>(() => product?.images.map((image) => ({ id: image.id, storage_key: image.storage_key, url: image.url, alt_text: image.alt_text ?? "", mime_type: image.mime_type, size_bytes: image.size_bytes })) ?? [{ storage_key: "", url: "", alt_text: "" }]);
  const [variants, setVariants] = useState<VariantRow[]>(() => product?.variants.map((variant) => ({ id: variant.id, sku: variant.sku, color: variant.color ?? "", size: variant.size ?? "M", price: variant.price, compare_at_price: variant.compare_at_price ?? "", stock: String(variant.stock) })) ?? [{ sku: "", color: "", size: "M", price: "", compare_at_price: "", stock: "0" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (field: string, value: string | boolean | string[]) => setForm((current) => ({ ...current, [field]: value }));
  const toggleCategory = (id: string) => set("category_ids", form.category_ids.includes(id) ? form.category_ids.filter((value) => value !== id) : [...form.category_ids, id]);
  const patchImage = (index: number, field: keyof ImageRow, value: string) => setImages((rows) => rows.map((row, i) => i === index ? { ...row, [field]: value } : row));
  const patchVariant = (index: number, field: keyof VariantRow, value: string) => setVariants((rows) => rows.map((row, i) => i === index ? { ...row, [field]: value } : row));

  async function deleteTemporaryImage(image: ImageRow) {
    if (!image.is_new_upload || !image.storage_key) return;
    await adminRequest(`/admin/uploads?storage_key=${encodeURIComponent(image.storage_key)}`, { method: "DELETE" });
  }

  async function uploadImage(index: number, file?: File) {
    if (!file) return;
    if (!allowedImageTypes.has(file.type)) {
      setImages((rows) => rows.map((row, i) => i === index ? { ...row, error: "Usa una imagen JPG, PNG o WebP." } : row));
      return;
    }
    if (file.size > maxImageBytes) {
      setImages((rows) => rows.map((row, i) => i === index ? { ...row, error: "La imagen no puede superar 5 MB." } : row));
      return;
    }
    const previous = images[index];
    setImages((rows) => rows.map((row, i) => i === index ? { ...row, uploading: true, error: "" } : row));
    try {
      const ticket = await adminRequest<UploadTicket>("/admin/uploads/presign", {
        method: "POST",
        body: JSON.stringify({ filename: file.name, content_type: file.type, size_bytes: file.size }),
      });
      const response = await fetch(ticket.upload_url, { method: "PUT", headers: ticket.headers, body: file });
      if (!response.ok) throw new Error("R2 rechazó la carga. Revisa el CORS del bucket.");
      if (previous?.is_new_upload && previous.storage_key !== ticket.storage_key) {
        await deleteTemporaryImage(previous).catch(() => undefined);
      }
      setImages((rows) => rows.map((row, i) => i === index ? {
        ...row,
        storage_key: ticket.storage_key,
        url: ticket.public_url,
        mime_type: file.type,
        size_bytes: file.size,
        is_new_upload: true,
        uploading: false,
        error: "",
      } : row));
    } catch (reason) {
      setImages((rows) => rows.map((row, i) => i === index ? { ...row, uploading: false, error: reason instanceof Error ? reason.message : "No se pudo subir la imagen." } : row));
    }
  }

  async function removeImage(index: number) {
    const image = images[index];
    if (!image || images.length === 1) return;
    await deleteTemporaryImage(image).catch(() => undefined);
    setImages((rows) => rows.filter((_, i) => i !== index));
  }

  async function cancel() {
    await Promise.all(images.map((image) => deleteTemporaryImage(image).catch(() => undefined)));
    onCancel();
  }

  function addAllSizes() {
    const base = variants.at(-1) ?? variants[0];
    const stem = base?.sku.replace(/-(S|M|L|XL)$/i, "") ?? "";
    const existing = new Set(variants.filter((row) => row.color.toLowerCase() === base.color.toLowerCase()).map((row) => row.size));
    setVariants((rows) => [...rows, ...sizes.filter((size) => !existing.has(size)).map((size) => ({ ...base, id: undefined, size, sku: stem ? `${stem}-${size}` : "" }))]);
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    const payload = {
      ...form,
      images: images.map(({ id, storage_key, alt_text }) => ({ id, storage_key, alt_text: alt_text || form.name })),
      variants: variants.map(({ id, sku, color, size, price, compare_at_price, stock }) => ({ id, sku, color: color || null, size, price: Number(price), compare_at_price: compare_at_price ? Number(compare_at_price) : null, stock: Number(stock) })),
    };
    try { await adminRequest(product ? `/admin/products/${product.id}` : "/admin/products", { method: product ? "PATCH" : "POST", body: JSON.stringify(payload) }); onSaved(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo guardar"); }
    finally { setSaving(false); }
  }

  const uploadingImages = images.some((image) => image.uploading);
  const missingImages = images.some((image) => !image.storage_key);

  return <div className="admin-form-wrap"><div className="admin-form-heading"><div><p className="admin-overline">{product ? "Editar producto" : "Nuevo producto"}</p><h3>{product?.name ?? "Añadir al catálogo"}</h3></div><button onClick={cancel} aria-label="Cerrar formulario"><X /></button></div>
    <form className="admin-product-form" onSubmit={submit}>
      <fieldset><legend>Información</legend><div className="admin-form-grid two"><label>Nombre<input required value={form.name} onChange={(event) => { set("name", event.target.value); if (!product) set("slug", slugify(event.target.value)); }} /></label><label>Slug<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(event) => set("slug", event.target.value)} /></label></div><label>Descripción corta<input required minLength={5} maxLength={400} value={form.short_description} onChange={(event) => set("short_description", event.target.value)} /></label><label>Descripción completa<textarea required rows={4} value={form.description} onChange={(event) => set("description", event.target.value)} /></label><div className="admin-form-grid two"><label>Material<input value={form.material} onChange={(event) => set("material", event.target.value)} /></label><label>Cuidados<input value={form.care_instructions} onChange={(event) => set("care_instructions", event.target.value)} /></label></div></fieldset>
      <fieldset><div className="admin-fieldset-title"><legend>Variantes por color y talla</legend><button type="button" onClick={() => setVariants((rows) => [...rows, { sku: "", color: "", size: "M", price: "", compare_at_price: "", stock: "0" }])}><Plus size={15} />Añadir variante</button><button type="button" onClick={addAllSizes}>Completar S–XL</button></div><p className="admin-form-hint">Cada combinación tiene su propio SKU, precio y stock. “Completar S–XL” usa el color y SKU de la última fila.</p><div className="admin-repeat-list">{variants.map((row, index) => <div className="admin-variant-row" key={row.id ?? index}><label>Color<input required value={row.color} onChange={(event) => patchVariant(index, "color", event.target.value)} placeholder="Rojo" /></label><label>Talla<select value={row.size} onChange={(event) => patchVariant(index, "size", event.target.value as Size)}>{sizes.map((size) => <option key={size}>{size}</option>)}</select></label><label>SKU<input required value={row.sku} onChange={(event) => patchVariant(index, "sku", event.target.value.toUpperCase())} /></label><label>Precio S/<input required type="number" min="0.01" step="0.01" value={row.price} onChange={(event) => patchVariant(index, "price", event.target.value)} /></label><label>Anterior S/<input type="number" min="0.01" step="0.01" value={row.compare_at_price} onChange={(event) => patchVariant(index, "compare_at_price", event.target.value)} /></label><label>Stock<input required type="number" min="0" value={row.stock} onChange={(event) => patchVariant(index, "stock", event.target.value)} /></label><button type="button" className="admin-remove-row" disabled={variants.length === 1} onClick={() => setVariants((rows) => rows.filter((_, i) => i !== index))} aria-label="Eliminar variante"><Trash2 size={16} /></button></div>)}</div></fieldset>
      <fieldset><div className="admin-fieldset-title"><legend>Galería (máximo 3)</legend>{images.length < 3 && <button type="button" disabled={uploadingImages} onClick={() => setImages((rows) => [...rows, { storage_key: "", url: "", alt_text: "" }])}><Plus size={15} />Añadir imagen</button>}</div><p className="admin-form-hint">JPG, PNG o WebP de hasta 5 MB. Las imágenes se suben directamente al bucket R2.</p><div className="admin-repeat-list">{images.map((image, index) => <div className="admin-image-row" key={image.id ?? `${image.storage_key}-${index}`}><span>{index + 1}</span><div className="admin-upload-preview">{image.url ? <Image src={image.url} alt={image.alt_text || form.name || `Imagen ${index + 1}`} fill sizes="96px" /> : <ImagePlus size={25} />}</div><label className="admin-file-input">Archivo<input type="file" accept="image/jpeg,image/png,image/webp" disabled={image.uploading} onChange={(event) => { void uploadImage(index, event.target.files?.[0]); event.currentTarget.value = ""; }} /><small>{image.uploading ? "Subiendo a R2..." : image.storage_key ? `${image.mime_type?.replace("image/", "").toUpperCase() ?? "Imagen"} · ${((image.size_bytes ?? 0) / 1024 / 1024).toFixed(2)} MB` : "Selecciona una imagen"}</small>{image.error && <em>{image.error}</em>}</label><label>Texto alternativo<input value={image.alt_text} onChange={(event) => patchImage(index, "alt_text", event.target.value)} placeholder={form.name} /></label><button type="button" className="admin-remove-row" disabled={images.length === 1 || uploadingImages} onClick={() => void removeImage(index)} aria-label="Eliminar imagen"><Trash2 size={16} /></button></div>)}</div></fieldset>
      <fieldset><legend>Publicación</legend><div className="admin-form-grid two"><label>Estado<select value={form.status} onChange={(event) => set("status", event.target.value)}><option value="active">Publicado</option><option value="draft">Borrador</option><option value="archived">Archivado</option></select></label><label className="admin-checkbox featured"><input type="checkbox" checked={form.is_featured} onChange={(event) => set("is_featured", event.target.checked)} />Mostrar como producto destacado</label></div><div className="admin-category-choices"><span>Categorías</span>{categories.map((category) => <label className="admin-checkbox" key={category.id}><input type="checkbox" checked={form.category_ids.includes(category.id)} onChange={() => toggleCategory(category.id)} />{category.name}</label>)}</div></fieldset>
      {error && <p className="admin-form-error">{error}</p>}<div className="admin-form-actions"><button type="button" onClick={cancel}>Cancelar</button><button className="button button-dark" disabled={saving || uploadingImages || missingImages}><Save size={17} />{saving ? "Guardando..." : uploadingImages ? "Subiendo imágenes..." : "Guardar producto"}</button></div>
    </form>
  </div>;
}

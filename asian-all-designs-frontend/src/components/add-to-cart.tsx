"use client";

import { Check, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { money } from "@/lib/api";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/store/cart-store";

const swatches: Record<string, string> = { negro: "#171717", blanco: "#f7f4ef", rojo: "#b92f3d", azul: "#426f9d", crema: "#e7d8bd", rosa: "#dc91a8", verde: "#66806a", gris: "#8a8a8a" };

export function AddToCart({ product }: { product: Product }) {
  const first = product.variants[0];
  const [color, setColor] = useState(first.attributes.color ?? "");
  const [size, setSize] = useState(first.attributes.size ?? "");
  const [added, setAdded] = useState(false);
  const add = useCartStore((state) => state.add);
  const colors = useMemo(() => [...new Set(product.variants.map((item) => item.attributes.color).filter(Boolean))], [product.variants]);
  const sizes = useMemo(() => [...new Set(product.variants.map((item) => item.attributes.size).filter(Boolean))], [product.variants]);
  const matches = (item: typeof first, wantedColor: string, wantedSize: string) => (!wantedColor || item.attributes.color === wantedColor) && (!wantedSize || item.attributes.size === wantedSize);
  const variant = product.variants.find((item) => matches(item, color, size)) ?? product.variants.find((item) => !color || item.attributes.color === color) ?? first;

  function chooseColor(nextColor: string) {
    setColor(nextColor);
    if (!product.variants.some((item) => matches(item, nextColor, size))) setSize(product.variants.find((item) => item.attributes.color === nextColor)?.attributes.size ?? "");
  }
  function handleAdd() {
    add({ variantId: variant.id, productSlug: product.slug, productName: product.name, variantName: variant.name, image: product.images[0]?.url ?? "", price: Number(variant.price), stock: variant.stock });
    setAdded(true); window.setTimeout(() => setAdded(false), 1800);
  }
  return <div className="add-to-cart">
    {colors.length > 0 && <div className="variant-picker"><div className="variant-picker-title"><span>Color</span><strong>{color}</strong></div><div className="color-options">{colors.map((item) => { const available = product.variants.some((variant) => variant.attributes.color === item && variant.stock > 0); return <button key={item} type="button" className={color === item ? "selected" : ""} disabled={!available} onClick={() => chooseColor(item)}><i style={{ background: swatches[item.toLowerCase()] ?? item }} />{item}</button>; })}</div></div>}
    {sizes.length > 0 && <div className="variant-picker"><div className="variant-picker-title"><span>Talla</span><strong>{size}</strong></div><div className="size-options">{sizes.map((item) => { const available = product.variants.some((variant) => matches(variant, color, item) && variant.stock > 0); return <button key={item} type="button" className={size === item ? "selected" : ""} disabled={!available} onClick={() => setSize(item)}>{item}</button>; })}</div></div>}
    <div className="selected-variant"><div><span>{variant.name}</span><small>SKU {variant.sku}</small></div><strong>{money(variant.price)}</strong></div>
    <button className={`button button-dark add-button ${added ? "added" : ""}`} onClick={handleAdd} disabled={!variant.stock}>{added ? <><Check size={20} /> Agregado a tu bolsa</> : <><ShoppingBag size={20} /> Agregar a la bolsa</>}</button>
    <p>{variant.stock > 0 ? `Disponible · ${variant.stock} unidades en esta combinación` : "Agotado temporalmente"}</p>
  </div>;
}

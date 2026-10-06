import type { Product, ProductPage } from "./types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export async function getProducts(params: { search?: string; category?: string; sort?: string } = {}): Promise<ProductPage> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.sort) query.set("sort", params.sort);
  try {
    const response = await fetch(`${API_URL}/catalog/products?${query}`, { cache: "no-store", signal: AbortSignal.timeout(1800) });
    if (!response.ok) throw new Error("catalog unavailable");
    return response.json();
  } catch {
    return { items: [], total: 0, page: 1, page_size: 24 };
  }
}

export async function getProduct(slug: string): Promise<Product | null> {
  try {
    const response = await fetch(`${API_URL}/catalog/products/${slug}`, { cache: "no-store", signal: AbortSignal.timeout(1800) });
    if (!response.ok) throw new Error("product unavailable");
    return response.json();
  } catch { return null; }
}

export const money = (value: string | number) => new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(Number(value));

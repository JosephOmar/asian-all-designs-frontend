export type Category = { id: string; name: string; slug: string; kind: string; description?: string | null };
export type ProductImage = { url: string; alt_text: string; sort_order: number };
export type ProductVariant = {
  id: string; sku: string; name: string; attributes: Record<string, string>;
  price: string; compare_at_price?: string | null; stock: number;
};
export type Product = {
  id: string; name: string; slug: string; short_description: string; description: string;
  material?: string | null; care_instructions?: string | null; is_featured: boolean;
  images: ProductImage[]; variants: ProductVariant[]; categories: Category[];
};
export type ProductPage = { items: Product[]; total: number; page: number; page_size: number };

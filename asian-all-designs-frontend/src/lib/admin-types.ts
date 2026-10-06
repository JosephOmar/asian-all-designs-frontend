export type AdminUser = {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  role: "customer" | "admin";
};

export type AdminOverview = {
  products: number;
  active_products: number;
  low_stock_variants: number;
  pending_orders: number;
  customers: number;
  completed_revenue: string;
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  kind: string;
  description?: string | null;
};

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  material?: string | null;
  care_instructions?: string | null;
  status: "draft" | "active" | "archived";
  is_featured: boolean;
  category_ids: string[];
  category_names: string[];
  images: Array<{
    id: string;
    storage_key: string;
    url: string;
    alt_text?: string | null;
    mime_type: string;
    size_bytes: number;
    sort_order: number;
  }>;
  variants: Array<{
    id: string;
    sku: string;
    name: string;
    color?: string | null;
    size?: "S" | "M" | "L" | "XL" | null;
    price: string;
    compare_at_price?: string | null;
    stock: number;
    is_active: boolean;
  }>;
  created_at: string;
  updated_at: string;
};

export type AdminOrder = {
  id: string;
  order_number: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_notes?: string | null;
  total: string;
  currency: string;
  created_at: string;
  items: Array<{
    product_name: string;
    variant_name: string;
    sku: string;
    unit_price: string;
    quantity: number;
    line_total: string;
  }>;
};

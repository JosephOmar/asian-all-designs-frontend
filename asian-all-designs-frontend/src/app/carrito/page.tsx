import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = { title: "Mi bolsa | Asian All Designs" };
export default function CartPage() { return <main className="cart-page shell"><CartView /></main>; }

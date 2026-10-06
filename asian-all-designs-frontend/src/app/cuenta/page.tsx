import type { Metadata } from "next";
import { AccountView } from "@/components/account-view";

export const metadata: Metadata = { title: "Mi cuenta | Asian All Designs" };
export default function AccountPage() { return <main className="account-page shell"><AccountView /></main>; }

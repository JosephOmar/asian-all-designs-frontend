import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata: Metadata = {
  title: "Administración | Asian All Designs",
  robots: { index: false, follow: false },
};

export default function AdminPage() { return <AdminDashboard />; }

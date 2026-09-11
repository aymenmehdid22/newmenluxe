import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="text-sm font-extrabold tracking-tight">
            COD STORE — ADMIN
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin" className="text-muted transition hover:text-black">
              Dashboard
            </Link>
            <Link href="/admin/orders" className="text-muted transition hover:text-black">
              Commandes
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </div>
  );
}

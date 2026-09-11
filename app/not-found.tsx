import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-extrabold">Page introuvable</h1>
      <p className="text-sm text-muted">Le produit demandé n'existe pas.</p>
      <Link href="/" className="btn-primary">Retour à la boutique</Link>
    </main>
  );
}

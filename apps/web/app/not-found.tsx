import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <h1 className="mb-3 text-5xl font-black text-primary">404</h1>
      <p className="mb-6 text-text-muted">Page not found.</p>
      <Link href="/" className="rounded-xl bg-primary px-6 py-2.5 font-semibold text-white hover:opacity-90">
        Back to Home
      </Link>
    </div>
  );
}

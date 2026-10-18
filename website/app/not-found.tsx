import Link from "next/link";

export default function NotFound() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div className="text-center">
        <p className="text-7xl font-extrabold text-gpred font-[family-name:var(--font-poppins)]">404</p>
        <h1 className="mt-3 text-2xl font-bold text-gpnavy">Page not found</h1>
        <p className="mt-2 text-gray-600 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist. It may have been moved or removed.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="rounded-full bg-gpred px-6 py-3 font-semibold text-white shadow hover:bg-red-700"
          >
            Go to Home
          </Link>
          <Link
            href="/products"
            className="rounded-full border-2 border-gpnavy px-6 py-3 font-semibold text-gpnavy hover:bg-gpnavy hover:text-white"
          >
            View Products
          </Link>
        </div>
      </div>
    </section>
  );
}

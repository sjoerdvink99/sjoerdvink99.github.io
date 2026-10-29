import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="mb-4 text-6xl font-light text-gray-300">404</p>
      <h1 className="mb-2 text-xl font-semibold">Page not found</h1>
      <p className="mb-6 text-gray-600">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="text-sm text-gray-500 transition-colors hover:text-blue-600"
      >
        ← Home
      </Link>
    </div>
  );
}

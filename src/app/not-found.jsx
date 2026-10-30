import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f4faf6] flex flex-col items-center justify-center p-6 text-center text-[#0f241d]">
      <h1 className="text-4xl font-extrabold tracking-tight">404 - Page Not Found</h1>
      <p className="mt-2 text-[#475569] max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#059669] text-white font-semibold shadow hover:bg-[#047857] transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}


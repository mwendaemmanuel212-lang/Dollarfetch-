
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#101C32] text-white flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md text-center">

        <div className="mb-8">
          <div className="text-3xl font-black tracking-widest text-[#F5D47A]">
            DOLLARFETCH
          </div>
          <p className="text-xs tracking-[4px] text-gray-400 mt-2">
            POWERED BY BWK SOLUTIONS
          </p>
        </div>

        <div className="relative mb-8">
          <div className="text-8xl mb-5">
            🎁
          </div>
          <div className="text-3xl text-[#F5D47A]">
            ✨ 🪙 ✨
          </div>
        </div>

        <h1 className="text-4xl font-extrabold text-[#F5D47A] mb-4">
          Welcome Aboard!
        </h1>

        <p className="text-gray-200 text-lg mb-3">
          Your journey starts here.
        </p>

        <p className="text-gray-400 leading-relaxed mb-9">
          Discover opportunities, complete tasks
          and earn rewards with DollarFetch.
        </p>

        <Link
          href="/login"
          className="block w-full rounded-full bg-gradient-to-r from-[#F5D47A] to-[#D49B27] text-[#101C32] font-extrabold py-4 text-lg shadow-lg hover:scale-105 transition-transform"
        >
          GET STARTED →
        </Link>

        <p className="text-gray-500 text-xs mt-10">
          © 2026 DollarFetch. All rights reserved.
        </p>

      </div>
    </main>
  );
}

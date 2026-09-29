import React from 'react';
import Link from 'next/link';
import { Sprout, Home, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-8 shadow-sm">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-[var(--tint)] flex items-center justify-center text-[var(--green)]">
          <Sprout className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-[var(--green)] uppercase tracking-wider">
            ৪০৪ • পৃষ্ঠা পাওয়া যায়নি
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-[var(--ink)]">
            কাঙ্ক্ষিত পাতাটি বিদ্যমান নেই
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
            আপনি যে লিংকটি খুঁজছেন তা মুছে ফেলা হতে পারে অথবা ভুল ইউআরএল প্রদান করা হয়েছে।
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--green)] text-white text-xs font-bold hover:bg-[var(--green-hover)] transition-all shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>মূল পাতায় ফিরুন</span>
          </Link>

          <Link
            href="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--tint)] text-[var(--green)] text-xs font-bold hover:bg-[var(--tint)]/80 transition-all border border-[var(--card-border)]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>ফসল বাজার দেখুন</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

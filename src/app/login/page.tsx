'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { motion } from 'framer-motion';
import {
  Sprout,
  ShieldCheck,
  Tractor,
  ShoppingBag,
  TrendingUp,
  LogIn,
  AlertCircle,
  KeyRound,
  Mail,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    {
      role: 'ADMIN',
      name: t.auth.roleAdmin,
      email: 'admin@krishibazar.gov.bd',
      icon: ShieldCheck,
      color: 'bg-emerald-800 text-white hover:bg-emerald-900',
    },
    {
      role: 'PRICE_EDITOR',
      name: t.auth.roleEditor,
      email: 'editor@krishibazar.gov.bd',
      icon: TrendingUp,
      color: 'bg-amber-700 text-white hover:bg-amber-800',
    },
    {
      role: 'FARMER',
      name: t.auth.roleFarmer,
      email: 'farmer.rahim@krishibazar.com',
      icon: Tractor,
      color: 'bg-green-700 text-white hover:bg-green-800',
    },
    {
      role: 'BUYER',
      name: t.auth.roleBuyer,
      email: 'buyer.hasan@krishibazar.com',
      icon: ShoppingBag,
      color: 'bg-teal-700 text-white hover:bg-teal-800',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(
          language === 'bn'
            ? 'ভুল ইমেইল বা পাসওয়ার্ড প্রদান করা হয়েছে।'
            : 'Invalid email or password.'
        );
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError(
        language === 'bn'
          ? 'লগইন করার সময় ত্রুটি হয়েছে।'
          : 'An unexpected error occurred during login.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (accEmail: string) => {
    setEmail(accEmail);
    setPassword('Krishi@123456');
    setError(null);
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email: accEmail,
        password: 'Krishi@123456',
        redirect: false,
      });

      if (!res?.error) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError(res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
      >
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--green)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.common.home}</span>
        </Link>

        {/* Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[var(--green)] text-white mx-auto flex items-center justify-center shadow-sm">
            <Sprout className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-[var(--ink)]">
            {t.auth.loginTitle}
          </h1>
          <p className="text-xs text-[var(--muted)]">{t.auth.loginSubtitle}</p>
        </div>

        {/* 1-Click Role Login Selector */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider block">
            {t.auth.quickLoginNotice}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((acc) => {
              const Icon = acc.icon;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleQuickLogin(acc.email)}
                  disabled={loading}
                  className={`p-2.5 rounded-xl text-left text-xs font-bold transition-all shadow-xs flex items-center gap-2 active:scale-95 ${acc.color}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{acc.name}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-center text-[var(--muted)]">
            {language === 'bn'
              ? 'সব ডেমো একাউন্টের পাসওয়ার্ড: Krishi@123456'
              : 'Default password for all demo accounts: Krishi@123456'}
          </p>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-[var(--card-border)]"></div>
          <span className="flex-shrink mx-3 text-[10px] text-[var(--muted)] uppercase tracking-wider">
            {language === 'bn' ? 'অথবা ইমেইল দিয়ে প্রবেশ করুন' : 'Or login with email'}
          </span>
          <div className="flex-grow border-t border-[var(--card-border)]"></div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Email Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--ink)] block">
              {t.auth.email}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@krishibazar.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] text-xs text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]/20 focus:border-[var(--green)] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--ink)] block">
              {t.auth.password}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] text-xs text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--green)]/20 focus:border-[var(--green)] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[var(--green)] text-white text-xs font-bold hover:bg-[var(--green-hover)] transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? t.auth.loggingIn : t.auth.submit}</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--green)] border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}


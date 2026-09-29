'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/lib/cart/CartContext';
import {
  Sprout,
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  Tractor,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  LayoutDashboard,
} from 'lucide-react';

export function Navbar() {
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const { totalItemCount } = useCart();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t.common.home },
    { href: '/products', label: t.common.browseProducts },
    { href: '/market-prices', label: t.common.marketPrices },
    { href: '/transport', label: t.common.transportRent },
  ];

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Admin', icon: ShieldCheck, color: 'bg-emerald-800 text-white' };
      case 'PRICE_EDITOR':
        return { label: 'Editor', icon: TrendingUp, color: 'bg-amber-700 text-white' };
      case 'FARMER':
        return { label: 'Farmer', icon: Tractor, color: 'bg-green-700 text-white' };
      default:
        return { label: 'Buyer', icon: ShoppingBag, color: 'bg-teal-700 text-white' };
    }
  };

  const userRole = (session?.user as { role?: string })?.role;
  const roleInfo = userRole ? getRoleBadge(userRole) : null;

  const dashboardLink = userRole === 'FARMER'
    ? { href: '/farmer', label: language === 'bn' ? 'ফার্মার ড্যাশবোর্ড' : 'Farmer Panel' }
    : userRole === 'ADMIN' || userRole === 'PRICE_EDITOR'
    ? { href: '/admin', label: language === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin Panel' }
    : session?.user
    ? { href: '/orders', label: language === 'bn' ? 'আমার অর্ডার' : 'My Orders' }
    : null;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg)]/90 border-b border-[var(--card-border)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[var(--green)] flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold font-heading text-[var(--ink)] block leading-tight">
                {t.common.siteName}
              </span>
              <span className="text-[10px] text-[var(--muted)] font-medium block">
                {language === 'bn' ? 'কৃষক টু মার্কেট' : 'Farmer to Market'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--tint)] text-[var(--green)] font-semibold'
                      : 'text-[var(--ink)]/80 hover:text-[var(--green)] hover:bg-[var(--tint)]/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {dashboardLink && (
              <Link
                href={dashboardLink.href}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith(dashboardLink.href)
                    ? 'bg-[var(--green)] text-white font-semibold'
                    : 'text-[var(--green)] hover:bg-[var(--tint)] font-semibold'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>{dashboardLink.label}</span>
              </Link>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative p-2 rounded-lg border border-[var(--card-border)] text-[var(--ink)] hover:bg-[var(--tint)]/60 transition-colors"
              title={t.common.cart}
            >
              <ShoppingCart className="w-4 h-4 text-[var(--green)]" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[var(--green)] text-white text-[10px] font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center shadow-sm">
                  {totalItemCount}
                </span>
              )}
            </Link>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--card-border)] text-xs font-semibold text-[var(--ink)] hover:bg-[var(--tint)]/60 transition-colors"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-[var(--green)]" />
              <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-[var(--card-border)] text-[var(--ink)] hover:bg-[var(--tint)]/60 transition-colors"
              title={t.common.toggleTheme}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[var(--muted)]" />
              )}
            </button>

            {/* Auth Button or User Profile */}
            {session?.user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[var(--card-border)]">
                <div className="text-right">
                  <div className="text-xs font-semibold text-[var(--ink)] truncate max-w-[120px]">
                    {session.user.name}
                  </div>
                  {roleInfo && (
                    <span
                      className={`inline-block text-[10px] px-1.5 py-0.2 rounded font-medium ${roleInfo.color}`}
                    >
                      {roleInfo.label}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-1.5 rounded-lg border border-[var(--card-border)] text-[var(--down)] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title={t.common.logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--green)] text-white text-xs font-semibold hover:bg-[var(--green-hover)] transition-all shadow-sm active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.common.login}</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-1.5 md:hidden">
            <Link
              href="/cart"
              className="relative p-1.5 rounded-md border border-[var(--card-border)] text-[var(--ink)]"
              aria-label="Cart"
            >
              <ShoppingCart className="w-4 h-4 text-[var(--green)]" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--green)] text-white text-[9px] font-bold rounded-full min-w-4 h-4 px-0.5 flex items-center justify-center">
                  {totalItemCount}
                </span>
              )}
            </Link>
            <button
              onClick={toggleLanguage}
              className="p-1.5 rounded-md border border-[var(--card-border)] text-xs font-bold text-[var(--ink)]"
            >
              {language === 'bn' ? 'EN' : 'বাং'}
            </button>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md border border-[var(--card-border)] text-[var(--ink)]"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[var(--ink)] hover:bg-[var(--tint)]"
              aria-label="Open mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--card-border)] bg-[var(--bg)] px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[var(--ink)] hover:bg-[var(--tint)]"
            >
              {link.label}
            </Link>
          ))}
          {dashboardLink && (
            <Link
              href={dashboardLink.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[var(--green)] bg-[var(--tint)]"
            >
              {dashboardLink.label}
            </Link>
          )}
          <div className="pt-2 border-t border-[var(--card-border)] flex items-center justify-between">
            {session?.user ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[var(--muted)]" />
                  <div>
                    <div className="text-xs font-bold text-[var(--ink)]">{session.user.name}</div>
                    <div className="text-[10px] text-[var(--muted)]">{session.user.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="px-2.5 py-1 text-xs rounded border border-red-300 text-red-600"
                >
                  {t.common.logout}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-lg bg-[var(--green)] text-white text-sm font-semibold"
              >
                {t.common.login}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

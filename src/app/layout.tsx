import type { Metadata } from 'next';
import { Bricolage_Grotesque, Hind_Siliguri } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/lib/cart/CartContext';

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
});

const hindSiliguri = Hind_Siliguri({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['bengali', 'latin'],
  variable: '--font-hind-siliguri',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'কৃষিবাজার | KrishiBazar - বাংলাদেশের ডিজিটাল কৃষি মার্কেটপ্লেস',
  description:
    'বাংলাদেশের প্রথম কৃষকবান্ধব উন্মুক্ত কৃষি বাজার। কৃষক সরাসরি ফসল বিক্রি করুন এবং ক্রেতা সাশ্রয়ী মূল্যে সংগ্রহ করুন। ৩০ দিনের লাইভ বাজার দর ও পরিবহন ভাড়ার নির্ভুল হিসাব।',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning className={`${bricolageGrotesque.variable} ${hindSiliguri.variable}`}>
      <body className="min-h-screen flex flex-col font-sans antialiased selection:bg-[var(--tint)] selection:text-[var(--green)]">
        <SessionProvider>
          <ThemeProvider>
            <LanguageProvider>
              <CartProvider>
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </CartProvider>
            </LanguageProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

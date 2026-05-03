'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations('nav');
  const params = useParams();
  const locale = params.locale as string;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#work', label: t('work') },
    { href: '#how-we-work', label: t('howWeWork') },
    { href: '#about', label: t('about') },
    { href: '#contact', label: t('contact') },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/85 backdrop-blur-md border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href={`/${locale}`} className="relative h-10 w-36 flex-none">
            <Image
              src="/images/logo-default-362x90.png"
              alt="Scintechn"
              fill
              className="object-contain object-left"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
                >
                  {link.label}
                </a>
              </li>
            ))}

            {/* Language Switcher */}
            <li className="flex items-center gap-1 rounded-full border border-border p-0.5">
              <Link
                href="/en"
                className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-colors ${
                  locale === 'en'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                EN
              </Link>
              <Link
                href="/pt"
                className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-colors ${
                  locale === 'pt'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                PT
              </Link>
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 -mr-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <div className="space-y-1.5">
              <span className="block w-6 h-0.5 bg-foreground" />
              <span className="block w-6 h-0.5 bg-foreground" />
              <span className="block w-6 h-0.5 bg-foreground" />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div id="mobile-menu" className="lg:hidden mt-4 pb-2">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="block py-3 text-base font-medium text-foreground/80 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="flex gap-2 pt-3">
                <Link
                  href="/en"
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                    locale === 'en'
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border text-muted-foreground'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  EN
                </Link>
                <Link
                  href="/pt"
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                    locale === 'pt'
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border text-muted-foreground'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  PT
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations('nav');
  const params = useParams();
  const locale = params.locale as string;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#work', label: t('work') },
    { href: '#approach', label: t('approach') },
    { href: '#about', label: t('about') },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-background/85 backdrop-blur-md border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-6">
          <Link
            href={`/${locale}`}
            className="flex-none"
            aria-label="Scintechn — Home"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/scintechn-lockup-light.svg"
              alt="Scintechn"
              className="h-12 md:h-14 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70 transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}

            <li>
              <a
                href="#contact"
                className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-primary transition-colors hover:text-primary/80"
              >
                {t('startProject')}
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </li>

            {/* Language Switcher */}
            <li className="ml-2 flex items-center gap-1 rounded-full border border-border p-0.5">
              <Link
                href="/en"
                className={`font-mono px-2.5 py-0.5 text-[10px] font-semibold uppercase rounded-full transition-colors ${
                  locale === 'en'
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                EN
              </Link>
              <Link
                href="/pt"
                className={`font-mono px-2.5 py-0.5 text-[10px] font-semibold uppercase rounded-full transition-colors ${
                  locale === 'pt'
                    ? 'bg-foreground text-background'
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
                    className="block py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-foreground/80 hover:text-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-1.5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('startProject')}
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </li>
              <li className="flex gap-2 pt-3">
                <Link
                  href="/en"
                  className={`font-mono px-3 py-1.5 text-[10px] font-semibold uppercase rounded-full ${
                    locale === 'en'
                      ? 'bg-foreground text-background'
                      : 'border border-border text-muted-foreground'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  EN
                </Link>
                <Link
                  href="/pt"
                  className={`font-mono px-3 py-1.5 text-[10px] font-semibold uppercase rounded-full ${
                    locale === 'pt'
                      ? 'bg-foreground text-background'
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

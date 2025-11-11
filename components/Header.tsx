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
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#about', label: t('about') },
    { href: '#what-we-do', label: t('whatWeDo') },
    { href: '#our-projects', label: t('ourProjects') },
    { href: '#contact', label: t('contact') },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="relative h-12 w-44">
            <Image
              src={isScrolled ? '/images/logo-default-362x90.png' : '/images/logo-inverse-362x90.png'}
              alt="Scintechn"
              fill
              className="object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`font-medium transition-colors hover:text-[#90469b] ${
                    isScrolled ? 'text-gray-800' : 'text-white'
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}

            {/* Language Switcher */}
            <li className="flex items-center space-x-2">
              <Link
                href="/pt"
                className={`px-3 py-1 rounded ${
                  locale === 'pt' ? 'bg-[#90469b] text-white' : isScrolled ? 'text-gray-800' : 'text-white'
                }`}
              >
                PT
              </Link>
              <Link
                href="/en"
                className={`px-3 py-1 rounded ${
                  locale === 'en' ? 'bg-[#90469b] text-white' : isScrolled ? 'text-gray-800' : 'text-white'
                }`}
              >
                EN
              </Link>
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="space-y-2">
              <span className={`block w-8 h-0.5 ${isScrolled ? 'bg-gray-800' : 'bg-white'}`} />
              <span className={`block w-8 h-0.5 ${isScrolled ? 'bg-gray-800' : 'bg-white'}`} />
              <span className={`block w-8 h-0.5 ${isScrolled ? 'bg-gray-800' : 'bg-white'}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4">
            <ul className="space-y-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`block font-medium ${isScrolled ? 'text-gray-800' : 'text-white'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="flex space-x-2 pt-2">
                <Link href="/pt" className="px-4 py-2 rounded bg-[#90469b] text-white">
                  PT
                </Link>
                <Link href="/en" className="px-4 py-2 rounded bg-[#90469b] text-white">
                  EN
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}

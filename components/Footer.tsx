'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Linkedin, Instagram, MessageCircle, Mail } from 'lucide-react';

const SOCIAL = [
  {
    key: 'linkedin' as const,
    href: 'https://www.linkedin.com/in/scintylla/',
    Icon: Linkedin,
  },
  {
    key: 'instagram' as const,
    href: 'https://www.instagram.com/scintechn/',
    Icon: Instagram,
  },
  {
    key: 'whatsapp' as const,
    href: 'https://wa.me/5511969111424',
    Icon: MessageCircle,
  },
];

export default function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="border-t border-border bg-secondary/30">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="relative h-10 w-36 mb-4">
              <Image
                src="/images/logo-default-362x90.png"
                alt="Scintechn"
                fill
                className="object-contain object-left"
              />
            </div>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              {t('tagline')}
            </p>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              {t('sections.navigate')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#work" className="text-muted-foreground hover:text-primary transition">
                  {tNav('work')}
                </a>
              </li>
              <li>
                <a href="#how-we-work" className="text-muted-foreground hover:text-primary transition">
                  {tNav('howWeWork')}
                </a>
              </li>
              <li>
                <a href="#about" className="text-muted-foreground hover:text-primary transition">
                  {tNav('about')}
                </a>
              </li>
              <li>
                <a href="#contact" className="text-muted-foreground hover:text-primary transition">
                  {tNav('contact')}
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              {t('sections.contact')}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="mailto:contact@scintechn.com"
                  className="inline-flex items-center gap-2 hover:text-primary transition"
                >
                  <Mail className="h-4 w-4" aria-hidden />
                  contact@scintechn.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/5511969111424"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-primary transition"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  +55 11 96911-1424
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              {t('sections.follow')}
            </h3>
            <ul className="flex gap-2">
              {SOCIAL.map(({ key, href, Icon }) => (
                <li key={key}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t(`social.${key}`)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-3">
            <span>&copy; {currentYear} {t('legal.company')}.</span>
            <span className="hidden md:inline text-border">•</span>
            <span>{t('legal.cnpj')}</span>
          </div>
          <p>{t('rights')}</p>
        </div>
      </div>
    </footer>
  );
}

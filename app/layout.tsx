import type { Metadata } from "next";
import { Roboto, Merriweather } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ["latin"],
  variable: '--font-roboto',
  display: 'swap',
});

const merriweather = Merriweather({
  weight: ['300', '400', '700', '900'],
  subsets: ["latin"],
  variable: '--font-merriweather',
  display: 'swap',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: "Scintech | Soluções Digitais inovadoras e Automação para Negócios",
  description: "Scintech, especialista em automação e soluções digitais, transforma negócios com inovação e eficiência. Acelere o futuro da sua empresa hoje mesmo!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className={`${roboto.variable} ${merriweather.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

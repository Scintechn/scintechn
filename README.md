# Scintechn - Corporate Website

Modern, responsive corporate website for Scintechn, built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- 🌍 **Bilingual** (Portuguese/English) with next-intl
- ⚡ **Next.js 15** with App Router and Server Components
- 🎨 **Tailwind CSS** for styling
- ✨ **Framer Motion** animations
- 📧 **Contact form** with Nodemailer
- 🔍 **SEO optimized** with metadata and structured data
- 📱 **Fully responsive** design
- 🚀 **Image & Font optimization**

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your SMTP credentials

# Run development server
npm run dev
```

Open [http://localhost:3000/pt](http://localhost:3000/pt) or [http://localhost:3000/en](http://localhost:3000/en)

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── [locale]/        # Localized routes
│   ├── api/contact/     # Contact form API
│   └── globals.css      # Global styles
├── components/          # React components
├── i18n/               # Internationalization config
├── messages/           # Translation files
└── public/             # Static assets
```

## Environment Variables

Required variables in `.env.local`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
RECIPIENT_EMAIL=contact@scintechn.com
```

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **i18n**: next-intl
- **Email**: Nodemailer

## License

Private - All rights reserved

## Contact

For inquiries, visit [scintechn.com](https://scintechn.com)

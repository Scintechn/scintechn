'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('whatsapp');

  // Replace with your actual WhatsApp number (format: country code + number, no spaces or symbols)
  const whatsappNumber = '5511969111424'; // Example: Brazil number
  const message = encodeURIComponent(t('prefilledMessage'));
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {isOpen && (
          <div className="mb-4 bg-white rounded-2xl shadow-2xl p-6 w-80 animate-fade-in">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-2xl">
                💬
              </div>
              <div className="ml-3 flex-1">
                <h3 className="font-bold text-gray-900">{t('title')}</h3>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm text-green-600">{t('online')}</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-4">{t('message')}</p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors"
            >
              {t('button')}
            </a>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl hover:scale-110 transition-all relative"
          aria-label="Open WhatsApp"
        >
          <svg
            viewBox="0 0 32 32"
            className="w-8 h-8"
            fill="currentColor"
          >
            <path d="M16 0c-8.837 0-16 7.163-16 16 0 2.825 0.737 5.607 2.137 8.048l-2.137 7.952 7.933-2.127c2.42 1.37 5.173 2.127 8.067 2.127 8.837 0 16-7.163 16-16s-7.163-16-16-16zM16 29.467c-2.482 0-4.908-0.646-7.07-1.87l-0.507-0.292-4.713 1.262 1.262-4.669-0.292-0.508c-1.207-2.100-1.847-4.507-1.847-6.924 0-7.435 6.050-13.485 13.485-13.485s13.485 6.050 13.485 13.485c0 7.435-6.050 13.485-13.485 13.485zM21.960 18.293c-0.385-0.193-2.273-1.122-2.625-1.25s-0.608-0.193-0.865 0.193c-0.257 0.385-0.997 1.250-1.222 1.508s-0.45 0.289-0.835 0.096c-0.385-0.193-1.625-0.598-3.096-1.910-1.144-1.020-1.916-2.279-2.141-2.664s-0.024-0.593 0.169-0.785c0.174-0.174 0.385-0.450 0.578-0.676s0.257-0.385 0.385-0.643c0.128-0.257 0.064-0.482-0.032-0.676s-0.865-2.081-1.184-2.849c-0.311-0.75-0.627-0.648-0.865-0.661-0.223-0.012-0.478-0.015-0.733-0.015s-0.669 0.096-1.021 0.482c-0.353 0.385-1.346 1.315-1.346 3.206s1.378 3.718 1.571 3.975c0.193 0.257 2.706 4.138 6.559 5.804 0.916 0.395 1.631 0.631 2.188 0.808 0.921 0.292 1.759 0.251 2.421 0.152 0.738-0.111 2.273-0.929 2.594-1.826s0.321-1.667 0.225-1.826c-0.096-0.159-0.353-0.257-0.738-0.45z" />
          </svg>
          {!isOpen && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              1
            </span>
          )}
        </button>
      </div>
    </>
  );
}

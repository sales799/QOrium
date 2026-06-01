import * as React from 'react';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { ChatbotWidget } from '@/components/chatbot/ChatbotWidget';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <ChatbotWidget />
    </>
  );
}

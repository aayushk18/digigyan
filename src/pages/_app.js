// src/pages/_app.js
import { Inter } from 'next/font/google';
import WakeLock from '../components/shared/WakeLock';
import '../styles/globals.css';
import { AppProvider } from '@/context/AppContext';

// Configure the font
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

export default function App({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${inter.style.fontFamily};
        }
      `}</style>

      {/* Global utility to prevent device sleep */}
      <WakeLock />

      <main className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] antialiased">
        <AppProvider>
          <Component {...pageProps} />
        </AppProvider>
      </main>
    </>
  );
}
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import '@/styles/globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import Providers from '@/queries/QueryProviders';
import { TailwindIndicator } from '@/components/TailwindIndicator';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={cn(poppins.className, 'h-full')}>
        <Providers>
          {children}
          <Toaster />

          <TailwindIndicator />
        </Providers>
      </body>
    </html>
  );
}
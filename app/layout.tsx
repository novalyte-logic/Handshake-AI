import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { ThemeProvider } from '@/lib/ThemeContext';

export const metadata: Metadata = {
  title: 'ProofReach - Evidence-Based Career Workspace',
  description: 'Identify suitable roles, prepare truthful application materials, research employers, and conduct verified outreach.',
  openGraph: {
    title: 'ProofReach - Evidence-Based Career Workspace',
    description: 'Identify suitable roles, prepare truthful application materials, research employers, and conduct verified outreach.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProofReach - Evidence-Based Career Workspace',
    description: 'Identify suitable roles, prepare truthful application materials, research employers, and conduct verified outreach.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DeepShield AI',
  description: 'Next-gen deepfake detection for images and audio.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

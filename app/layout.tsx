import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "80/20: The Game",
  description: "80/20 Split Game",
  icons:
    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><text y="24" font-size="24">🐔</text></svg>',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

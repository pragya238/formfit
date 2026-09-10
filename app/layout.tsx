import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FormFit — Make your next upload fit",
  description: "Convert, resize, and compress images and PDFs to fit online form requirements. Files are processed in your browser.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

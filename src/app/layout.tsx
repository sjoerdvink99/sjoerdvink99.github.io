import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const description =
  "PhD candidate in Computer Science at Utrecht University and Tufts University, studying representations for human–AI interaction.";

export const metadata: Metadata = {
  metadataBase: new URL("https://sjoerdvink99.github.io/"),
  title: {
    template: "%s | Sjoerd Vink",
    default: "Sjoerd Vink",
  },
  description,
  openGraph: {
    title: "Sjoerd Vink",
    description,
    url: "https://sjoerdvink99.github.io/",
    siteName: "Sjoerd Vink",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-white font-sans text-gray-900 antialiased">
        <div className="h-1.5 w-full bg-blue-600" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}

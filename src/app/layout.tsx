import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Sjoerd Vink",
    default: "Sjoerd Vink",
  },
  description:
    "PhD student in Computer Science at Utrecht University. Working on intent representation in AI and data analysis.",
  openGraph: {
    title: "Sjoerd Vink",
    description: "PhD student in Computer Science at Utrecht University.",
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
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">
        <div className="h-1 w-full bg-blue-600" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}

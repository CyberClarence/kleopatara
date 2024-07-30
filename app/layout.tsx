import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kleopatra PGP Client",
  description:
    "OpenSource, Free, Private & easy to use OPENPGP Client for the internet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`flex flex-col overflow-auto w-screen h-screen bg-black text-white ${inter.className} select-none`}
      >
        {children}
      </body>
    </html>
  );
}

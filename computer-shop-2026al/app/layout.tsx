import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: {
    default: "Computer Shop",
    template: "%s | Computer Shop",
  },
  description:
    "Projekt sklepu komputerowego przygotowany w ramach laboratorium z Programowania BackEnd.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>
        <header>
          <div className="container">
            <p className="site-title">Computer Shop</p>
            <Navigation />
          </div>
        </header>

        {children}

        <footer>
          <div className="container">
            <p>Computer Shop © 2026</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
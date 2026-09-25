import "./globals.css";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://scrapmart.vercel.app";

export const metadata: Metadata = {
  title: "ScrapMart — Buy & Sell Scrap",
  description: "Scrap catalog and WhatsApp enquiries. Apna scrap dekho, details samjho aur seedha WhatsApp par baat karo.",
  metadataBase: new URL(siteUrl),
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="nav">
        <div className="container navin">
          <a className="brand" href="/">♻️ ScrapMart</a>
          <a href="/sell" className="btn green">Sell Your Scrap</a>
        </div>
      </header>
      {children}
      <footer className="footer">
        <div className="container">© ScrapMart — Buy & sell scrap through WhatsApp.</div>
      </footer>
    </>
  );
}

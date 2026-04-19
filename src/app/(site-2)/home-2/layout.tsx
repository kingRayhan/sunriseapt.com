import { DEFAULT_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/seo";
import type { Metadata } from "next";
import Footer from "./_components/Footer";
import Navbar from "./_components/Navbar";
import "../../globals.css";

const defaultTitle = `${SITE_NAME} - Premium Real Estate`;

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: defaultTitle,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: SITE_NAME,
    title: defaultTitle,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: "/full-logo.png", alt: `${SITE_NAME} logo` }],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: DEFAULT_DESCRIPTION,
    images: ["/full-logo.png"],
  },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/favicon.png", type: "image/png" }],
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}

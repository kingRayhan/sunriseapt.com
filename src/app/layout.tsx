import type { Metadata } from "next";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Sunriseapt - Premium Real Estate",
    template: "%s | Sunriseapt",
  },
  description:
    "Your trusted partner in finding the perfect property. Premium properties in South Florida's most desirable locations.",
  openGraph: {
    title: "Sunriseapt - Premium Real Estate",
    description:
      "Your trusted partner in finding the perfect property. Premium properties in South Florida's most desirable locations.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="min-h-screen">
            <Navbar />
            {children}
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}

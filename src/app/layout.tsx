import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Sunriseapt - Premium Real Estate",
    template: "%s | Sunriseapt",
  },
  description:
    "Sunrise Apartments ltd is a Real Estate company that creates living spaces that seamlessly blend luxury and nature. We believe that everyone deserves to live in a beautiful, sustainable environment, and we are committed to creating apartments that are both stylish and eco-friendly.",
  openGraph: {
    title: "Sunrise Apartments ltd - Premium Real Estate",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/favicon.png",
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
        <ClerkProvider>
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}

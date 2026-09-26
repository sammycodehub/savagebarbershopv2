import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Savage Lifestyle Barber Shop | Premium Cuts, Zero Wait",
  description:
    "Book your next cut at Savage Lifestyle Barber Shop. Browse services, pick a time, and pay online or in person — confirmed straight to WhatsApp.",
  metadataBase: new URL("https://savagelifestylebarbershop.com"),
  openGraph: {
    title: "Savage Lifestyle Barber Shop",
    description: "Premium cuts, zero wait. Book online in seconds.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-void-black text-neon-silver antialiased">
        {children}
      </body>
    </html>
  );
}

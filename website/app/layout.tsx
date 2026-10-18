import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyActions from "@/components/StickyActions";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    default: "DS Gas Agency – LPG Cylinder Booking & Delivery",
    template: "%s | DS Gas Agency",
  },
  description:
    "DS Gas Agency, established in 2026 by Sagar Shinde, is your trusted local LPG delivery partner — domestic, commercial and industrial LPG cylinders with doorstep delivery, clear booking updates and safety-first service.",
  keywords: [
    "DS Gas Agency",
    "DS Shinde Gas",
    "LPG delivery",
    "LPG cylinder booking",
    "gas agency",
    "Sagar Shinde",
    "domestic LPG",
    "commercial LPG",
    "industrial LPG",
  ],
  openGraph: {
    title: "DS Gas Agency – LPG Cylinder Booking & Delivery",
    description:
      "Your trusted local LPG delivery partner. Established 2026. Book a cylinder and follow your booking to your doorstep.",
    type: "website",
    locale: "en_IN",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "DS Gas Agency",
  alternateName: "DS Shinde Gas Agency",
  description:
    "Local LPG gas agency established in 2026 by Sagar Shinde — domestic, commercial and industrial LPG cylinder delivery.",
  founder: { "@type": "Person", name: "Sagar Shinde" },
  foundingDate: "2026",
  telephone: ["+919511760208", "+919975300929"],
  email: "support@dsshindegas.com",
  address: {
    "@type": "PostalAddress",
    addressCountry: "IN",
    addressRegion: "Maharashtra",
  },
  openingHours: "Mo-Sa 08:00-20:00",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} font-sans bg-white text-gray-800 antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header />
        <main>{children}</main>
        <Footer />
        <StickyActions />
      </body>
    </html>
  );
}

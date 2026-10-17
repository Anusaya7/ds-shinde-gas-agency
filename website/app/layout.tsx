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
    default: "DS Shinde Gas Agency – Authorized Gaspoint LPG Dealer",
    template: "%s | DS Shinde Gas Agency",
  },
  description:
    "DS Shinde Gas Agency is an authorized Gaspoint LPG dealership — a brand of Gaspoint Petroleum India Limited, part of Confidence Group (NSE: CONFIPET). Established 1993, a 30-year legacy in India's LPG & CNG sector supplying BIS-standard domestic, commercial and industrial LPG cylinders, dealership opportunities and auto LPG.",
  keywords: [
    "Gaspoint",
    "DS Shinde Gas Agency",
    "LPG dealer",
    "LPG dealership",
    "Confidence Group",
    "CONFIPET",
    "LPG cylinders",
    "PESO godown",
  ],
  openGraph: {
    title: "DS Shinde Gas Agency – Authorized Gaspoint LPG Dealer",
    description:
      "India's leading private LPG company. A brand of Gaspoint Petroleum India Limited, part of Confidence Group. Dealership opportunities available.",
    type: "website",
    locale: "en_IN",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "DS Shinde Gas Agency",
  description:
    "Authorized Gaspoint LPG dealership — a brand of Gaspoint Petroleum India Limited, part of Confidence Group (NSE: CONFIPET).",
  telephone: ["+917030970436", "+917030514530", "+919112260266"],
  url: "https://www.gaspoint.in",
  brand: "Gaspoint",
  parentOrganization: {
    "@type": "Organization",
    name: "Gaspoint Petroleum India Limited",
    parentOrganization: { "@type": "Organization", name: "Confidence Group" },
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "IN",
  },
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

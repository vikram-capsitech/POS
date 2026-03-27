import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WebVitals } from "@/components/WebVitals";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://outletops.in";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "OutletOps — POS, Inventory & HR for Restaurants & Retail",
    template: "%s | OutletOps",
  },
  description:
    "OutletOps is a complete SaaS platform for restaurants and retail outlets. Manage POS billing, inventory, staff attendance, tasks/SOP, salary, and multi-outlet analytics — all in one app.",
  keywords: [
    "POS software India",
    "restaurant management system",
    "retail POS",
    "inventory management",
    "staff attendance software",
    "HR software restaurants",
    "kitchen display system",
    "SaaS POS India",
    "multi-outlet management",
    "restaurant billing software",
    "OutletOps",
  ],
  authors: [{ name: "OutletOps Team" }],
  creator: "OutletOps",
  publisher: "OutletOps",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "OutletOps",
    title: "OutletOps — POS, Inventory & HR for Restaurants & Retail",
    description:
      "Complete restaurant and retail management platform. POS billing, inventory, staff HR, tasks/SOP, payroll and analytics in one system.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OutletOps — Restaurant & Retail Management Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OutletOps — POS, Inventory & HR for Restaurants & Retail",
    description:
      "Complete restaurant and retail management. POS, HR, tasks, salary, analytics — one platform.",
    images: ["/og-image.png"],
    creator: "@outletops",
  },
  alternates: {
    canonical: BASE_URL,
  },
  category: "technology",
  applicationName: "OutletOps",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  verification: {
    // TODO: Add your Google Search Console token below after verifying ownership at https://search.google.com/search-console
    // google: "YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_TOKEN",
  },
};

export const viewport: Viewport = {
  themeColor: "#5838ff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Structured Data: Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "OutletOps",
              url: BASE_URL,
              logo: `${BASE_URL}/logo.png`,
              description:
                "OutletOps is a complete SaaS platform for restaurants and retail outlets.",
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                email: "support@outletops.in",
              },
              sameAs: [
                "https://twitter.com/outletops",
                "https://linkedin.com/company/outletops",
              ],
            }),
          }}
        />
        {/* Structured Data: SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "OutletOps",
              operatingSystem: "Web",
              applicationCategory: "BusinessApplication",
              offers: {
                "@type": "Offer",
                price: "1999",
                priceCurrency: "INR",
                priceValidUntil: "2027-12-31",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "120",
              },
              description:
                "POS, inventory management, staff HR, attendance tracking, tasks, SOP, and payroll all in one platform for restaurants and retail.",
              screenshot: `${BASE_URL}/screenshots/ss_dashboard.png`,
              featureList: [
                "Point of Sale (POS) billing",
                "Kitchen Display System",
                "Inventory management",
                "Staff attendance tracking",
                "Task and SOP management",
                "Salary and payroll processing",
                "Multi-outlet analytics",
                "Role-based access control",
              ],
            }),
          }}
        />
        {/* Structured Data: FAQPage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "Is OutletOps subscription-based?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes — choose Monthly or Yearly plans. Yearly plans are discounted by ~17%. You can also use Pay-as-you-go for flexible outlets.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Does it support restaurants (waiter + kitchen)?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. The Waiter View shows a live floor map, Table & Orders view, and allows waiters to take orders. The Kitchen Display shows live KOT tickets for kitchen staff.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I control staff access by role?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Absolutely. Every employee is assigned a role (Admin, Manager, Cashier, Waiter, Kitchen, Cleaner, etc.) and each role only has access to the modules it needs.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I manage multiple outlets from one account?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. OutletOps is built for multi-outlet businesses. You can manage employees, POS, tasks, and reports across all outlets from a single admin dashboard.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is my data secure?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "All data is stored in a secured MongoDB cloud database. Access is protected by JWT-based authentication. Role-based permissions ensure data isolation between team members.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What happens if I switch plans?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "You can upgrade or downgrade any time. Your data is fully preserved. Changes take effect from your next billing cycle.",
                  },
                },
              ],
            }),
          }}
        />
        {/* Structured Data: BreadcrumbList */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: BASE_URL,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Features",
                  item: `${BASE_URL}/#features`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: "Pricing",
                  item: `${BASE_URL}/#pricing`,
                },
                {
                  "@type": "ListItem",
                  position: 4,
                  name: "FAQ",
                  item: `${BASE_URL}/#faq`,
                },
              ],
            }),
          }}
        />
        {/* Structured Data: LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "@id": BASE_URL,
              name: "OutletOps",
              description:
                "SaaS POS and business management platform for restaurants and retail in India.",
              url: BASE_URL,
              email: "support@outletops.in",
              priceRange: "₹₹",
              currenciesAccepted: "INR",
              paymentAccepted: "Credit Card, Debit Card, UPI",
              areaServed: {
                "@type": "Country",
                name: "India",
              },
              serviceType:
                "POS Software, Restaurant Management System, Retail Management Software",
            }),
          }}
        />

      </head>
      <body className={inter.className}>
        <WebVitals />
        {children}
      </body>
    </html>
  );
}

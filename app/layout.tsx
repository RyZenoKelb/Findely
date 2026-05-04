import type { Metadata } from "next";
import { JetBrains_Mono, Poppins } from "next/font/google";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Findely — Find targeted leads in seconds",
    template: "%s · Findely",
  },
  description:
    "Findely is a premium lead intelligence platform. Search businesses, discover opportunities, and export clean lead lists ready for outreach.",
  applicationName: "Findely",
  keywords: [
    "lead generation",
    "B2B leads",
    "business directory",
    "SEO prospecting",
    "web agency leads",
    "outbound sales",
  ],
  authors: [{ name: "Findely" }],
  icons: {
    icon: "/brand/findely-app-icon.png",
    apple: "/brand/findely-app-icon.png",
  },
  openGraph: {
    title: "Findely — Find targeted leads in seconds",
    description:
      "Search businesses, discover opportunities, and export clean lead lists.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${jetbrains.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen text-foreground font-sans">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}

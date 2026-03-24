import type { Metadata } from "next";
import { DM_Sans, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./landing.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://callcontext.ai"),
  title: {
    default: "CallContext — AI Call Intelligence CRM for Small Businesses",
    template: "%s | CallContext",
  },
  description:
    "CallContext helps small businesses capture every customer call, auto-log call details, and improve follow-ups with AI-powered call intelligence.",
  keywords: [
    "call intelligence CRM",
    "small business call tracking",
    "AI call summary",
    "phone-first CRM",
    "call transcription for business",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CallContext — AI Call Intelligence CRM",
    description:
      "Capture call context, automate follow-ups, and improve customer conversion with CallContext.",
    type: "website",
    url: "/",
    siteName: "CallContext",
  },
  twitter: {
    card: "summary_large_image",
    title: "CallContext — AI Call Intelligence CRM",
    description:
      "Capture call context, automate follow-ups, and improve customer conversion with CallContext.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${outfit.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

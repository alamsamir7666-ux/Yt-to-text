import type { Metadata } from "next";
import { Inter, Syne, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "TranscriptAI — YouTube to Text",
  description: "Convert any YouTube video to accurate, searchable, exportable text instantly.",
  openGraph: {
    title: "TranscriptAI",
    description: "YouTube video to text converter",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${syne.variable} ${jetbrainsMono.variable} font-sans bg-bg-primary text-text-primary`}>
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "#13131A",
              border: "1px solid #2A2A3A",
              color: "#F0F0F0",
            },
          }}
        />
      </body>
    </html>
  );
}

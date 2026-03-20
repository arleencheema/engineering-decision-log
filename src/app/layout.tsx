import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { ClerkProvider, Show, UserButton, SignInButton } from "@clerk/nextjs";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Decision Log",
  description: "Engineering decisions, trade-offs, and outcomes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
        <body
          style={{ backgroundColor: "#F5F0E8", color: "#1A1A1A" }}
          className="font-sans antialiased"
        >
          <nav
            style={{
              borderBottom: "1px solid #D9D0C1",
              padding: "0.75rem 1.5rem",
              backgroundColor: "#F5F0E8",
            }}
          >
            <div
              style={{
                maxWidth: "80rem",
                margin: "0 auto",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#8C7B6B",
                }}
              >
                Engineering Decision Log
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <Show when="signed-out">
                  <SignInButton />
                </Show>
                <Show when="signed-in">
                  <UserButton />
                </Show>
              </div>
            </div>
          </nav>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
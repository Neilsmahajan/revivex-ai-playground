import type { Metadata } from "next";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { DM_Sans, DM_Mono, Instrument_Serif } from "next/font/google";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import Link from "next/link";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "AI Playground",
  description: "Test different system prompts, contexts, models and prompts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{ background: "var(--bg-deep)", color: "var(--text-primary)" }}
      >
        <ClerkProvider>
          <ConvexClientProvider>
            <header
              className="sticky top-0 z-50"
              style={{
                borderBottom: "1px solid var(--border-subtle)",
                background: "rgba(6, 6, 10, 0.85)",
                backdropFilter: "blur(16px) saturate(180%)",
              }}
            >
              <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-8">
                <div className="flex items-center gap-8">
                  <Link href="/" className="group flex items-center gap-2.5">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-md"
                      style={{
                        background: "var(--accent-muted)",
                        border: "1px solid var(--accent-border)",
                      }}
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        style={{ color: "var(--accent)" }}
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
                        />
                      </svg>
                    </div>
                    <span
                      className="text-sm font-semibold tracking-tight"
                      style={{ color: "var(--text-primary)" }}
                    >
                      AI Playground
                    </span>
                  </Link>
                  <Show when="signed-in">
                    <nav className="flex items-center gap-0.5">
                      <Link
                        href="/"
                        className="nav-link rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors"
                      >
                        Playground
                      </Link>
                      <Link
                        href="/history"
                        className="nav-link rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors"
                      >
                        History
                      </Link>
                    </nav>
                  </Show>
                </div>
                <div className="flex items-center gap-3">
                  <Show when="signed-out">
                    <SignInButton>
                      <button
                        className="rounded-md px-3.5 py-1.5 text-[13px] font-medium cursor-pointer transition-colors"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton>
                      <button
                        className="rounded-md px-3.5 py-1.5 text-[13px] font-medium cursor-pointer transition-all"
                        style={{
                          background: "var(--accent)",
                          color: "var(--bg-deep)",
                        }}
                      >
                        Sign Up
                      </button>
                    </SignUpButton>
                  </Show>
                  <Show when="signed-in">
                    <UserButton />
                  </Show>
                </div>
              </div>
            </header>
            <main className="flex-1 relative" style={{ zIndex: 1 }}>
              {children}
            </main>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

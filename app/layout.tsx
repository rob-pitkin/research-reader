import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Research Reader",
    description: "Your AI-powered research companion. Save, read, and understand research papers with ease.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className="h-full">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full flex flex-col`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <main className="flex-grow">
                        {children}
                        <Toaster />
                    </main>
                    <footer className="p-4 text-center text-xs text-muted-foreground">
                        Thank you to arXiv for use of its open access interoperability.
                    </footer>
                </ThemeProvider>
            </body>
        </html>
    );
}

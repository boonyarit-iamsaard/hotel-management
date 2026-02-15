import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import Providers from "@/components/providers";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import "@/index.css";

interface RootLayoutProps {
  children: ReactNode;
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "hotel-management",
  description: "hotel-management",
};

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 space-y-4">
              <div className="flex h-14 items-center border-border border-b px-2">
                <SidebarTrigger />
              </div>
              {children}
            </main>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}

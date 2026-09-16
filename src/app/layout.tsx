import type { Metadata, Viewport } from "next";
import { Geist, Press_Start_2P } from "next/font/google";

import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getGames, getSystems } from "@/lib/data";
import { StoreProvider } from "@/lib/store/StoreProvider";
import { cn } from "@/lib/utils";

import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const pixel = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: { default: "InsertCoin", template: "%s · InsertCoin" },
  description:
    "Play arcade, console and handheld classics in the browser with EmulatorJS.",
};

export const viewport: Viewport = {
  themeColor: "#140f2a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("dark font-sans", geist.variable, pixel.variable)}
    >
      <body className="min-h-dvh antialiased">
        <StoreProvider systems={getSystems()} games={getGames()}>
          <TooltipProvider>
            <SiteHeader />
            <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
            <footer className="mx-auto max-w-7xl px-4 pb-10 text-xs text-muted-foreground">
              InsertCoin ships no ROMs or BIOS files. Only play games you own.
            </footer>
            <Toaster theme="dark" position="bottom-right" />
          </TooltipProvider>
        </StoreProvider>
      </body>
    </html>
  );
}

"use client";
import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {Providers} from "./providers";
import "@rainbow-me/rainbowkit/styles.css";
import {ConnectButton} from "@rainbow-me/rainbowkit";
const inter = Inter({subsets: ["latin"]});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {" "}
          <div className="navbar bg-base-100">
            <div className="flex-1">
              <a className="btn btn-ghost text-xl">AuctioneerX</a>
            </div>
            <div className="flex-none">
              <ConnectButton />
            </div>
          </div>
          {children}
        </Providers>
      </body>
    </html>
  );
}

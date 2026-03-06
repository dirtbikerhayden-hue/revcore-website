import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import ConditionalFooter from "@/components/ConditionalFooter";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";

export const metadata: Metadata = {
  title: "Floka — Digital Agency",
  description: "Digital designs that help brands move faster and convert better.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SmoothScroll>
          <CustomCursor />
          <Header />
          <main>{children}</main>
          <ConditionalFooter />
        </SmoothScroll>
      </body>
    </html>
  );
}

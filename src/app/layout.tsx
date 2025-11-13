import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "@/theme/ThemeRegistry";
import NextAuthProvider from "@/components/NextAuthProvider";
import Sidebar from "@/components/sidebar/sidebar";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chatbot Admin",
  description: "Admin panel for chatbots",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
        <ThemeRegistry>
          <Sidebar/>
          {children}
        </ThemeRegistry>
        </NextAuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { QueryClientProvider } from "@/components/provider/QueryClientProvider";
import AuthSessionProvider from "@/components/provider/AuthSessionProvider";
import NextTopLoader from "nextjs-toploader";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WOOD TALKS || Admin Dashboard",
  description: "Admin dashboard for WOOD TALKS website",
  icons:{
    icon: "/fav.png",}
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${figtree.variable} font-sans`}>
        <NextTopLoader color="#007066" height={3} showSpinner={false} />

        <QueryClientProvider>
          <Toaster richColors position="top-right" />
          <AuthSessionProvider>{children}</AuthSessionProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}

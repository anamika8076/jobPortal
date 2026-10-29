import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { SiteChrome } from "@/components/SiteChrome";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Hirely - Jobs and Hiring",
  description: "Search open jobs, apply with your resume and track your applications. Companies can post roles and review candidates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SiteChrome>{children}</SiteChrome>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                className: "text-sm font-medium",
                style: {
                  background: "hsl(var(--card))",
                  color: "hsl(var(--foreground))",
                  border: "1px solid hsl(var(--border))",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

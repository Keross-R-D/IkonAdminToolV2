import "@/ikon/styles/globals.css";
import type { Metadata } from "next";
import { Toaster } from "@/shadcn/ui/sonner";
import MainLayout from "@/ikon/components/main-layout";
import { DialogProvider } from "@/ikon/components/alert-dialog/dialog-context";
import { ThemeProvider } from "@/ikon/components/theme-provider";
import { NavbarProvider } from "@/context/NavbarContext";

export const metadata: Metadata = {
  title: "IKON - Keross",
  description: "IKON - Keross",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <DialogProvider>
              <MainLayout>
                <NavbarProvider>{children}</NavbarProvider>
              </MainLayout>
            </DialogProvider>
            <Toaster richColors closeButton visibleToasts={5} />
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}

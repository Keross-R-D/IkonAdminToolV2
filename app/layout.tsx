import type { Metadata } from "next";
//import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavbarProvider } from "@/context/NavbarContext";
import Navbar from "@/components/ui/navbar";
import { ThemeProvider } from "@/components/providers/themeProvider";
import { Toaster } from "@/components/ui/sonner";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`antialiased`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="h-full w-full ">
              <NavbarProvider>
                <Navbar />
                <div className="">{children}</div>
                
              </NavbarProvider>
              
            </div>
            <Toaster/>
          </ThemeProvider>
        
        
       
      </body>
    </html>
  );
}

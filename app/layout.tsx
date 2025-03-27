import type { Metadata } from "next";
//import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavbarProvider } from "@/context/NavbarContext";
import Navbar from "@/components/ui/navbar";
import { ThemeProvider } from "@/components/providers/themeProvider";
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "./components/homeSidebar";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`antialiased h-full`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="h-screen flex flex-col">
              <NavbarProvider>
                <Navbar />
                <div className="flex-grow w-full overflow-auto dark:bg-muted/50">
                  {/* ✅ New Div - Takes full height of the available space */}
                  <div className="h-full flex flex-row">
                    <Sidebar />
                    {/* Put your content inside here */}
                    <div className="flex-grow sbg-gray-100">
                    {children}
                    </div>
                  </div>
                </div>
                
              </NavbarProvider>
              
            </div>
            <Toaster/>
          </ThemeProvider>
        
        
       
      </body>
    </html>
  );
}

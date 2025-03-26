"use client"; // Required for state updates in Next.js

import { createContext, useContext, useState, ReactNode } from "react";

// Define the structure for links
interface LinkType {
  //map(arg0: (app: { name: string; href: string; }) => import("react").JSX.Element): ReactNode;
  id: string;
  name: string;
}

// Define the context type
interface NavbarContextType {
  // links: LinkType[];
  // setLinks: (newLinks: LinkType[]) => void;
  selectedApp: LinkType[];
  setSelectedApp: (app: LinkType[]) => void;
}

// Create context
const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

// Custom hook to use the context
export const useNavbar = () => {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error("useNavbar must be used within a NavbarProvider");
  }
  return context;
};



// Provider Component
export function NavbarProvider({ children }: { children: ReactNode }) {
  const [selectedApp, setSelectedApp] = useState<LinkType[]>([]);

  return (
    <NavbarContext.Provider value={{ selectedApp, setSelectedApp }}>
      {children}
    </NavbarContext.Provider>
  );
}



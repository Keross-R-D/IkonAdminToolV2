"use client";

import { useState } from "react";
import { useNavbar } from "@/context/NavbarContext";
import { useRouter } from "next/navigation"; // Import useRouter
import { Menu, X, ChevronRight } from "lucide-react"; // Icons for mobile menu
import { ThemeSelector } from "@/components/generic/themeSelector";

export default function Navbar() {
  const { selectedApp,setSelectedApp } = useNavbar(); // selectedApp is now an array
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter(); // Initialize Next.js router

  // Function to determine the correct link based on app type
  const getAppLink = (app: { id: string; name: string }) => {
    if (app.name === "Modal") {
      return `/workflow/${encodeURIComponent(app.id)}`;
    }
    if (app.name === "Script") {
      return `/workflow/${encodeURIComponent(app.id)}/scripts/${encodeURIComponent(app.id)}`;
    }
    return "/"; // Default fallback link
  };

  // Function to handle navigation
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, link: string) => {
    e.preventDefault();
    router.replace(link);
  };

  return (
    <nav className="w-full p-3 px-4 shadow-md flex justify-between items-center" id="mainNavbar">
      <div className="flex">
        {/* Brand Name / Logo */}
        <h5 className="font-bold">
          <a href="/">Application Management</a>
        </h5>

        {/* Desktop Menu: Show all selected apps */}
        <div className="hidden md:flex gap-2 items-center">
          {selectedApp?.length > 0 &&
            selectedApp.map((app) => {
              const link = getAppLink(app);
              return (
                <div key={app.id} className="flex items-center">
                  <ChevronRight size={20} />
                  <h5 className="font-bold">
                    <a href={link} onClick={(e) => handleNavClick(e, link)}>
                      {app.name}
                    </a>
                  </h5>
                </div>
              );
            })}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div>
        <ThemeSelector />
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && selectedApp?.length > 0 && (
        <div className="md:hidden mt-2 p-4 rounded-lg">
          {selectedApp.map((app) => {
            const link = getAppLink(app);
            return (
              <h5 key={app.id} className="font-bold">
                <a href={link} onClick={(e) => handleNavClick(e, link)}>
                  {app.name}
                </a>
              </h5>
            );
          })}
        </div>
      )}
    </nav>
  );
}

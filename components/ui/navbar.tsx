"use client";

import { useState } from "react";
import { useNavbar } from "@/context/NavbarContext";
import { useRouter } from "next/navigation"; // Import useRouter
import { Menu, X, ChevronRight } from "lucide-react"; // Icons for mobile menu
import { ThemeSelector } from "@/components/generic/themeSelector";

export default function Navbar() {
  const { selectedApp } = useNavbar(); // Get links from context
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter(); // Initialize Next.js router
  

  // Set the link dynamically based on selectedApp
  let link = "";
  if (selectedApp) {
    link = `/workflow/${encodeURIComponent(selectedApp.id)}`;
  }

  // Function to handle click and force reload
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault(); // Prevent default link behavior
    router.replace(link); // Replace the URL (this will reload the page)
  };

  return (
    <nav className="w-full p-3 px-4 shadow-md flex justify-between items-center" id="mainNavbar">
      <div className="flex">
        {/* Brand Name / Logo */}
        <h5 className="font-bold">
          <a href="/">Application Management</a>
        </h5>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-2">
          {/* Show Selected App in Navbar if Available */}
          {selectedApp && (
            <div className="hidden md:flex items-center">
              <ChevronRight size={20} />
              <h5 className="font-bold">
                {/* Call handleNavClick on click */}
                <a href={link} onClick={handleNavClick}>
                  {selectedApp.name}
                </a>
              </h5>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      <div>
        <ThemeSelector/>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && selectedApp && (
        <div className="md:hidden mt-2 p-4 rounded-lg">
          <h5 className="font-bold">
            <a href={link} onClick={handleNavClick}>{selectedApp.name}</a>
          </h5>
        </div>
      )}
    </nav>
  );
}

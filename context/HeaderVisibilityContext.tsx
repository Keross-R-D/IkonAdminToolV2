import { createContext, useContext, useState, ReactNode } from "react";

// Define the context type
interface HeaderVisibilityContextType {
    showHeader: boolean;
    show: () => void;
    hide: () => void;
    toggle: () => void;
}

// Create Context
const HeaderVisibilityContext = createContext<HeaderVisibilityContextType | undefined>(undefined);

// Provider Component
export const HeaderVisibilityProvider = ({ children }: { children: ReactNode }) => {
    const [showHeader, setShowHeader] = useState(false);

    const show = () => setShowHeader(true);
    const hide = () => setShowHeader(false);
    const toggle = () => setShowHeader(prev => !prev);

    return (
        <HeaderVisibilityContext.Provider value={{ showHeader, show, hide, toggle }}>
            {children}
        </HeaderVisibilityContext.Provider>
    );
};

// Custom Hook for easier use
export const useHeaderVisibility = () => {
    const context = useContext(HeaderVisibilityContext);
    if (!context) {
        throw new Error("useHeaderVisibility must be used within a HeaderVisibilityProvider");
    }
    return context;
};

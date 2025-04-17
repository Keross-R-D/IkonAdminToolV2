"use client";
import { createContext, useContext, useState, ReactNode } from "react";

// Define the type for a breadcrumb item
export interface AppCanvasItemProps {
  id: any;
  label: ReactNode;
}

// Define the type for the context state
interface AppCanvasContextType {
  edgesAppCanvas: AppCanvasItemProps[];
  setEdgesAppCanvas: (items: AppCanvasItemProps[]) => void;
  nodesAppCanvas: AppCanvasItemProps[];
  setNodesAppCanvas: (items: AppCanvasItemProps[]) => void;
}

// Create the context with a default value
const AppCanvasContext = createContext<AppCanvasContextType | undefined>(
  undefined
);

// Create a provider component
export function AppCanvasProvider({ children }: { children: ReactNode }) {
  const [edgesAppCanvas, setEdges] = useState<AppCanvasItemProps[]>([]);
  const [nodesAppCanvas, setNodes] = useState<AppCanvasItemProps[]>([]);

  const setEdgesAppCanvas = (items: AppCanvasItemProps[]) => {
    setEdges((prevItems) => {
      return [...items];
    });
  };
  const setNodesAppCanvas = (items: AppCanvasItemProps[]) => {
    setNodes((prevItems) => {
      return [...items];
    });
  };

  // Function to add a breadcrumb item

  return (
    <AppCanvasContext.Provider
      value={{
        edgesAppCanvas,
        setEdgesAppCanvas,
        nodesAppCanvas,
        setNodesAppCanvas,
      }}
    >
      {children}
    </AppCanvasContext.Provider>
  );
}

// Custom hook to use the AppCanvasContext
export function useAppCanvas() {
  const context = useContext(AppCanvasContext);
  if (!context) {
    throw new Error("useAppCanvas must be used within a AppCanvasProvider");
  }
  return context;
}

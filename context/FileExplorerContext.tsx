"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// Folder/File Type Definition
interface FileNode {
  id: string;
  name: string;
  type: "folder" | "file";
  children?: FileNode[];
}

// Create Context with Updatable State
const FileExplorerContext = createContext<{
  files: FileNode;
  setFiles: (data: FileNode) => void;
}>({
  files: { id: "root", name: "project-root", type: "folder", children: [] },
  setFiles: () => {}
});

export function FileExplorerProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<FileNode>({
    id: "root",
    name: "project-root",
    type: "folder",
    children: []
  });

  return (
    <FileExplorerContext.Provider value={{ files, setFiles }}>
      {children}
    </FileExplorerContext.Provider>
  );
}

export function useFileExplorer() {
  return useContext(FileExplorerContext);
}

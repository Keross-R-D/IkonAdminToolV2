import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import JSZip from "jszip";

interface FolderNode {
    id: string;
    name: string;
    type: "folder" | "file";
    children?: FolderNode[];
    content?: string; // File content (for files only)
  }

interface RestoreFolderDialogProps {
  onRestoreFolder: (folderStructure: FolderNode) => void;
  onClose: () => void;
}

export default function RestoreFolderDialog({ onRestoreFolder, onClose }: RestoreFolderDialogProps) {
  const [folderStructure, setFolderStructure] = useState<FolderNode | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(true);

    // const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    //     if (!event.target.files) return;

    //     const files = Array.from(event.target.files);
    //     const rootFolderName = files[0]?.webkitRelativePath.split("/")[0]; // Get top-level folder name

    //     if (!rootFolderName) return;

    //     const rootFolder: FolderNode = {
    //     id: crypto.randomUUID(),
    //     name: rootFolderName,
    //     type: "folder",
    //     children: [],
    //     };

    //     const fileMap = new Map<string, FolderNode>(); // Stores folder paths
    //     fileMap.set(rootFolderName, rootFolder);

    //     // Read files and build the structure
    //     const readFileContent = (file: File): Promise<string> => {
    //     return new Promise((resolve) => {
    //         const reader = new FileReader();
    //         reader.onload = (e) => resolve(e.target?.result as string);
    //         reader.readAsText(file); // Read file as text (modify if needed)
    //     });
    //     };

    //     for (const file of files) {
    //     const parts = file.webkitRelativePath.split("/");
    //     let parent = rootFolder;

    //     for (let i = 1; i < parts.length; i++) {
    //         const partName = parts[i];
    //         const fullPath = parts.slice(0, i + 1).join("/");

    //         if (i === parts.length - 1) {
    //         // It's a file, read its content
    //         const content = await readFileContent(file);
    //         parent.children?.push({
    //             id: crypto.randomUUID(),
    //             name: partName,
    //             type: "file",
    //             content: content, // Store file content
    //         });
    //         } else {
    //         // It's a folder, check if it exists
    //         if (!fileMap.has(fullPath)) {
    //             const newFolder: FolderNode = {
    //             id: crypto.randomUUID(),
    //             name: partName,
    //             type: "folder",
    //             children: [],
    //             };
    //             fileMap.set(fullPath, newFolder);
    //             parent.children?.push(newFolder);
    //         }
    //         parent = fileMap.get(fullPath)!;
    //         }
    //     }
    //     }


    //     setFolderStructure(rootFolder);

    //     setFolderStructure(rootFolder);
    // };
    

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    debugger;
    if (!event.target.files) return;

    const files = Array.from(event.target.files);
    const firstFile = files[0];

    if (!firstFile) return;

    let rootFolder: FolderNode;

    if (firstFile.type === "application/zip" || firstFile.name.endsWith(".zip")) {
      // 🗜 If it's a ZIP file, extract it
      rootFolder = await extractZipFile(firstFile);
    } else {
      // 📂 If it's a folder, process as usual
      const processedFolder = await processFolderUpload(files);
      if (!processedFolder) return; // Handle null case
      rootFolder = processedFolder;
    }
debugger
    setFolderStructure(rootFolder.children ? rootFolder.children[0] : null); // Set folder structure
  };

  const processFolderUpload = async (files: File[]) => {
    debugger
    const rootFolderName = files[0]?.webkitRelativePath.split("/")[0]; // Get top-level folder name
    if (!rootFolderName) return null;
  
    const rootFolder: FolderNode = {
      id: crypto.randomUUID(),
      name: rootFolderName,
      type: "folder",
      children: [],
    };
  
    const fileMap = new Map<string, FolderNode>(); // Stores folder paths
    fileMap.set(rootFolderName, rootFolder);
  
    const readFileContent = (file: File): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsText(file); // Read file as text
      });
    };
  
    for (const file of files) {
      const parts = file.webkitRelativePath.split("/");
      let parent = rootFolder;
  
      for (let i = 1; i < parts.length; i++) {
        const partName = parts[i];
        const fullPath = parts.slice(0, i + 1).join("/");
  
        if (i === parts.length - 1) {
          // It's a file, read its content
          const content = await readFileContent(file);
          parent.children?.push({
            id: crypto.randomUUID(),
            name: partName,
            type: "file",
            content: content, // Store file content
          });
        } else {
          // It's a folder, check if it exists
          if (!fileMap.has(fullPath)) {
            const newFolder: FolderNode = {
              id: crypto.randomUUID(),
              name: partName,
              type: "folder",
              children: [],
            };
            fileMap.set(fullPath, newFolder);
            parent.children?.push(newFolder);
          }
          parent = fileMap.get(fullPath)!;
        }
      }
    }
  
    return rootFolder;
  };

  const extractZipFile = async (zipFile: File): Promise<FolderNode> => {
    debugger
    const zip = await JSZip.loadAsync(zipFile);
  
    const rootFolder: FolderNode = {
      id: crypto.randomUUID(),
      name: zipFile.name.replace(".zip", ""),
      type: "folder",
      children: [],
    };
  
    const fileMap = new Map<string, FolderNode>();
    fileMap.set("", rootFolder); // root path is empty string
  
    for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
      const parts = relativePath.split("/").filter(Boolean);
      let currentPath = "";
      let parent = rootFolder;
  
      for (let i = 0; i < parts.length; i++) {
        const partName = parts[i];
        currentPath = currentPath ? `${currentPath}/${partName}` : partName;
  
        const isLast = i === parts.length - 1;
        const isDir = zipEntry.dir && isLast;
  
        if (isLast && !zipEntry.dir) {
          // It's a file
          const content = await zipEntry.async("text");
          parent.children?.push({
            id: crypto.randomUUID(),
            name: partName,
            type: "file",
            content,
          });
        } else {
          // It's a folder
          if (!fileMap.has(currentPath)) {
            const newFolder: FolderNode = {
              id: crypto.randomUUID(),
              name: partName,
              type: "folder",
              children: [],
            };
            fileMap.set(currentPath, newFolder);
            parent.children?.push(newFolder);
          }
          parent = fileMap.get(currentPath)!;
        }
      }
    }
  
    return rootFolder;
  };
  
  
  


  const handleRestore = () => {
    if (folderStructure) {
        setShowRestoreDialog(false)
        onRestoreFolder(folderStructure);
        window.location.reload();
    }
  };

  return (
    <Dialog open={showRestoreDialog} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restore a Folder</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Folder Upload Input */}
          <Input
            type="file"
            onChange={handleFileChange}
            accept=".zip, *"    // ✅ Allows ZIP files along with everything else
            multiple
            
          />

          {/* Restore Button */}
          <div className="flex justify-end">
            <Button onClick={handleRestore} disabled={!folderStructure}>
              Restore
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

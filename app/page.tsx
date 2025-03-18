"use client";
import { useState, useEffect } from "react";
import path from "path";
import { Plus } from "lucide-react";
import FileExplorer from "@/components/ui/FileExplorer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select";

interface FolderNode {
  id: string;
  name: string;
  type: "folder" | "file";
  children: FolderNode[];
}

export default function Home() {
  const [folderStructure, setFolderStructure] = useState<FolderNode[] | null>(null);
  const [showFolderCreationForm, setShowFolderCreationForm] = useState(false);

  useEffect(() => {
    fetch("/folderStructure.json")
      .then((res) => res.json())
      .then((data) =>  setFolderStructure(filterFolders(data)))
      .catch((err) => console.error("Error fetching folder structure:", err));
  }, []);
  

  const filterFolders = (nodes: FolderNode[]): FolderNode[] => {
     
    return nodes
      .filter((node) => node.type === "folder" && node.name !== "instances" && node.name !== "scripts")
      .flatMap((folder) => {
        if (folder.name === "children" ) {
          return filterFolders(folder.children);
        }
        return [{ ...folder, children: filterFolders(folder.children) }];
      });
  };


  const handleCreateFolder = async (parentId: string, name: string) => {
    if (!folderStructure) return;
  
    // Find the parent node
    const findParent = (nodes: FolderNode[]): FolderNode | null => {
      for (const node of nodes) {
        if (node.id === parentId) return node;
        const found = findParent(node.children);
        if (found) return found;
      }
      return null;
    };
  
    const parentNode = parentId === "src"
      ? folderStructure.find(node => node.name === "src")
      : findParent(folderStructure);
  
    if (!parentNode) {
      alert("⚠️ Parent folder not found!");
      return;
    }
  
    // ✅ Define the new folder object
    const newFolder: FolderNode = {
      id: Date.now().toString(),
      name,
      type: "folder",
      children: [],
    };
  
    let newFolderStructure: FolderNode[] = [...folderStructure];
  
    if (parentNode.name === "src") {
      // ✅ Add directly to "src"
      parentNode.children.push(newFolder);
    } else {
      // ✅ Check if "children" folder exists
      const hasChildrenFolder = parentNode.children ? 1: 0;
  
      if (!hasChildrenFolder) {
        alert(`⚠️ "children" folder is missing inside ${parentNode.name}`);
        return;
      }
  
      // ✅ Add new folder inside "children"
      parentNode.children.push(newFolder)
        // .find(child => child.name === "children")!
        // .children;
    }
  
    // ✅ Send request to backend
    const response = await fetch("/api/create-folder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentId, folderName: name }),
    });
  
    if (response.ok) {
      setFolderStructure(newFolderStructure);
      window.location.reload();
    } else {
      console.error("Failed to create folder");
    }
  
    setShowFolderCreationForm(false);
  };
 
  

  return (
    <div style={{ padding: "20px" }}>
      <div className="flex items-center justify-between">
        <h1>📂 Process</h1>
        <Button variant="outline" size="sm" onClick={() => setShowFolderCreationForm(true)}>
          <Plus />
        </Button>
      </div>
      {folderStructure ? (
        <div className="p-2 border rounded-sm mt-1.5">
          {folderStructure.map((node) => (
            <FileExplorer key={node.id} node={node} />
          ))}
        </div>
      ) : (
        <p>Loading...</p>
      )}

      {showFolderCreationForm && folderStructure && (
        <FolderCreationForm 
          folders={folderStructure} 
          onCreateFolder={handleCreateFolder} 
          onClose={() => setShowFolderCreationForm(false)} 
        />
      )}
    </div>
  );
}

function FolderCreationForm({ folders, onCreateFolder, onClose }: { 
  folders: FolderNode[]; 
  onCreateFolder: (parentId: string, name: string) => void; 
  onClose: () => void; 
}) {
  const [folderName, setFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("-1"); // Default to "-1" (no parent)

  const handleSubmit = () => {
    if (!folderName) return;
    onCreateFolder(selectedFolder, folderName);
    onClose(); // Close dialog after saving
    
  };

  // Recursively flatten folder structure for dropdown
  const flattenFolders = (nodes: FolderNode[], parentPath = ""): { id: string; name: string }[] => {
    return nodes.flatMap((folder) => {
      const fullPath = parentPath ? `${parentPath} / ${folder.name}` : folder.name;
      return [{ id: folder.id, name: folder.name}, ...flattenFolders(folder.children, fullPath)];
    });
  };

  const folderOptions = flattenFolders(folders);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a Process</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input 
            placeholder="Process Name" 
            value={folderName} 
            onChange={(e) => setFolderName(e.target.value)} 
          />
          <Select value={selectedFolder} onValueChange={setSelectedFolder}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Parent Folder" />
            </SelectTrigger>
            <SelectContent>
            {/* <SelectItem value="">No Parent Selected</SelectItem>  */}
              {folderOptions.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  {folder.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-end">
            <Button onClick={handleSubmit}>Save</Button>
          </div>  
        </div>
      </DialogContent>
    </Dialog>
  );
}



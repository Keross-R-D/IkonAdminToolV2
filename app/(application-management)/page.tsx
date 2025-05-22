"use client";
import { useState, useEffect } from "react";
import { Plus, Upload } from "lucide-react";
import FileExplorer from "@/components/ui/FileExplorer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select";
import RestoreFolderDialog from "../components/restoreFolder";
import { Tooltip } from "@/ikon/components/tooltip"
import { LoadingSpinner } from "@/ikon/components/loading-spinner";
import { toast } from "sonner";

import { v4 as uuidv4 } from 'uuid';
import { set } from "zod";

interface FolderNode {
  id: string;
  name: string;
  type: "folder" | "file";
  children: FolderNode[];
  parentId?: string; // Add parentId property
}

const filterFolders = (nodes: FolderNode[]): FolderNode[] => {

  return nodes
    .filter((node) => node.type === "folder" && node.name !== "instances" && node.name !== "scripts")
    .flatMap((folder) => {
      if (folder.name === "children") {
        return filterFolders(folder.children);
      }
      return [{ ...folder, children: filterFolders(folder.children) }];
    });
};

export default function Home() {
  const [folderStructure, setFolderStructure] = useState<FolderNode[] | null>(null);
  const [uploadedFolders, setUploadedFolders] = useState<FolderNode[]>([]); // Store uploaded folders
  const [showFolderCreationForm, setShowFolderCreationForm] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [editingFolder, setEditingFolder] = useState<FolderNode | null>(null);
  const [showSpinner, setShowSpinner] = useState(true);
  // Replace 'any' with your actual project data type

  useEffect(() => {
    fetch("/folderStructure.json")
      .then((res) => res.json())
      .then((data) => { setShowSpinner(false); setFolderStructure(filterFolders(data)) })
      .catch((err) => console.error("Error fetching folder structure:", err));

  }, []);







  const handleFolderOperation = async (parentId: string | null, folderId: string | null, name: string) => {
    if (!folderStructure) return;
    setShowSpinner(true);
    let newFolderStructure: FolderNode[] = [...folderStructure];

    if (folderId) {
      // Edit Folder
      const updateFolderName = (nodes: FolderNode[]): boolean => {
        for (const node of nodes) {
          if (node.id === folderId) {
            node.name = name;
            return true;
          }
          if (updateFolderName(node.children)) return true;
        }
        return false;
      };

      if (!updateFolderName(newFolderStructure)) {
        alert("⚠️ Folder not found!");
        return;
      }

      // ✅ Send request to backend (proper handling)
      try {

        const response = await fetch("/api/edit-folder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            folderId,
            newFolderName: name,
            newParentId: parentId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to edit folder");
        }
        else {
          setShowSpinner(false);

          toast.success(`Process Edited: ${name}`);
          const data = await response.json();
          if (data) {
            newFolderStructure = filterFolders(data?.fs); // Update the folder structure in the parent component
          }
          // Handle successful response if needed
        }

      } catch (err) {
        console.error("❌ Edit folder error:", err);
        alert("Failed to update folder. Please try again.");
        return;
      }
    } else if (parentId) {
      // Create Folder
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

      const newFolder: FolderNode = {
        id: uuidv4(),
        name,
        type: "folder",
        children: [],
      };

      //parentNode.children.push(newFolder);
      // ✅ Send request to backend
      const response = await fetch("/api/create-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId, folderName: name, folderId: newFolder.id }),
      });
      if (!response.ok) {
        var errorData = await response.json();
        toast.error(errorData.error || "Failed to create folder");
        console.error("Failed to create folder");
        setShowSpinner(false);
        return;
      }
      else {
        setShowSpinner(false);
        toast.success(`Process Added: ${name}`);
        const data = await response.json();
        if (data) {
          newFolderStructure = filterFolders(data?.fs); // Update the folder structure in the parent component
        }
        // Handle successful response if needed
      }
    }

    setFolderStructure(newFolderStructure);
    //window.location.reload();
  };


  const handleEditFolder = (folder: FolderNode) => {
    // Function to find the parent folder
    const findParentFolder = (nodes: FolderNode[], childId: string, parent: FolderNode | null = null): FolderNode | null => {
      for (const node of nodes) {
        if (node.id === childId) return parent; // Return parent if found
        const found = findParentFolder(node.children, childId, node);
        if (found) return found;
      }
      return null;
    };

    const parentFolder = folderStructure ? findParentFolder(folderStructure, folder.id) : null;

    console.log("Editing Folder:", folder);
    console.log("Parent Folder:", parentFolder);

    folder.parentId = parentFolder?.id;


    setEditingFolder(folder);
    setShowFolderCreationForm(true);
  };





  return (
    <div className="p-4 h-full">

      <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 h-full">
        <LoadingSpinner visible={showSpinner} />
        {/* Header Section */}
        <div className="flex items-center justify-between p-3">
        
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            Process
          </h1>
          <div className="flex gap-2">
            <Tooltip tooltipContent="Restore Process" side={"top"} >
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setShowRestoreDialog(true)}
              >
                <Upload className="h-4 w-4" />
              </Button>

            </Tooltip>

            <Tooltip tooltipContent="Create Process" side={"top"}>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setShowFolderCreationForm(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>

            </Tooltip>
          </div>
        </div>

        {/* Folder List */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          {folderStructure ? (
            <div className="p-3 ">
              {folderStructure.map((node) => (
                <FileExplorer key={node.id} node={node} openEditFolderModal={handleEditFolder} setFolderStructure={setFolderStructure}
                  setIsLoading={setShowSpinner} // Pass the setShowSpinner function to the child component
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-sm text-center">Loading...</p>
          )}
        </div>

        {/* Restore Folder Dialog */}
        {showRestoreDialog && (
          <RestoreFolderDialog
            onRestoreFolder={handleRestoreFolder}
            onClose={() => setShowRestoreDialog(false)}
            setFS={setFolderStructure}
            setShowSpinner={setShowSpinner} // Pass the setShowSpinner function to the child component
            showRestoreDialog={showRestoreDialog}
            setShowRestoreDialog={setShowRestoreDialog}
          />
        )}

        {/* Folder Creation Form */}
        {showFolderCreationForm && folderStructure && (
          <FolderCreationForm

            folders={folderStructure}
            onCreateFolder={handleFolderOperation}
            onClose={() => {
              setShowFolderCreationForm(false);
              setEditingFolder(null);
            }}
            editingFolder={editingFolder ? { id: editingFolder.id, name: editingFolder.name, parentId: editingFolder.parentId || "" } : undefined}

          />
        )}
      </div>
    </div>

  );
}

function FolderCreationForm({ folders, onCreateFolder, onClose, editingFolder }: {
  folders: FolderNode[];
  onCreateFolder: (parentId: string, folderId: string, name: string) => void;
  onClose: () => void;
  editingFolder?: { id: string; name: string; parentId: string };
}) {
  const [folderName, setFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState(""); // Default to "-1" (no parent)

  useEffect(() => {
    if (editingFolder) {
      setFolderName(editingFolder.name);
      setSelectedFolder(editingFolder.parentId);
    }
  }, [editingFolder]);

  const handleSubmit = () => {
    if (!folderName) return;
    onCreateFolder(selectedFolder, editingFolder?.id || "", folderName);
    onClose(); // Close dialog after saving

  };

  // Recursively flatten folder structure for dropdown
  const flattenFolders = (nodes: FolderNode[], parentPath = ""): { id: string; name: string }[] => {
    return nodes.flatMap((folder) => {
      const fullPath = parentPath ? `${parentPath} / ${folder.name}` : folder.name;
      return [{ id: folder.id, name: folder.name }, ...flattenFolders(folder.children, fullPath)];
    });
  };

  const folderOptions = flattenFolders(folders);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingFolder ? "Edit" : "Create"}  Process</DialogTitle>
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
            <Button onClick={handleSubmit}>{editingFolder ? "Save Changes" : "Create"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


const handleRestoreFolder = (folderStructure: FolderNode, setFolderStructure: any, setShowSpinner: any) => {

  setShowSpinner(true);
  fetch("/api/restore-folder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folderStructure }),
  })
    .then(async (response) => {
      if (response.ok) {

        setShowSpinner(false);
        const data = await response.json();

        toast.success("Folder restored successfully!");
        if (data) {
          setFolderStructure(filterFolders(data?.fs));// Update the folder structure in the parent component
        }
        console.log("Folder restored successfully!");
      } else {
        return undefined;
        console.error("Failed to restore folder");
      }
    })
    .catch((error) => console.error("Error restoring folder:", error));
};



"use client";

import { useState } from "react";
import { Folder, FileText, Play, LayoutList, Waypoints, Edit, ChevronRight, ChevronDown, FolderOpen, Download, Trash2Icon,  } from "lucide-react";
import { Button } from "./button";
import { useRouter } from "next/navigation"; // Next.js router
import { Tooltip } from "@/ikon/components/tooltip"
import { LoadingSpinner } from "@/ikon/components/loading-spinner";
import { set } from "zod";
import { toast } from "sonner";


interface FileNode {
  id: string;
  name: string;
  type: "folder" | "file";
  children?: FileNode[];
}

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

export default function FileExplorer({ node,openEditFolderModal, setFolderStructure, setIsLoading }: { node: FileNode , openEditFolderModal: any, setFolderStructure: any, setIsLoading: any}) {
  const [openFolders, setOpenFolders] = useState<{ [key: string]: boolean }>({});
  //const [isLoading, setIsLoading] = useState(false); // Loading state for spinner
  const router = useRouter();
  // const { selectedApp,setSelectedApp } = useNavbar();

  const toggleFolder = (id: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle open state for clicked folder
    }));
  };

  function startProcess(id: string) {
    console.log("Start Process: ", id); 
  }

  function openModal(id: string) {// Navigate to Modal Page
    debugger
  setIsLoading(true);
  debugger
    console.log("Start Process: ", id); 
    router.push(`/workflow/${encodeURIComponent(id)}`);
  }

  function openTasks(id: string) {
    console.log("Open Tasks: ", id);
  }
  const handleDownloadFolder = async (node: FileNode) => {
    try {
      setIsLoading(true); // Start loading spinner
      // ✅ Send request to backend to download folder
      const folderId = node.id; // Assuming node has an id property
      const response = await fetch(`/api/download-folder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Failed to download:", errorData);
        alert("Download failed: " + errorData.error);
        toast.error("Download failed: " + errorData.error);
        return;
      }
  
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${node.name}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsLoading(false); // Stop loading spinner
      toast.success(`${node.name} downloaded successfully!`);
    } catch (error) {
      console.error("Error downloading folder:", error);
    }
  };

  const handleFolderDeletion = async (node: FileNode) => {
    const folderId = node.id; // Assuming node has an id property
    debugger
    setIsLoading(true); // Start loading spinner
    // ✅ Send request to backend
    const response = await fetch("/api/create-folder", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId }),
    });

    if (!response.ok) {
      console.error("Failed to Delete folder");
      return;
    }
    else{
      setIsLoading(false); // Stop loading spinner
      toast.success(`${node.name} deleted  successfully!`);
      const data = await response.json();
      if(data){
        setFolderStructure(filterFolders(data?.fs));
      }
      
    }
    
  }


  return (
    <>
    {node.type === "folder" ? (
    <div className="">
      {/* Folder or File */}
      <div className="flex items-center cursor-pointer space-x-2 justify-between border-2 my-2 rounded-md ">
        <div className="p-2 ">
          {/* Folder Icon */}
          
            <button className="flex items-center font-semibold" onClick={() => toggleFolder(node.id)}>
              {openFolders[node.id] ? <strong className="flex item-center gap-1 pe-1"><ChevronDown size={"16px"}/> <FolderOpen  size={"16px"}/></strong>  : <strong className="flex item-center gap-1 pe-1"><ChevronRight size={"16px"}/> <Folder size={"16px"}/></strong>}
              {/* Folder/File Name */}
              <span className="">
                {node.name}
              </span>
            </button>
          
          
        </div>

        {/* Buttons for Folders */}
        {node.type === "folder"  && node.name !== "src" && (
          <div className="ml-4 space-x-2 p-1 ">
                    
                    <Tooltip tooltipContent="Edit" side={"top"}>
                            <Button className="text-sm px-2 py-1 h-fit" variant="outline" size={"sm"} onClick={() => openEditFolderModal(node)}>
                              <Edit />Edit
                            </Button>
                            
                    </Tooltip>
                    <Tooltip tooltipContent="Modal" side={"top"}>
                            <Button className="text-sm px-2 py-1 h-fit" variant="outline" size={"sm"} onClick={() => openModal(node.id)}>
                              <Waypoints />Modal
                            </Button>
                      </Tooltip>
                      <Tooltip tooltipContent="Backup"  side={"top"}>
                            <Button className="text-sm px-2 py-1 h-fit" variant="outline" size={"sm"} onClick={() => handleDownloadFolder(node)}>
                              <Download />Backup
                            </Button>
                            
                      </Tooltip>
                      <Tooltip tooltipContent="Delete"  side={"top"}>
                        <Button className="text-sm px-2 py-1 h-fit " variant="destructive" size={"sm"} onClick={() => handleFolderDeletion(node)}>
                          <Trash2Icon />Delete
                        </Button>  
                      </Tooltip>
                      <Tooltip tooltipContent="Start Process" side={"top"}>
                            <Button className="text-sm px-2 py-1 h-fit" variant="outline" size={"sm"} onClick={() => startProcess(node.id)}>
                              <Play />Start
                            </Button>
                            
                      </Tooltip>
                      <Tooltip tooltipContent="My Task" side={"top"}>
                            <Button className="text-sm text-sm px-2 py-1 h-fit" variant="outline" size={"sm"} onClick={() => openTasks(node.id)}>
                              <LayoutList/> My Task
                            </Button>
                            
                      </Tooltip>
          </div>
        )}
      </div>

      {/* Show Children When Folder is Open */}
      {openFolders[node.id] && node.children && (
        <div className="ml-4 border-l border-gray-600 pl-2">
          {node.children.map((child) => (
            <FileExplorer key={child.id} node={child} openEditFolderModal={openEditFolderModal} setIsLoading={setIsLoading} setFolderStructure={setFolderStructure}/>
          ))}
        </div>
      )}
    </div>
    ) : (
            <></>
          )}
</>
  );
}


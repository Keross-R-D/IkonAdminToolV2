"use client";

import { useState } from "react";
import { Folder, FileText, Play, LayoutList, Waypoints, Edit, ChevronRight, ChevronDown, FolderOpen, Download,  } from "lucide-react";
import { Button } from "./button";
import { useRouter } from "next/navigation"; // Next.js router
import { useNavbar } from "@/context/NavbarContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


interface FileNode {
  id: string;
  name: string;
  type: "folder" | "file";
  children?: FileNode[];
}

export default function FileExplorer({ node,openEditFolderModal }: { node: FileNode , openEditFolderModal: any}) {
  const [openFolders, setOpenFolders] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();
  const { selectedApp,setSelectedApp } = useNavbar();

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
  
    console.log("Start Process: ", id); 
    router.push(`/workflow/${encodeURIComponent(id)}`);
    setSelectedApp([...selectedApp,{name: "Modal", id: id}]);
  }

  function openTasks(id: string) {
    console.log("Open Tasks: ", id);
  }
  const handleDownloadFolder = async (folderId: string) => {
    try {
      const response = await fetch(`/api/download-folder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Failed to download:", errorData);
        alert("Download failed: " + errorData.error);
        return;
      }
  
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${folderId}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading folder:", error);
    }
  };


  return (
    <div className="">
      {/* Folder or File */}
      <div className="flex items-center cursor-pointer space-x-2 justify-between border-2 my-2 rounded-md ">
        <div className="p-2 ">
          {/* Folder Icon */}
          {node.type === "folder" ? (
            <button className="flex items-center font-semibold" onClick={() => toggleFolder(node.id)}>
              {openFolders[node.id] ? <strong className="flex item-center gap-1 pe-1"><ChevronDown size={"16px"}/> <FolderOpen  size={"16px"}/></strong>  : <strong className="flex item-center gap-1 pe-1"><ChevronRight size={"16px"}/> <Folder size={"16px"}/></strong>}
              {/* Folder/File Name */}
              <span className="">
                {node.name}
              </span>
            </button>
          ) : (
            <FileText size={0} />
          )}

          
        </div>

        {/* Buttons for Folders */}
        {node.type === "folder"  && node.name !== "src" && (
          <div className="ml-4 space-x-2 p-1 ">
                    
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                            <Button className="text-sm px-2 py-1 h-fit" variant="outline" size={"sm"} onClick={() => openEditFolderModal(node)}>
                              <Edit />Edit
                            </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                            <p>Edit</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                            <Button className="text-sm px-2 py-1 h-fit" variant="outline" size={"sm"} onClick={() => openModal(node.id)}>
                              <Waypoints />Modal
                            </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                            <p>Modal</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                            <Button className="text-sm px-2 py-1 h-fit" variant="outline" size={"sm"} onClick={() => handleDownloadFolder(node.id)}>
                              <Download />Backup
                            </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                            <p>Backup</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                            <Button className="text-sm px-2 py-1 h-fit" variant="outline" size={"sm"} onClick={() => startProcess(node.id)}>
                              <Play />Start
                            </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                            <p>Start</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                            <Button className="text-sm text-sm px-2 py-1 h-fit" variant="outline" size={"sm"} onClick={() => openTasks(node.id)}>
                              <LayoutList/> My Task
                            </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                            <p>My Task</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
          </div>
        )}
      </div>

      {/* Show Children When Folder is Open */}
      {openFolders[node.id] && node.children && (
        <div className="ml-4 border-l border-gray-600 pl-2">
          {node.children.map((child) => (
            <FileExplorer key={child.id} node={child} openEditFolderModal={openEditFolderModal}/>
          ))}
        </div>
      )}
    </div>
  );
}


"use client";

import { useState } from "react";
import { Folder, FileText,} from "lucide-react";
import { Button } from "./button";
import { useRouter } from "next/navigation"; // Next.js router
import { useNavbar } from "@/context/NavbarContext";

interface FileNode {
  id: string;
  name: string;
  type: "folder" | "file";
  children?: FileNode[];
}

export default function FileExplorer({ node }: { node: FileNode }) {
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
    setSelectedApp({name: "Modal", id: id});
  }

  function openTasks(id: string) {
    console.log("Open Tasks: ", id);
  }

  return (
    <div className="">
      {/* Folder or File */}
      <div className="flex items-center cursor-pointer space-x-2 justify-between">
        <div className="pl-2 ">
          {/* Folder Icon */}
          {node.type === "folder" ? (
            <button className="flex items-center gap-1" onClick={() => toggleFolder(node.id)}>
              {openFolders[node.id] ? <strong className="flex">📂</strong>  : <strong className="flex">📁</strong>}
              {/* Folder/File Name */}
              <span className={node.type === "folder" ? "font-bold text-blue-400" : "text-gray-300"}>
                {node.name}
              </span>
            </button>
          ) : (
            <FileText size={0} />
          )}

          
        </div>

        {/* Buttons for Folders */}
        {node.type === "folder"  && node.name !== "src" && (
          <div className="ml-4 space-x-2 py-1">
            <Button className="text-sm px-2 py-1 h-fit" variant="outline" onClick={() => startProcess(node.id)}>
              Start
            </Button>
            <Button className="text-sm text-sm px-2 py-1 h-fit" variant="outline" onClick={() => openModal(node.id)}>
              Modal
            </Button>
            <Button className="text-sm text-sm px-2 py-1 h-fit" variant="outline" onClick={() => openTasks(node.id)}>
              My Task
            </Button>
          </div>
        )}
      </div>

      {/* Show Children When Folder is Open */}
      {openFolders[node.id] && node.children && (
        <div className="ml-4 border-l border-gray-600 pl-2">
          {node.children.map((child) => (
            <FileExplorer key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}


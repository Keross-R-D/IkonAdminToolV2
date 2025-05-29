"use client";

import { useEffect, useState } from "react";
import {
  Folder,
  FileText,
  Play,
  LayoutList,
  Waypoints,
  Edit,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Download,
  Trash2Icon,
} from "lucide-react";
import { Button } from "./button";
import { useRouter } from "next/navigation"; // Next.js router
import { Tooltip } from "@/ikon/components/tooltip";
import { LoadingSpinner } from "@/ikon/components/loading-spinner";
import { set } from "zod";
import { toast } from "sonner";
import { useDialog } from "@/ikon/components/alert-dialog/dialog-context";
import Link from "next/link";
import { apiReaquest } from "@/ikon/utils/apiRequest";
import { hostApiReaquest } from "@/ikon/utils/hostApiRequest";
import { useHostServer } from "@/ikon/components/host-server";
import { useEnvStore } from "@/ikon/components/Add-Env";
import { getValidAccessToken } from "@/ikon/utils/accessToken";
import ProcessModal from "@/app/(application-management)/components/startProcessModal";

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
    .filter(
      (node) =>
        node.type === "folder" &&
        node.name !== "instances" &&
        node.name !== "scripts"
    )
    .flatMap((folder) => {
      if (folder.name === "children") {
        return filterFolders(folder.children);
      }
      return [{ ...folder, children: filterFolders(folder.children) }];
    });
};

const deployProcess = async (processId:string) => {
  const url = `/api/deploy-process/${processId}`;
  const response = await fetch(
    url,
    {
      method: "POST"
    }
  );

  if(response.ok) {
    const {deployed} = await response.json();
    if(deployed) {
      toast.success('successfully deployed the process');
      return;
    }
    else {
      toast.error("process already deployed");
    }
  }else{
    toast.error("Failed to deploy the process");
  }


  
}

export default function FileExplorer({
  node,
  openEditFolderModal,
  setFolderStructure,
  setIsLoading,
}: {
  node: FileNode;
  openEditFolderModal: any;
  setFolderStructure: any;
  setIsLoading: any;
}) {
  const [openFolders, setOpenFolders] = useState<{ [key: string]: boolean }>(
    {}
  );
  const router = useRouter();
  const { openDialog } = useDialog();
  const { hostServer } = useHostServer(); // Get host server from Zustand store
  const { envs, setEnvs } = useEnvStore();

  const [startProcessModalOpen, setStartProcessModalOpen] =
    useState<boolean>(false);
  const [startProcessId, setStartProcessId] = useState<string | null>(null);

  const toggleFolder = (id: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle open state for clicked folder
    }));
  };

  const getHostServerLink = (server: string) => {
    const env = envs.find((env) => env.server === server);
    if (env) {
      return env.link;
    }
    return ""; // Default value if not found
  };

  async function startProcess(formData, callback) {
    console.log("Start Process: ", startProcessId);

    const hostLink = getHostServerLink(hostServer);
    if (hostLink === "") {
      toast.error(`Please fill ${hostServer} host link.`);
      if (callback) {
        callback();
      }
      return;
    }

    //const projectData = await apiReaquest("/api/get_projectData");
    const responce = await apiReaquest(
      `/api/remote/startProcess/${startProcessId}`,
      {
        method: "POST", // or 'POST', etc.
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );
    console.log("Start Process Response: ", responce);
    if (responce?.status == "Failure") {
      toast.error(responce.message);
    } else {
      toast.success(`Instance Started`);
    }
    if (callback) {
      callback();
    }
  }

  function openModal(node: FileNode) {
    // Navigate to Modal Page

    setIsLoading(true);

    console.log("Start Process: ", node.id);
    router.push(
      `/workflow/${encodeURIComponent(node.id)}?name=${encodeURIComponent(
        node.name
      )}`
    ); // Navigate to the modal page
  }

  function openTasks(node: FileNode, showAllTasks: boolean) {
    console.log("Open Tasks: ", node.id);
    const hostLink = getHostServerLink(hostServer);
    if (hostLink === "") {
      toast.error(`Please fill ${hostServer} host link.`);
      return;
    }
    let taskRoute = "myTask";
    if (showAllTasks) {
      taskRoute = "allTask";
    }
    router.push(
      `/${taskRoute}/${encodeURIComponent(node.id)}?name=${encodeURIComponent(
        node.name
      )}`
    ); // Navigate to the modal page
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
        setIsLoading(false); // Stop loading spinner
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
      window.URL.revokeObjectURL(downloadUrl);
      setIsLoading(false); // Stop loading spinner

      toast.success(`${node.name} downloaded successfully!`);
    } catch (error) {
      console.error("Error downloading folder:", error);
    }
  };

  const handleFolderDeletion = async (node: FileNode) => {
    const folderId = node.id; // Assuming node has an id property
    const folderName = node.name; // Assuming node has a name property
    openDialog({
      title: "Confirmation",
      description: `Are you sure you want to delete folder ${folderName}?`,
      cancelText: "Cancel",
      confirmText: "Delete",
      onConfirm: async () => {
        setIsLoading(true); // Start loading spinner
        // ✅ Send request to backend
        const response = await fetch("/api/create-folder", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderId }),
        });

        if (!response.ok) {
          console.error("Failed to Delete folder");
          const errorData = await response.json();
          toast.error("Failed to delete folder: " + errorData.error);
          setIsLoading(false);
          return;
        } else {
          setIsLoading(false); // Stop loading spinner
          toast.success(`${node.name} deleted  successfully!`);
          const data = await response.json();
          if (data) {
            setFolderStructure(filterFolders(data?.fs));
          }
        }
      },
    });
  };

  return (
    <>
      <ProcessModal
        isOpen={startProcessModalOpen}
        setIsOpen={setStartProcessModalOpen}
        startProcessCallback={startProcess}
      />
      {node.type === "folder" ? (
        <div className="">
          {/* Folder or File */}
          <div className="flex items-center cursor-pointer space-x-2 justify-between border-2 my-2 rounded-md ">
            <div className="p-2 ">
              {/* Folder Icon */}

              <button
                className="flex items-center font-semibold"
                onClick={() => toggleFolder(node.id)}
              >
                {openFolders[node.id] ? (
                  <strong className="flex item-center gap-1 pe-1">
                    <ChevronDown size={"16px"} /> <FolderOpen size={"16px"} />
                  </strong>
                ) : (
                  <strong className="flex item-center gap-1 pe-1">
                    <ChevronRight size={"16px"} /> <Folder size={"16px"} />
                  </strong>
                )}
                {/* Folder/File Name */}
                <span className="">{node.name}</span>
              </button>
            </div>

            {/* Buttons for Folders */}
            {node.type === "folder" && node.name !== "src" && (
              <div className="ml-4 space-x-2 p-1 ">
                <Tooltip tooltipContent="Edit" side={"top"}>
                  <Button
                    className="text-sm px-2 py-1 h-fit"
                    variant="outline"
                    size={"sm"}
                    onClick={() => openEditFolderModal(node)}
                  >
                    <Edit />
                    Edit
                  </Button>
                </Tooltip>
                <Tooltip tooltipContent="Modal" side={"top"}>
                  <Button
                    className="text-sm px-2 py-1 h-fit"
                    variant="outline"
                    size={"sm"}
                    onClick={() => openModal(node)}
                  >
                    <Waypoints />
                    Modal
                  </Button>
                </Tooltip>
                <Tooltip tooltipContent="Backup" side={"top"}>
                  <Button
                    className="text-sm px-2 py-1 h-fit"
                    variant="outline"
                    size={"sm"}
                    onClick={() => handleDownloadFolder(node)}
                  >
                    <Download />
                    Backup
                  </Button>
                </Tooltip>
                <Tooltip tooltipContent="Delete" side={"top"}>
                  <Button
                    className="text-sm px-2 py-1 h-fit "
                    variant="destructive"
                    size={"sm"}
                    onClick={() => handleFolderDeletion(node)}
                  >
                    <Trash2Icon />
                    Delete
                  </Button>
                </Tooltip>
                <Tooltip tooltipContent="Start Process" side={"top"}>
                  <Button
                    className="text-sm px-2 py-1 h-fit"
                    variant="outline"
                    size={"sm"}
                    onClick={() => {
                      setStartProcessModalOpen(true);
                      setStartProcessId(node.id);
                    }}
                  >
                    <Play />
                    Start
                  </Button>
                </Tooltip>
                <Tooltip tooltipContent="My Tasks" side={"top"}>
                  <Button
                    className="text-sm text-sm px-2 py-1 h-fit"
                    variant="outline"
                    size={"sm"}
                    onClick={() => openTasks(node, false)}
                  >
                    <LayoutList /> My Tasks
                  </Button>
                </Tooltip>
                <Tooltip tooltipContent="All Tasks" side={"top"}>
                  <Button
                    className="text-sm text-sm px-2 py-1 h-fit"
                    variant="outline"
                    size={"sm"}
                    onClick={() => openTasks(node, true)}
                  >
                    <LayoutList /> All Tasks
                  </Button>
                </Tooltip>
                <Tooltip tooltipContent="Deploy" side={"top"}>
                  <Button
                    className="text-sm text-sm px-2 py-1 h-fit"
                    variant="outline"
                    size={"sm"}
                    onClick={() => deployProcess(node.id)}
                  >
                    <LayoutList /> Deploy
                  </Button>
                </Tooltip>
              </div>
            )}
          </div>

          {/* Show Children When Folder is Open */}
          {openFolders[node.id] && node.children && (
            <div className="ml-4 border-l border-gray-600 pl-2">
              {node.children.map((child) => (
                <FileExplorer
                  key={child.id}
                  node={child}
                  openEditFolderModal={openEditFolderModal}
                  setIsLoading={setIsLoading}
                  setFolderStructure={setFolderStructure}
                />
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

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import archiver from "archiver";
import { folder } from "jszip";


export const runtime = "nodejs";
const structurePath = path.join(process.cwd(), "public/folderStructure.json");

interface FolderNode {
  id: string;
  name: string;
  type: "folder" | "file";
  path: string;
  children?: FolderNode[];
}

function findAndRemoveFolder(
  nodes: FolderNode[],
  id: string
): { updatedNodes: FolderNode[]; deletedPath: string | null } {
  let deletedPath: string | null = null;

  const filteredNodes = nodes.filter((node) => {
    if (node.id === id) {
      deletedPath = node.path;
      return false;
    }

    if (node.children) {
      const result = findAndRemoveFolder(node.children, id);
      node.children = result.updatedNodes;
      if (result.deletedPath) deletedPath = result.deletedPath;
    }

    return true;
  });

  return { updatedNodes: filteredNodes, deletedPath };
}

async function deleteFolderRecursive(folderPath: string) {
  try {
    await fs.rm(folderPath, { recursive: true, force: true });
  } catch (err) {
    console.error(`Failed to delete folder: ${folderPath}`, err);
  }
}


// ✅ DELETE - Deletes folder and updates folderStructure.json
export async function DELETE(req: NextRequest) {
  try {
    const { folderId }: { folderId: string } = await req.json();

    if (!folderId) {
      return NextResponse.json({ error: "Missing folderId" }, { status: 400 });
    }
    try{
      await fs.access(structurePath)
    }catch{
      return NextResponse.json({ error: "folderStructure.json not found" }, { status: 404 });
    }

    const structure = JSON.parse(await fs.readFile(structurePath, "utf-8")) as FolderNode[];

    const { updatedNodes, deletedPath } = findAndRemoveFolder(structure, folderId);

    if (!deletedPath) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    deleteFolderRecursive(deletedPath);

    await fs.writeFile(structurePath, JSON.stringify(updatedNodes, null, 2));

    return NextResponse.json({ fs: updatedNodes, success: true, message: "Folder and contents deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as any).message },
      { status: 500 }
    );
  }
}

// ✅ POST - Folder creation logic remains unchanged
export async function POST(req: Request) {
  try {
    const { parentId, folderName , folderId } = await req.json();

    const fileData = await fs.readFile(structurePath, "utf-8");
    const structure = JSON.parse(fileData);

    let parentFolderPath: string | null = null;
    let parentNode: any = null;
    let parentName: string | null = null;

    function findParentFolder(nodes: any[]): boolean {
      for (const node of nodes) {
        if (node.id === parentId && node.type === "folder") {
          parentFolderPath = node.path;
          parentNode = node;
          parentName = node.name;
          return true;
        }
        if (node.children.length > 0) {
          if (findParentFolder(node.children)) return true;
        }
      }
      return false;
    }

    if (parentId === "src") {
      parentFolderPath = path.join(process.cwd(), "src");
      parentNode = structure.find((node: any) => node.name === "src");
    } else {
      findParentFolder(structure);
    }

    if (!parentFolderPath) {
      return NextResponse.json({ error: "Parent folder not found" }, { status: 400 });
    }

    let newFolderPath;
    if (parentNode.name === "src") {
      newFolderPath = path.join(parentFolderPath, folderName+"_" + folderId);
    } else {
      const childrenFolderPath = path.join(parentFolderPath, "children");

      try {
        const stats = await fs.stat(childrenFolderPath);
        if (!stats.isDirectory()) {
          return NextResponse.json(
            { error: `⚠️ "children" is not a directory in ${parentFolderPath}` },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: `⚠️ "children" folder is missing inside ${parentFolderPath}` },
          { status: 400 }
        );
      }

      newFolderPath = path.join(childrenFolderPath, folderName+"_" + folderId);
    }

    try {
      await fs.access(newFolderPath);
      return NextResponse.json({ error: "Folder already exists!" }, { status: 400 });
    } catch {
      await fs.mkdir(newFolderPath, { recursive: true });
    }

    const subfolders = ["children", "instances", "scripts"];
    for (const subfolder of subfolders) {
      const subfolderPath = path.join(newFolderPath, subfolder);
      try {
        await fs.access(subfolderPath);
      } catch {
        await fs.mkdir(subfolderPath, { recursive: true });
      }
    }

    //find src folder data
    let srcNode: FolderNode | null = null;
    for (const node of structure) {
      if (node.name === "src") {
        srcNode = node;
        break;
      }
    }

    const jsonFiles = ["metadata.json", "process_model.json"];
    for (const file of jsonFiles) {
      const filePath = path.join(newFolderPath, file);
      try {
        await fs.access(filePath);
      } catch {
        let metadata = {};
        if (file === "metadata.json") {
          metadata = {
            processName: folderName,
            processId: folderId,
            processVersion: 1,
            parentProcess: {
              parent: parentName,
              path: srcNode ? newFolderPath.replace(srcNode.path, "") : parentFolderPath,
            },
            isLockRequired: true,
            isSharedProcess: true,
            isInstanceLockNeeded: false,
            isDeployed: false,
            scripts: [],
            processVariableFields: [],
          };
        }
        await fs.writeFile(filePath, JSON.stringify(metadata, null, 2), "utf-8");
      }
    }

    const newFolder = {
      id: folderId,
      name: folderName,
      path: newFolderPath,
      type: "folder",
      children: [],
    };

    if (parentNode) {
      parentNode.children.push(newFolder);
    }

    await fs.writeFile(structurePath, JSON.stringify(structure, null, 2));

    return NextResponse.json({fs: structure, success: true, newFolderPath });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as any).message },
      { status: 500 }
    );
  }
}

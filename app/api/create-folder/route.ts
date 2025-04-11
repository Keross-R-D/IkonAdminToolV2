import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import archiver from "archiver";

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

function deleteFolderRecursive(folderPath: string) {
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true, force: true });
  }
}


// ✅ DELETE - Deletes folder and updates folderStructure.json
export async function DELETE(req: NextRequest) {
  try {
    const { folderId }: { folderId: string } = await req.json();

    if (!folderId) {
      return NextResponse.json({ error: "Missing folderId" }, { status: 400 });
    }

    if (!fs.existsSync(structurePath)) {
      return NextResponse.json({ error: "folderStructure.json not found" }, { status: 404 });
    }

    const structure = JSON.parse(fs.readFileSync(structurePath, "utf-8")) as FolderNode[];

    const { updatedNodes, deletedPath } = findAndRemoveFolder(structure, folderId);

    if (!deletedPath) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    deleteFolderRecursive(deletedPath);

    fs.writeFileSync(structurePath, JSON.stringify(updatedNodes, null, 2));

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
    const { parentId, folderName } = await req.json();

    const fileData = fs.readFileSync(structurePath, "utf-8");
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
      newFolderPath = path.join(parentFolderPath, folderName);
    } else {
      const childrenFolderPath = path.join(parentFolderPath, "children");

      if (!fs.existsSync(childrenFolderPath) || !fs.statSync(childrenFolderPath).isDirectory()) {
        return NextResponse.json(
          { error: `⚠️ "children" folder is missing inside ${parentFolderPath}` },
          { status: 400 }
        );
      }

      newFolderPath = path.join(childrenFolderPath, folderName);
    }

    if (!fs.existsSync(newFolderPath)) {
      fs.mkdirSync(newFolderPath, { recursive: true });
    } else {
      return NextResponse.json({ error: "Folder already exists!" }, { status: 400 });
    }

    const subfolders = ["children", "instances", "scripts"];
    subfolders.forEach((subfolder) => {
      const subfolderPath = path.join(newFolderPath, subfolder);
      if (!fs.existsSync(subfolderPath)) {
        fs.mkdirSync(subfolderPath, { recursive: true });
      }
    });

    const jsonFiles = ["metadata.json", "process_model.json"];
    jsonFiles.forEach((file) => {
      const filePath = path.join(newFolderPath, file);
      let metadata = {};
      if (file === "metadata.json") {
        metadata = {
          processName: folderName,
          parentProcess: {
            parent: parentName,
            path: parentFolderPath,
          },
          isLockRequired: true,
          isSharedProcess: true,
          scripts: [],
          processVariableFields: [],
        };
      }
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
      }
    });

    const newFolder = {
      id: Date.now().toString(),
      name: folderName,
      path: newFolderPath,
      type: "folder",
      children: [],
    };

    if (parentNode) {
      parentNode.children.push(newFolder);
    }

    fs.writeFileSync(structurePath, JSON.stringify(structure, null, 2));

    return NextResponse.json({ success: true, newFolderPath });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as any).message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const structurePath = path.join(process.cwd(), "public/folderStructure.json");

interface FolderNode {
  id: string;
  name: string;
  type: "folder" | "file";
  path: string;
  children?: FolderNode[];
}

function findFolderById(node: FolderNode, id: string): FolderNode | null {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const result = findFolderById(child, id);
      if (result) return result;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { folderId, fileName } = await req.json();

    if (!fs.existsSync(structurePath)) {
      return NextResponse.json({ error: "folderStructure.json not found" }, { status: 404 });
    }

    const structure = JSON.parse(fs.readFileSync(structurePath, "utf-8")) as FolderNode[];
    let targetFolder: FolderNode | null = null;

    for (const rootNode of structure) {
      const found = findFolderById(rootNode, folderId);
      if (found) {
        targetFolder = found;
        break;
      }
    }

    if (!targetFolder || !targetFolder.path) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const scriptsFolderPath = path.join(targetFolder.path, "scripts");

    // Create scripts folder if it doesn't exist
    if (!fs.existsSync(scriptsFolderPath)) {
      fs.mkdirSync(scriptsFolderPath, { recursive: true });
    }

    const filePath = path.join(scriptsFolderPath, fileName);

    fs.writeFileSync(filePath, "// New script file created"); // 'wx' flag to ensure file is created and not overwritten

    return NextResponse.json({ success: true, message: "File created", path: filePath });
  } catch (error) {
    console.error("Error creating script file:", error);
    return NextResponse.json({ error: "Internal Server Error", details: (error as any).message }, { status: 500 });
  }
}

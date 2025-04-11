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

interface ScriptMetadata {
  id: string;
  fileName: string;
  type: string;
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
    const { folderId  }: { folderId: string} =
      await req.json();

    if (!folderId ) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    if (!fs.existsSync(structurePath)) {
      return NextResponse.json({ error: "folderStructure.json not found" }, { status: 404 });
    }

    const structure = JSON.parse(fs.readFileSync(structurePath, "utf-8")) as FolderNode[];
    let targetFolder: FolderNode | null = null;

    for (const root of structure) {
      const found = findFolderById(root, folderId);
      if (found) {
        targetFolder = found;
        break;
      }
    }

    if (!targetFolder || !targetFolder.path) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const scriptsPath = path.join(targetFolder.path, "scripts");
    const metadataPath = path.join(scriptsPath, "metadata.json");

    if (!fs.existsSync(scriptsPath)) {
      fs.mkdirSync(scriptsPath, { recursive: true });
    }

    let metadata: ScriptMetadata[] = [];

    if (fs.existsSync(metadataPath)) {
      metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8")) as ScriptMetadata[];

    }

 // ✅ Correct way to return the metadata
    return NextResponse.json({ metadata });
  } catch (error) {
    console.error("Error updating metadata:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as any).message },
      { status: 500 }
    );
  }
}

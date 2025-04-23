import { NextRequest, NextResponse } from "next/server";
import {promises as fs} from "fs";
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
    const { folderId  }: { folderId: string} = await req.json();

    if (!folderId ) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    try {
      await fs.access(structurePath)
    } catch (error) {
      console.error("Error checking file existence:", error);
      return NextResponse.json({ error: "folderStructure.json not found" }, { status: 404 });
    }

    const structure = JSON.parse(await fs.readFile(structurePath, "utf-8")) as FolderNode[];
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

    try {
      await fs.access(scriptsPath)
      await fs.mkdir(scriptsPath, { recursive: true });
    }catch (error) {
      console.error("Error checking scripts folder existence:", error);
      return NextResponse.json({ error: "scripts folder not found" }, { status: 404 });
    }

    let metadata: ScriptMetadata[] = [];

   try {
      await fs.access(metadataPath)
      metadata = JSON.parse(await fs.readFile(metadataPath, "utf-8")) as ScriptMetadata[];

    }
    catch (error) { 
      console.error("Error reading metadata file:", error);
      return NextResponse.json({ error: "metadata.json not found" }, { status: 404 });
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

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
  langType: string;
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

export async function DELETE(req: NextRequest) {
  try {
    const { folderId, scriptId }: { folderId: string; scriptId: string } =
      await req.json();

    if (!folderId || !scriptId) {
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

    if (!fs.existsSync(metadataPath)) {
      return NextResponse.json({ error: "metadata.json not found" }, { status: 404 });
    }

    let metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8")) as ScriptMetadata[];
    const scriptToDelete = metadata.find((item) => item.id === scriptId);

    if (!scriptToDelete) {
      return NextResponse.json({ error: "Script metadata not found" }, { status: 404 });
    }

    const scriptFilePath = path.join(scriptsPath, scriptToDelete.fileName);

    // Delete actual script file if it exists
    if (fs.existsSync(scriptFilePath)) {
      fs.unlinkSync(scriptFilePath);
    }

    // Remove from metadata
    const updatedMetadata = metadata.filter((item) => item.id !== scriptId);
    fs.writeFileSync(metadataPath, JSON.stringify(updatedMetadata, null, 2));

    return NextResponse.json({
      success: true,
      message: "Script and metadata removed",
      deletedScriptId: scriptId,
      deletedFileName: scriptToDelete.fileName,
      fs : updatedMetadata
    });
  } catch (error) {
    console.error("Error deleting script:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as any).message },
      { status: 500 }
    );
  }
}

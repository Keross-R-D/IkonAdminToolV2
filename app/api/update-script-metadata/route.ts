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
  scriptId: string;
  scriptName: string;
  scriptType: string;
  scriptLanguage: string;
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
    const {
      folderId,
      fileId,
      fileName,
      type,
      langType,
    }: { folderId: string; fileId: string; fileName: string; type: string ; langType: string} =
      await req.json();

    if (!folderId || !fileId || !fileName || !type || !langType) {
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
    const newScriptPath = path.join(scriptsPath, fileName+"_"+fileId+"."+(langType === "JavaScript" ? "js" : langType == "Python" ? "py": "mjs"));

    // Ensure scripts folder exists
    if (!fs.existsSync(scriptsPath)) {
      fs.mkdirSync(scriptsPath, { recursive: true });
    }

    let metadata: ScriptMetadata[] = [];
    let previousFileName: string | null = null;

    if (fs.existsSync(metadataPath)) {
      metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8")) as ScriptMetadata[];

      const existingIndex = metadata.findIndex((item) => item.scriptId === fileId);
      if (existingIndex !== -1) {
        previousFileName = metadata[existingIndex].scriptName;

        if (previousFileName !== fileName) {
          const previousPath = path.join(scriptsPath, previousFileName+"_"+fileId+"."+(langType === "JavaScript" ? "js" : langType == "Python" ? "py": "mjs"));

          if (fs.existsSync(previousPath)) {
            fs.renameSync(previousPath, newScriptPath); // rename file
          }
        }

        metadata[existingIndex].scriptName = fileName;
        metadata[existingIndex].scriptType = type;
        metadata[existingIndex].scriptLanguage = langType;
      } else {
        metadata.push({ scriptId: fileId, scriptName: fileName, scriptType: type ,scriptLanguage: langType });
      }
    } else {
      metadata.push({ scriptId: fileId, scriptName: fileName, scriptType: type ,scriptLanguage: langType });
    }

    // Ensure file exists (create if doesn't)
    if (!fs.existsSync(newScriptPath)) {
      fs.writeFileSync(newScriptPath, "");
    }

    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    return NextResponse.json({
      success: true,
      message: "Metadata and script file created/updated.",
      metadataPath,
      scriptFilePath: newScriptPath,
    });
  } catch (error) {
    console.error("Error updating metadata:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as any).message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

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

// Utility to find folder by ID
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
    const { folderId, fileId, fileName, type, langType } = await req.json();

    if (!folderId || !fileId || !fileName || !type || !langType) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const structureExists = await fs
      .access(structurePath)
      .then(() => true)
      .catch(() => false);

    if (!structureExists) {
      return NextResponse.json({ error: "folderStructure.json not found" }, { status: 404 });
    }

    const structure = JSON.parse(await fs.readFile(structurePath, "utf-8")) as FolderNode[];
    const targetFolder = structure
      .map((root) => findFolderById(root, folderId))
      .find((node) => node !== null);

    if (!targetFolder || !targetFolder.path) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const extMap = new Map([
      ["JavaScript", "js"],
      ["Python", "py"],
      ["Modular JavaScript", "mjs"],
    ]);

    const extension = extMap.get(langType) || "js";
    const scriptsPath = path.join(targetFolder.path, "scripts");
    const metadataPath = path.join(scriptsPath, "metadata.json");
    const newScriptFile = `${fileName}_${fileId}.${extension}`;
    const newScriptPath = path.join(scriptsPath, newScriptFile);

    // Ensure scripts folder exists
    await fs.mkdir(scriptsPath, { recursive: true });

    let metadata: ScriptMetadata[] = [];
    let previousFileName: string | null = null;

    const metadataExists = await fs
      .access(metadataPath)
      .then(() => true)
      .catch(() => false);

    if (metadataExists) {
      metadata = JSON.parse(await fs.readFile(metadataPath, "utf-8")) as ScriptMetadata[];
      const existingIndex = metadata.findIndex((m) => m.scriptId === fileId);

      if (existingIndex !== -1) {
        const existing = metadata[existingIndex];
        previousFileName = existing.scriptName;

        if (previousFileName !== fileName) {
          const oldScriptPath = path.join(
            scriptsPath,
            `${previousFileName}_${fileId}.${extension}`
          );
          const exists = await fs
            .access(oldScriptPath)
            .then(() => true)
            .catch(() => false);

          if (exists) {
            await fs.rename(oldScriptPath, newScriptPath);
          }
        }

        metadata[existingIndex] = {
          scriptId: fileId,
          scriptName: fileName,
          scriptType: type,
          scriptLanguage: langType,
        };
      } else {
        metadata.push({ scriptId: fileId, scriptName: fileName, scriptType: type, scriptLanguage: langType });
      }
    } else {
      metadata.push({ scriptId: fileId, scriptName: fileName, scriptType: type, scriptLanguage: langType });
    }

    // Ensure script file exists
    const scriptFileExists = await fs
      .access(newScriptPath)
      .then(() => true)
      .catch(() => false);

    if (!scriptFileExists) {
      await fs.writeFile(newScriptPath, "");
    }

    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    return NextResponse.json({
      success: true,
      message: "Metadata and script file created/updated.",
      metadataPath,
      scriptFilePath: newScriptPath,
    });
  } catch (error) {
    console.error("🔥 Error saving metadata:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as any).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { folderId, scriptId }: { folderId: string; scriptId: string } = await req.json();

    if (!folderId || !scriptId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Ensure folderStructure.json exists
    try {
      await fs.access(structurePath);
    } catch {
      return NextResponse.json({ error: "folderStructure.json not found" }, { status: 404 });
    }

    const structure = JSON.parse(await fs.readFile(structurePath, "utf-8")) as FolderNode[];

    const targetFolder = structure
      .map((node) => findFolderById(node, folderId))
      .find((f) => f !== null);

    if (!targetFolder || !targetFolder.path) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const scriptsPath = path.join(targetFolder.path, "scripts");
    const metadataPath = path.join(scriptsPath, "metadata.json");

    try {
      await fs.access(metadataPath);
    } catch {
      return NextResponse.json({ error: "metadata.json not found" }, { status: 404 });
    }

    const metadata = JSON.parse(await fs.readFile(metadataPath, "utf-8")) as ScriptMetadata[];
    const scriptToDelete = metadata.find((item) => item.scriptId === scriptId);

    if (!scriptToDelete) {
      return NextResponse.json({
        error: "Script metadata not found",
        data: metadata,
        scriptId,
      }, { status: 404 });
    }

    const ext = scriptToDelete.scriptLanguage === "JavaScript" ? "js" :
                scriptToDelete.scriptLanguage === "Python" ? "py" : "mjs";

    const scriptFilePath = path.join(scriptsPath, `${scriptToDelete.scriptName}_${scriptToDelete.scriptId}.${ext}`);

    // Delete script file if exists
    try {
      await fs.unlink(scriptFilePath);
    } catch {
      // File might not exist; continue
    }

    // Update metadata
    const updatedMetadata = metadata.filter((item) => item.scriptId !== scriptId);
    await fs.writeFile(metadataPath, JSON.stringify(updatedMetadata, null, 2));

    return NextResponse.json({
      success: true,
      message: "Script and metadata removed",
      deletedScriptId: scriptId,
      deletedFileName: scriptToDelete.scriptName,
      fs : updatedMetadata,
    });
  } catch (error) {
    console.error("🔥 Error deleting script:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as any).message },
      { status: 500 }
    );
  }
}

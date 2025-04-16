import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fsPromises } from "fs";
import { readdirSync, statSync } from "fs";
import archiver from "archiver";
import { PassThrough } from "stream";

const structurePath = path.join(process.cwd(), "public/folderStructure.json");

// Find folder by ID
function findFolderById(nodes: any[], folderId: string): any | null {
  for (const node of nodes) {
    if (node.id === folderId) return node;
    if (node.children) {
      const found = findFolderById(node.children, folderId);
      if (found) return found;
    }
  }
  return null;
}

// Recursively add folder contents
function addFolderToArchive(archive: archiver.Archiver, folderPath: string, folderName: string) {
  const items = readdirSync(folderPath, { withFileTypes: true });

  if (items.length === 0) {
    archive.append("", { name: `${folderName}/` }); // Add empty folder
  }

  for (const item of items) {
    const itemPath = path.join(folderPath, item.name);
    const zipPath = path.join(folderName, item.name);

    if (item.isDirectory()) {
      addFolderToArchive(archive, itemPath, zipPath);
    } else {
      archive.file(itemPath, { name: zipPath });
    }
  }
}

// 📦 API to stream ZIP
export async function POST(req: NextRequest) {
  try {
    const { folderId } = await req.json();
    if (!folderId) {
      return NextResponse.json({ error: "Missing folderId" }, { status: 400 });
    }

    const structureData = await fsPromises.readFile(structurePath, "utf-8");
    const folderStructure = JSON.parse(structureData);
    const folderNode = findFolderById(folderStructure, folderId);

    if (!folderNode) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const folderPath = folderNode.path;
    try {
      statSync(folderPath);
    } catch {
      return NextResponse.json({ error: "Folder does not exist" }, { status: 404 });
    }

    const passthrough = new PassThrough();
    const archive = archiver("zip", { zlib: { level: 9 } });

    // Pipe before return
    archive.pipe(passthrough);
    addFolderToArchive(archive, folderPath, folderNode.name);
    archive.finalize();

    const headers = new Headers({
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${folderNode.name}.zip"`,
    });

    return new NextResponse(passthrough as any, { headers });
  } catch (error) {
    console.error("🔥 Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as any).message },
      { status: 500 }
    );
  }
}

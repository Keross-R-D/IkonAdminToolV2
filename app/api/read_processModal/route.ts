import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

const structurePath = path.join(process.cwd(), "public/folderStructure.json");

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");

    if (!folderId) {
      return NextResponse.json({ error: "Missing folderId" }, { status: 400 });
    }

    const fileData = await fs.readFile(structurePath, "utf-8");
    const structure = JSON.parse(fileData);

    function findFolderById(nodes: any[]): any {
      for (const node of nodes) {
        if (node.id === folderId && node.type === "folder") {
          return node;
        }
        if (node.children.length > 0) {
          const found = findFolderById(node.children);
          if (found) return found;
        }
      }
      return null;
    }

    const folderNode = findFolderById(structure);

    if (!folderNode) {
      return NextResponse.json({ error: "Folder not found" }, { status: 400 });
    }

    const folderPath = folderNode.path;
    const processModelPath = path.join(folderPath, "process_model.json");

    try {
      await fs.access(processModelPath);
    } catch {
      return NextResponse.json({ error: `"process_model.json" not found in folder` }, { status: 400 });
    }

    const processModelData = await fs.readFile(processModelPath, "utf-8");
    const jsonData = JSON.parse(processModelData);

    return NextResponse.json({ success: true, data: jsonData });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as any).message },
      { status: 500 }
    );
  }
}

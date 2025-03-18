import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const structurePath = path.join(process.cwd(), "public/folderStructure.json");

export async function POST(req: Request) {
  try {
    const { folderId } = await req.json();

    if (!folderId) {
      return NextResponse.json({ error: "Missing folderId" }, { status: 400 });
    }

    // Read the folder structure to locate the folder path
    const fileData = fs.readFileSync(structurePath, "utf-8");
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

    // Check if process_model.json exists
    if (!fs.existsSync(processModelPath)) {
      return NextResponse.json({ error: `"process_model.json" not found in folder` }, { status: 400 });
    }

    // Read the file data
    const processModelData = fs.readFileSync(processModelPath, "utf-8");
    const jsonData = JSON.parse(processModelData);

    return NextResponse.json({ success: true, data: jsonData });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error", details: (error as any).message }, { status: 500 });
  }
}

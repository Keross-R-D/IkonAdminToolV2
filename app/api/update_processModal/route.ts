import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Ensure Next.js runs this in a Node.js environment
export const runtime = "nodejs";

const structurePath = path.join(process.cwd(), "public/folderStructure.json");

export async function POST(req: Request) {
  try {
    const { folderId, newData } = await req.json();

    // Read the existing folder structure
    const fileData = fs.readFileSync(structurePath, "utf-8");
    const structure = JSON.parse(fileData);

    if (!folderId || !newData) {
      return NextResponse.json({ error: "Missing folderId or newData" }, { status: 400 });
    }

    let targetFolderPath: string | null = null;

    // 🔍 Find the folder path
    function findFolder(nodes: any[]): boolean {
      for (const node of nodes) {
        if (node.id === folderId && node.type === "folder") {
          targetFolderPath = node.path;
          return true;
        }
        if (node.children.length > 0) {
          if (findFolder(node.children)) return true;
        }
      }
      return false;
    }

    findFolder(structure);

    if (!targetFolderPath) {
      return NextResponse.json({ error: "Folder not found!" }, { status: 400 });
    }

    const processModelPath = path.join(targetFolderPath, "process_model.json");

    // ✅ Write data to process_model.json
    fs.writeFileSync(processModelPath, JSON.stringify(newData, null, 2));

    return NextResponse.json({ success: true, message: "process_model.json updated!" });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error", details: (error as any).message }, { status: 500 });
  }
}

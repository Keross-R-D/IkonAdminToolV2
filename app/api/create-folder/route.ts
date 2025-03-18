import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ✅ Ensure Next.js runs this in a Node.js environment
export const runtime = "nodejs";

const structurePath = path.join(process.cwd(), "public/folderStructure.json");

export async function POST(req: Request) {
  try {
    const { parentId, folderName } = await req.json();

    // Read the existing folder structure
    const fileData = fs.readFileSync(structurePath, "utf-8");
    const structure = JSON.parse(fileData);

    let parentFolderPath: string | null = null;
    let parentNode: any = null;
    let parentName: string | null = null;

    // 🔍 Find the parent folder and its actual path
    function findParentFolder(nodes: any[]): boolean {
      for (const node of nodes) {
        if (node.id === parentId && node.type === "folder") {
          parentFolderPath = node.path;
          parentNode = node;
          parentName = node.name;
          return true;
        }
        if (node.children.length > 0) {
          if (findParentFolder(node.children)) return true;
        }
      }
      return false;
    }

    // ✅ Find "src" folder if it's the parent
    if (parentId === "src") {
      parentFolderPath = path.join(process.cwd(), "src");
      parentNode = structure.find((node: any) => node.name === "src");
    } else {
      findParentFolder(structure);
    }

    if (!parentFolderPath) {
      return NextResponse.json({ error: "Parent folder not found" }, { status: 400 });
    }

    // ✅ Define the folder creation path
    let newFolderPath;
    if (parentNode.name === "src") {
      // If parent is "src", create the folder directly inside "src"
      newFolderPath = path.join(parentFolderPath, folderName);
    } else {
      // Otherwise, check for "children" folder
      const childrenFolderPath = path.join(parentFolderPath, "children");

      if (!fs.existsSync(childrenFolderPath) || !fs.statSync(childrenFolderPath).isDirectory()) {
        return NextResponse.json(
          { error: `⚠️ "children" folder is missing inside ${parentFolderPath}` },
          { status: 400 }
        );
      }

      newFolderPath = path.join(childrenFolderPath, folderName);
    }

    // ✅ Create the new folder
    if (!fs.existsSync(newFolderPath)) {
      fs.mkdirSync(newFolderPath, { recursive: true });
    } else {
      return NextResponse.json({ error: "Folder already exists!" }, { status: 400 });
    }

    console.log(`📂 Folder Created at: ${newFolderPath}`);

    // ✅ Create subfolders inside the new folder
    const subfolders = ["children", "instances", "scripts"];
    subfolders.forEach((subfolder) => {
      const subfolderPath = path.join(newFolderPath, subfolder);
      if (!fs.existsSync(subfolderPath)) {
        fs.mkdirSync(subfolderPath, { recursive: true });
      }
    });

    // ✅ Create empty JSON files inside the new folder
    const jsonFiles = ["metadata.json", "process_model.json"];
    jsonFiles.forEach((file) => {
      const filePath = path.join(newFolderPath, file);
      let metadata = {};
      if(file === "metadata.json"){
        metadata = {
          "processName": folderName,
          "parentProcess": {
            "parent": parentName,
            "path": parentFolderPath
          },
          "isLockRequired": true,
          "isSharedProcess": true,
          "scripts": [],
          "processVariableFields": []
        } 
      }
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
      }
    });

    // ✅ Add new folder to JSON structure
    const newFolder = {
      id: Date.now().toString(),
      name: folderName,
      path: newFolderPath,
      type: "folder",
      children: [],
    };

    if (parentNode) {
      parentNode.children.push(newFolder);
    }

    // ✅ Save updated structure
    fs.writeFileSync(structurePath, JSON.stringify(structure, null, 2));

    return NextResponse.json({ success: true, newFolderPath });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as any).message },
      { status: 500 }
    );
  }
}

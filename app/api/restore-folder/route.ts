import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Ensure Next.js runs this in a Node.js environment
export const runtime = "nodejs";

const structurePath = path.join(process.cwd(), "public/folderStructure.json");


interface FolderNode {
  id: string;
  name: string;
  path : string;
  type: "folder" | "file";
  children?: FolderNode[];
  content?: string; // File content (for files only)
}

function findSrcPath(nodes: FolderNode | FolderNode[]): string {
  const nodeArray = Array.isArray(nodes) ? nodes : [nodes];
  for (const node of nodeArray) {
    if (node.name === "src") {
      return node.path;
    }
    if (node.children && node.children.length > 0) {
      const result = findSrcPath(node.children);
      if (result) return result;
    }
  }
  return "";
}

export async function POST(req: Request) {
  try {
    const { folderStructure }: { folderStructure: FolderNode } = await req.json();

    let existingStructure: FolderNode[] = [];
    if (fs.existsSync(structurePath)) {
      existingStructure = JSON.parse(fs.readFileSync(structurePath, "utf-8"));
    }
    

    const srcPath = findSrcPath(existingStructure);

    if (!folderStructure || !folderStructure.name) {
      return NextResponse.json({ error: "Invalid folder structure" }, { status: 400 });
    }

    // ✅ Ensure the new folder is created directly inside `src`
    const newFolderPath = path.join(srcPath, folderStructure.name);

    

    console.log(`🛠 Creating folder structure at: ${newFolderPath}`);

    // Recursive function to create folders and files
    const createFolderStructure = (node: FolderNode, currentPath: string) => {
      const itemPath = path.join(currentPath, node.name);

      if (node.type === "folder") {
        if (!fs.existsSync(itemPath)) {
          console.log(`📁 Creating folder: ${itemPath}`);
          fs.mkdirSync(itemPath, { recursive: true });
        }
        node.children?.forEach((child) => createFolderStructure(child, itemPath));
      } else if (node.type === "file") {
        console.log(`📄 Creating file: ${itemPath}`);
        fs.writeFileSync(itemPath, node.content || ""); // Write file content
      }
      if(node.children){
        node.children.forEach((child) => createFolderStructure(child,itemPath))
      }
    };

    // ✅ Create folder and files inside `src`
    if (folderStructure.children) {
       createFolderStructure(folderStructure, srcPath);
    }

    // 🔍 Verify the folder was created correctly
    if (!fs.existsSync(newFolderPath)) {
      console.error(`❌ Error: Folder not created at ${newFolderPath}`);
      return NextResponse.json({ error: "Failed to create folder in filesystem" }, { status: 500 });
    }

    console.log(`✅ Folder successfully created in: ${newFolderPath}`);

    // ✅ Update `folderStructure.json`
    
    for(const node of existingStructure){
        if(node.name === "src"){
            node.children?.push({ ...folderStructure, path: newFolderPath })
        }
    }
    
    fs.writeFileSync(structurePath, JSON.stringify(existingStructure, null, 2));

    return NextResponse.json({fs : existingStructure, success: true, message: "Folder restored successfully!", path: newFolderPath });
  } catch (error) {
    console.error("🔥 Error restoring folder:", error);
    return NextResponse.json({ error: "Internal Server Error", details: (error as any).message }, { status: 500 });
  }
}

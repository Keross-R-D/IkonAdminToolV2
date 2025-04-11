import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { string } from "zod";

// Ensure Next.js runs this in a Node.js environment
export const runtime = "nodejs";

const structurePath = path.join(process.cwd(), "public/folderStructure.json");

export async function POST(req: Request) {
  try {
    const { folderId, newFolderName, newParentId } = await req.json();

    // Read the existing folder structure
    const fileData = fs.readFileSync(structurePath, "utf-8");
    const structure = JSON.parse(fileData);

    let folderNode: any = null;
    let oldParentNode: any = null;
    let newParentNode: any = null;

    // Find the folder and its parent
    function findFolderAndParent(nodes: any[], parent: any = null): boolean {
      for (const node of nodes) {
        if (node.id === folderId) {
          folderNode = node;
          oldParentNode = parent;
          return true;
        }
        if (node.children.length > 0) {
          if (findFolderAndParent(node.children, node)) return true;
        }
      }
      return false;
    }

    // Find the new parent folder
    function findNewParentFolder(nodes: any[]): boolean {
      for (const node of nodes) {
        if (node.id === newParentId) {
          newParentNode = node;
          return true;
        }
        if (node.children.length > 0) {
          if (findNewParentFolder(node.children)) return true;
        }
      }
      return false;
    }

    function findSrcPath(nodes: any[]): string {
      for (const node of nodes) {
        if (node.name === "src") {
           return node.path;
        }
        if (node.children.length > 0) {
          if (findSrcPath(node.children)) return "";
        }
      }
      return "";
    }

    if (!findFolderAndParent(structure)) {
      return NextResponse.json({ error: "Folder not found" }, { status: 400 });
    }

    if (newParentId !== "src" && !findNewParentFolder(structure)) {
      return NextResponse.json({ error: "New parent folder not found" }, { status: 400 });
    }
    let newParentName: string | null = null;
    for (const node of structure){
      if(node.id === newParentId){
        newParentName = node.name;

      }
        
    }
    
    // Define old and new paths
    const oldFolderPath = folderNode.path;
    let newFolderPath: string;

    if (newParentName === "src") {
      
      // ✅ Place the folder directly inside "src"
      newFolderPath = path.join(findSrcPath(structure),  newFolderName);
    } else {
      // ✅ Place inside "children" of the new parent
      const newParentPath = newParentNode.path;
      newFolderPath = path.join(newParentPath, "children", newFolderName);

      // Ensure "children" folder exists inside the new parent
      const childrenFolderPath = path.join(newParentPath, "children");
      if (!fs.existsSync(childrenFolderPath)) {
        fs.mkdirSync(childrenFolderPath, { recursive: true });
      }
    }

    

    // Rename folder in the actual directory
    if (fs.existsSync(oldFolderPath)) {
      fs.renameSync(oldFolderPath, newFolderPath);
    } else {
      return NextResponse.json({ error: "Folder does not exist in file system" }, { status: 400 });
    }

    // Update the JSON structure
    folderNode.name = newFolderName;
    folderNode.path = newFolderPath;

    if (oldParentNode) {
      oldParentNode.children = oldParentNode.children.filter((child: any) => child.id !== folderId);
    }

    if (newParentId === "src") {
      structure.push(folderNode);
    } else {
      newParentNode.children.push(folderNode);
    }

    // Save updated structure
    fs.writeFileSync(structurePath, JSON.stringify(structure, null, 2));

    return NextResponse.json({fs:structure, success: true, newFolderPath });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error", details: (error as any).message }, { status: 500 });
  }
}

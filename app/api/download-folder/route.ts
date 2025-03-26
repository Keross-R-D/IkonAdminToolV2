import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { promisify } from "util";

const structurePath = path.join(process.cwd(), "public/folderStructure.json");

// Utility: Recursively find a folder in the structure by its ID
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

// Utility: Ensure all files and empty folders are added to the ZIP
function addFolderToArchive(archive: archiver.Archiver, folderPath: string, folderName: string) {
  const items = fs.readdirSync(folderPath, { withFileTypes: true });

  if (items.length === 0) {
    archive.append("", { name: `${folderName}/` }); // Add empty folders
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

// 📌 API Route: Generate and Download Folder as ZIP
export async function POST(req: NextRequest) {
  try {
    const { folderId } = await req.json();
    if (!folderId) return NextResponse.json({ error: "Missing folderId" }, { status: 400 });

    // 🔍 Read folder structure
    const folderStructure = JSON.parse(fs.readFileSync(structurePath, "utf-8"));
    const folderNode = findFolderById(folderStructure, folderId);

    if (!folderNode) return NextResponse.json({ error: "Folder not found" }, { status: 404 });

    const folderPath = folderNode.path;
    if (!fs.existsSync(folderPath)) return NextResponse.json({ error: "Folder does not exist" }, { status: 404 });

    // ✅ Ensure "temp" directory exists
    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    // ✅ Create ZIP file path
    const zipPath = path.join(tempDir, `${folderNode.name}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
      archive.pipe(output);
      addFolderToArchive(archive, folderPath, folderNode.name);

      archive.finalize(); // Finalize ZIP creation

      output.on("close", async () => {
        try {
          const zipBuffer = fs.readFileSync(zipPath);
          fs.unlinkSync(zipPath); // Delete ZIP after reading

          resolve(
            new NextResponse(zipBuffer, {
              headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename="${folderNode.name}.zip"`,
              },
            })
          );
        } catch (err) {
          reject(NextResponse.json({ error: "Failed to read ZIP file" }, { status: 500 }));
        }
      });

      archive.on("error", (err) => {
        reject(NextResponse.json({ error: "Error creating ZIP", details: err.message }, { status: 500 }));
      });
    });
  } catch (error) {
    console.error("🔥 Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Internal Server Error", details: errorMessage }, { status: 500 });
  }
}

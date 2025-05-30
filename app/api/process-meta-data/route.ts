import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const findMetadata = (nodes: any[]): string | null => {
  for (const node of nodes) {
    if (node.type === "file" && node.name === "metadata.json") {
      return node.path;
    }
    if (node.children && node.children.length > 0) {
      const result = findMetadata(node.children);
      if (result) return result;
    }
  }
  return null;
};

export async function GET() {
  try {
    const structurePath = path.join(
      process.cwd(),
      "public/folderStructure.json"
    );
    const folderData = JSON.parse(fs.readFileSync(structurePath, "utf-8"));

    const metadataPath = findMetadata(folderData);

    if (!metadataPath) {
      return NextResponse.json(
        { error: "metadata.json not found" },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(metadataPath, "utf-8");
    return NextResponse.json({
      path: metadataPath,
      content: JSON.parse(fileContent),
    });
  } catch (error) {
    console.error("Error reading metadata:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
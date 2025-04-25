import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from 'uuid';

interface Group {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  groupType: string;
}

const structurePath = path.join(process.cwd(), "public/folderStructure.json");

export async function GET() {
  try {
    const structure: any = JSON.parse(await fs.readFile(structurePath, "utf8"));
    let DATA_FILE_PATH = "";

    for (const i of structure) {
      if (i.name === "project.json") {
        DATA_FILE_PATH = i.path;
        break;
      }
    }

    if (!DATA_FILE_PATH) {
      throw new Error("project.json path not found in structure");
    }

    console.log("data file path ", DATA_FILE_PATH);

    try {
      await fs.access(DATA_FILE_PATH);
    } catch (err) {
      throw new Error(`File not found at path: ${DATA_FILE_PATH}`);
    }

    const finalData = JSON.parse(await fs.readFile(DATA_FILE_PATH, "utf8"));
    

    return NextResponse.json(finalData);
  } catch (error) {
    console.error("Error reading groups file:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load groups",
      },
      { status: 500 }
    );
  }
}
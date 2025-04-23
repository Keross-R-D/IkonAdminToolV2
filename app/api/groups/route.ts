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

interface FileData {
  groups: Group[];
}

interface StructureItem {
  name: string;
  path: string;
}
const structurePath = path.join(process.cwd(), "public/folderStructure.json");

let DATA_FILE_PATH: string = "";

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
    const groups = finalData.groups;

    return NextResponse.json(groups);
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

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const newGroup: Partial<Group> = await request.json();
    let fileData: FileData = { groups: [] };

    try {
      const structure: StructureItem[] = JSON.parse(
        await fs.readFile(structurePath, "utf8")
      );
      const projectFile = structure.find(
        (item: StructureItem) => item.name === "project.json"
      );

      if (!projectFile) {
        throw new Error("project.json not found in folder structure");
      }

      DATA_FILE_PATH = projectFile.path;
      console.log("Data file path:", DATA_FILE_PATH);

      const existingData = await fs.readFile(DATA_FILE_PATH, "utf8");
      fileData = JSON.parse(existingData) as FileData;
    } catch (error) {
      console.log("Creating new groups file or error reading existing:", error);
    }

    const groups: Group[] = fileData.groups || [];
    const groupId = newGroup.id || uuidv4();

    const updatedGroup: Group = {
      id: groupId,
      name: newGroup.name || "",
      description: newGroup.description,
      active: true,
      groupType: "static",
    };

    const existingIndex = groups.findIndex((g) => g.id === groupId);
    if (existingIndex !== -1) {
      groups[existingIndex] = updatedGroup;
    } else {
      groups.push(updatedGroup);
    }

    fileData.groups = groups;
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(fileData, null, 2));

    return NextResponse.json({
      success: true,
      data: updatedGroup,
    });
  } catch (error: unknown) {
    console.error("Error in POST /api/groups:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        error: "Failed to save group data",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

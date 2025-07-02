import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from 'uuid';

interface Role {
  id: string;
  name: string;
  active: boolean;
  description?: string;
}

interface FileData {
  roles: Role[];
}

interface StructureItem {
  name: string;
  path: string;
}

const structurePath = path.join(process.cwd(), "public/folderStructure.json");
let DATA_FILE_PATH: string = "";

export async function GET(): Promise<NextResponse> {
  try {
    const structure: StructureItem[] = JSON.parse(
      await fs.readFile(structurePath, "utf8")
    );
    console.log("strcture ",structure)
    const rolesFile = structure.find((item) => item.name === "project.json");

    if (!rolesFile) {
      return NextResponse.json(
        { error: "project.json not found in folder structure" },
        { status: 404 }
      );
    }

    DATA_FILE_PATH = rolesFile.path;
    console.log("Roles data file path:", DATA_FILE_PATH);

    const fileData = await fs.readFile(DATA_FILE_PATH, "utf8");
    const rolesData: FileData = JSON.parse(fileData);

    return NextResponse.json(rolesData.roles || []);
  } catch (error: unknown) {
    console.error("Error reading roles file:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        error: "Failed to load roles",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const newRole: Partial<Role> = await request.json();

    let fileData: FileData = { roles: [] };

    const structure: StructureItem[] = JSON.parse(
      await fs.readFile(structurePath, "utf8")
    );
    const rolesFile = structure.find((item) => item.name === "project.json");

    if (!rolesFile) {
      return NextResponse.json(
        { error: "project.json not found in folder structure" },
        { status: 404 }
      );
    }

    DATA_FILE_PATH = rolesFile.path;
    console.log("Roles data file path:", DATA_FILE_PATH);

    try {
      const existingData = await fs.readFile(DATA_FILE_PATH, "utf8");
      fileData = JSON.parse(existingData);
    } catch (error) {
      console.log("Creating new roles file");
    }

    const roles = fileData.roles || [];
    const roleId = newRole.id || uuidv4();

    const updatedRole: Role = {
      id: roleId,
      name: newRole.name || "",
      active: true,
      description: newRole.description,
    };

    const existingIndex = roles.findIndex((r) => r.id === roleId);
    if (existingIndex !== -1) {
      roles[existingIndex] = updatedRole;
    } else {
      roles.push(updatedRole);
    }

    fileData.roles = roles;
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(fileData, null, 2));

    return NextResponse.json({
      success: true,
      data: updatedRole,
    });
  } catch (error: unknown) {
    console.error("Error saving role data:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        error: "Failed to save role data",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

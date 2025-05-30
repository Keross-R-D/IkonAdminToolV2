import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

interface Role {
  id: string;
  name: string;
  permissions?: string[];
  description?: string;
  active?: boolean;
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

export async function PUT(request: Request): Promise<NextResponse> {
  try {
    const { id, active } = await request.json();

    if (!id || typeof active !== "boolean") {
      return NextResponse.json(
        {
          error:
            "Invalid request body - both id and active (boolean) are required",
        },
        { status: 400 }
      );
    }

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

    const fileData: FileData = JSON.parse(
      await fs.readFile(DATA_FILE_PATH, "utf8")
    );
    const roles = fileData.roles || [];

    const roleIndex = roles.findIndex((role) => role.id === id);
    if (roleIndex === -1) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const updatedRole: Role = {
      ...roles[roleIndex],
      active,
    };
    roles[roleIndex] = updatedRole;

    fileData.roles = roles;
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(fileData, null, 2));

    return NextResponse.json(updatedRole);
  } catch (error: unknown) {
    console.error("Error updating role status:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        error: "Internal server error",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

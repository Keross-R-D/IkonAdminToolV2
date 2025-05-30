import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

interface Role {
  id: string;
  name: string;
  groups?: string[];
  // other role properties...
}

interface Group {
  id: string;
  // other group properties...
}

interface FileData {
  roles?: Role[];
  groups?: Group[];
}

interface StructureItem {
  name: string;
  path: string;
}

const structurePath = path.join(process.cwd(), "public/folderStructure.json");

export async function PUT(request: Request): Promise<NextResponse> {
  try {
    const { roleId, groupIds } = await request.json();

    if (!roleId || !Array.isArray(groupIds)) {
      return NextResponse.json(
        { error: "Invalid request body - roleId and groupIds array are required" },
        { status: 400 }
      );
    }

    const structure: StructureItem[] = JSON.parse(await fs.readFile(structurePath, "utf8"));
    
    const rolesFile = structure.find(item => item.name === "project.json");
    const groupsFile = structure.find(item => item.name === "project.json");

    if (!rolesFile || !groupsFile) {
      return NextResponse.json(
        { error: "Required data files not found in folder structure" },
        { status: 500 }
      );
    }

    // Read data files
    const rolesData: FileData = JSON.parse(await fs.readFile(rolesFile.path, "utf8"));
    const groupsData: FileData = JSON.parse(await fs.readFile(groupsFile.path, "utf8"));

    const roles = rolesData.roles || [];
    const groups = groupsData.groups || [];

    // Validate group IDs
    const invalidGroups = groupIds.filter(
      id => !groups.some(group => group.id === id)
    );

    if (invalidGroups.length > 0) {
      return NextResponse.json(
        { 
          error: "Invalid group IDs", 
          invalidGroups,
          status: 400 
        }
      );
    }

    // Find and update role
    const roleIndex = roles.findIndex(role => role.id === roleId);
    if (roleIndex === -1) {
      return NextResponse.json(
        { error: "Role not found" },
        { status: 404 }
      );
    }

    const updatedRole: Role = {
      ...roles[roleIndex],
      groups: groupIds
    };

    roles[roleIndex] = updatedRole;
    rolesData.roles = roles;

    // Save updated roles
    await fs.writeFile(rolesFile.path, JSON.stringify(rolesData, null, 2));

    return NextResponse.json(updatedRole);
  } catch (error: unknown) {
    console.error("Error updating role groups:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}
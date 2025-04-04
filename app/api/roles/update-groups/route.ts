import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const ROLES_FILE_PATH = path.join(process.cwd(), "data", "roles.json");
const GROUPS_FILE_PATH = path.join(process.cwd(), "data", "groups.json");

export async function PUT(request: Request) {
  try {
    const { roleId, groupIds } = await request.json();

    if (!roleId || !Array.isArray(groupIds)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const rolesData = await fs.readFile(ROLES_FILE_PATH, "utf8");
    const groupsData = await fs.readFile(GROUPS_FILE_PATH, "utf8");

    const roles = JSON.parse(rolesData);
    const groups = JSON.parse(groupsData);

    const invalidGroups = groupIds.filter(
      (id) => !groups.some((group: any) => group.id === id)
    );

    if (invalidGroups.length > 0) {
      return NextResponse.json(
        { error: `Invalid group IDs: ${invalidGroups.join(", ")}` },
        { status: 400 }
      );
    }

    const roleIndex = roles.findIndex((role: any) => role.id === roleId);
    if (roleIndex === -1) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    const updatedRole = {
      ...roles[roleIndex],
      groups: groupIds,
    };

    roles[roleIndex] = updatedRole;

    await fs.writeFile(ROLES_FILE_PATH, JSON.stringify(roles, null, 2));

    return NextResponse.json(updatedRole);
  } catch (error) {
    console.error("Error updating role groups:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

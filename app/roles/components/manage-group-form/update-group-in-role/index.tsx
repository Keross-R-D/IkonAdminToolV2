"use server";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";

interface RoleData {
  id?: string;
  name: string;
  description?: string;
  softwareId: string;
}

export const updateGroupStatusInRole = async (
  roleId: string,
  selectedGroupIds: string[]
): Promise<RoleData> => {
  try {
    const header = await headers();
  const host =
    (header.get("x-forwarded-proto") || "http") +
    "://" +
    (header.get("host") || "localhost:3000");
    const response = await fetch(`${host}/api/roles/update-groups`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roleId,
        groupIds: selectedGroupIds,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save groups to role");
    }

    const updatedRole = await response.json();
    revalidateTag("roles");

    console.log(`Successfully saved ${selectedGroupIds.length} groups to role`);
    return updatedRole;
  } catch (error) {
    console.error("Error saving groups to role:", error);
    throw error;
  }
};

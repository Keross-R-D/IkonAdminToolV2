"use server";
import { revalidateTag } from "next/cache";

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
    const response = await fetch("http://localhost:3000/api/roles/update-groups", {
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

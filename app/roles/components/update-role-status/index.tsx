"use server";
import { revalidateTag } from "next/cache";

interface RoleData {
  id?: string;
  name: string;
  description?: string;
  softwareId: string;
  active: boolean;
}

export const updateRoleStatus = async (
  updatedRow: RoleData
): Promise<RoleData> => {
  try {
    const response = await fetch(
      "http://localhost:3000/api/update-role-status",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: updatedRow.id,
          active: updatedRow.active,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update role status");
    }

    const result = await response.json();
    revalidateTag("roles");
    return result.data;
  } catch (error) {
    console.error("Error saving role:", error);
    throw error;
  }
};

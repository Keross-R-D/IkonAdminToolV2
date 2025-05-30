"use server";
import { apiReaquest } from "@/ikon/utils/apiRequest";
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
    
    const response = await apiReaquest(`/api/roles/update-groups`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roleId,
        groupIds: selectedGroupIds,
      }),
    });

   

    const updatedRole = response;
    revalidateTag("roles");

    console.log(`Successfully saved ${selectedGroupIds.length} groups to role`);
    return updatedRole;
  } catch (error) {
    console.error("Error saving groups to role:", error);
    throw error;
  }
};

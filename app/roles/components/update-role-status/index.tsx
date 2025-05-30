"use server";
import { apiReaquest } from "@/ikon/utils/apiRequest";
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
    
    const response = await apiReaquest(`/api/update-role-status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: updatedRow.id,
        active: updatedRow.active,
      }),
    });

    

    revalidateTag("roles");
    return response;
  } catch (error) {
    console.error("Error saving role:", error);
    throw error;
  }
};

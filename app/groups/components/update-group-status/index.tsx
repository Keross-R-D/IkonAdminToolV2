"use server";
import { apiReaquest } from "@/ikon/utils/apiRequest";
import { revalidateTag } from "next/cache";

interface GroupData {
  id?: string;
  name: string;
  description?: string;
  active: boolean;
}

export const updateGroupStatus = async (
  updatedRow: GroupData
): Promise<GroupData> => {
  try {
   
    const response = await apiReaquest(`/api/update-group-status`,
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

    

   
    revalidateTag("groups");
    return response;
  } catch (error) {
    console.error("Error saving group:", error);
    throw error;
  }
};

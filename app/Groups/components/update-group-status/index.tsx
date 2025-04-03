"use server";
import { revalidateTag } from "next/cache";

interface GroupData {
  id?: string;
  name: string;
  description?: string;
  softwareId: string;
  active: boolean;
}

export const updateGroupStatus = async (
  updatedRow: GroupData
): Promise<GroupData> => {
  try {
    const response = await fetch(
      "http://localhost:3000/api/update-group-status",
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
      throw new Error("Failed to update group status");
    }

    const result = await response.json();
    revalidateTag("groups");
    return result.data;
  } catch (error) {
    console.error("Error saving group:", error);
    throw error;
  }
};

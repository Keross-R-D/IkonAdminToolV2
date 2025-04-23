"use server";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";

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
    const header = await headers();
  const host =
    (header.get("x-forwarded-proto") || "http") +
    "://" +
    (header.get("host") || "localhost:3000");
    const response = await fetch(`${host}/api/update-group-status`,
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

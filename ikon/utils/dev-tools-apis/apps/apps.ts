"use server";
import { AppProps } from "@/ikon/utils/dev-tools-apis/apps/types";
import { revalidateTag } from "next/cache";
import { apiErrorHandler } from "../globalErrorHandler";

export async function getApps(): Promise<AppProps[]> {
  try {
    const response = await fetch(`${process.env.DEV_TOOLS_API_URL}/project`, {
      next: {
        tags: ["projects"],
      },
    });

    await apiErrorHandler(response);

    return await response.json();
  } catch (error) {
    throw new Error("Failed to fetch projectsF");
  }
}

export async function createApp(projectDetails: {
  name: string;
  description?: string;
}): Promise<AppProps> {
  try {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const raw = JSON.stringify(projectDetails);

    const requestOptions = {
      method: "POST",
      headers: headers,
      body: raw,
    };

    const response = await fetch(
      `${process.env.DEV_TOOLS_API_URL}/project`,
      requestOptions
    );

    await apiErrorHandler(response);

    revalidateTag("projects");
    return await response.json();
  } catch (error) {
    throw new Error("Failed to create project");
  }
}

export async function updateApp(
  id: number,
  projectDetails: {
    name: string;
    description?: string;
  }
): Promise<AppProps> {
  try {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const raw = JSON.stringify(projectDetails);

    const requestOptions = {
      method: "PUT",
      headers: headers,
      body: raw,
    };

    const response = await fetch(
      `${process.env.DEV_TOOLS_API_URL}/project/${id}`,
      requestOptions
    );

    await apiErrorHandler(response);

    revalidateTag("projects");
    return await response.json();
  } catch (error) {
    throw new Error("Failed to update project");
  }
}

export async function deleteApp(id: number) {
  try {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const requestOptions = {
      method: "DELETE",
      headers: headers,
    };

    const response = await fetch(
      `${process.env.DEV_TOOLS_API_URL}/project/${id}`,
      requestOptions
    );

    await apiErrorHandler(response);

    revalidateTag("projects");
    return await response.json();
  } catch (error) {
    throw new Error("Failed to delete project");
  }
}

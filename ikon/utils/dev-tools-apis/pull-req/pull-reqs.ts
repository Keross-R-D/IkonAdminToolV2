"use server";

import { PullRequestProps } from "@/ikon/utils/dev-tools-apis/pull-req/types";
import { revalidateTag } from "next/cache";
import { apiErrorHandler } from "../globalErrorHandler";

export async function getPullRequests(): Promise<PullRequestProps[]> {
  try {
    const response = await fetch(`${process.env.DEV_TOOLS_API_URL}/pull-req`, {
      next: {
        tags: ["pull-requests"],
      },
    });

    await apiErrorHandler(response);

    return await response.json();
  } catch (error) {
    throw new Error("Failed to fetch pull requests");
  }
}

export async function createPullRequests(pullRequestDetails: {
  title: string;
  description?: string;
  projectId: number;
  sourceBranch: string;
  targetBranch: string;
}): Promise<PullRequestProps> {
  try {
    const headers = new Headers();
    headers.append("Content-type", "application/json");

    const raw = JSON.stringify(pullRequestDetails);

    const requestOptions = {
      method: "POST",
      headers: headers,
      body: raw,
    };

    const response = await fetch(
      `${process.env.DEV_TOOLS_API_URL}/pull-req`,
      requestOptions
    );

    await apiErrorHandler(response);

    revalidateTag("pull-requests");
    return await response.json();
  } catch (error) {
    throw new Error("Failed to create pull request");
  }
}

export async function approvePullRequest(pullRequestId: string) {
  try {
    const headers = new Headers();
    headers.set("Content-type", "application/json");

    const requestOptions = {
      method: "PUT",
      headers: headers,
    };

    const url = `${process.env.DEV_TOOLS_API_URL}/pull-req/${pullRequestId}/approve`;
    const response = await fetch(url, requestOptions);

    await apiErrorHandler(response);

    revalidateTag("pull-requests");
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to approve pull-req with id ${pullRequestId}`);
  }
}

export async function rejectPullRequest(pullRequestId: string) {
  try {
    const headers = new Headers();
    headers.set("Content-type", "application/json");

    const requestOptions = {
      method: "PUT",
      headers: headers,
    };

    const url = `${process.env.DEV_TOOLS_API_URL}/pull-req/${pullRequestId}/reject`;
    const response = await fetch(url, requestOptions);

    await apiErrorHandler(response);

    revalidateTag("pull-requests");
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to approve pull-req with id ${pullRequestId}`);
  }
}

export async function getPullRequestDiff(pullRequestId: string) {
  try {
    const headers = new Headers();
    headers.set("Content-type", "application/json");

    const requestOptions = {
      method: "GET",
      headers: headers,
    };

    const url = `${process.env.DEV_TOOLS_API_URL_LOCAL}/pull-req/${pullRequestId}/diff`;
    const response = await fetch(url, requestOptions);

    //await apiErrorHandler(response);

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch pull-request diff`);
  }
}

export async function getPullRequestDetails(pullRequestId: string) {
  try {
    const headers = new Headers();
    headers.set("Content-type", "application/json");

    const requestOptions = {
      method: "GET",
      headers: headers,
    };

    const url = `${process.env.DEV_TOOLS_API_URL_LOCAL}/pull-req/${pullRequestId}/details`;
    const response = await fetch(url, requestOptions);

    //await apiErrorHandler(response);

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch pull-request diff`);
  }
}

export async function getDiffFileContents(contents_url: string) {
  try {
    const headers = new Headers();
    headers.set("Content-type", "application/");

    const requestOptions = {
      method: "GET",
      headers: headers,
      body: JSON.stringify({ contents_url }),
    };

    const url = `${process.env.DEV_TOOLS_API_URL_LOCAL}/pull-req/diff-file-contents`;
    const response = await fetch(url, requestOptions);
    await apiErrorHandler(response);
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to approve file contents`);
  }
}

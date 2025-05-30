export interface PullRequestProps {
  id: number,
  title: string,
  description: string,
  projectId: number,
  sourceBranch: string,
  targetBranch: string,
  createdAt: string,
  updatedAt: string,
  status: "approved" | "rejected" | "pending",
  remotePullReqId: string
}
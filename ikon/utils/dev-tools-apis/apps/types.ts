export interface AppProps {
  id: number;
  name: string;
  description?: string;
  giteaRepoName: string;
  giteaRepoId: number;
  giteaRepoUrlHttp: string;
  giteaRepoUrlSSH: string;
  createdAt: string;
  updatedAt: string;
}

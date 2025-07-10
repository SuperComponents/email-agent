import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: import.meta.env.VITE_GITHUB_TOKEN,
});

const REPO_OWNER = import.meta.env.VITE_GITHUB_OWNER || 'your-username';
const REPO_NAME = import.meta.env.VITE_GITHUB_REPO || 'email-agent';
const BRANCH = 'master';

export interface GitHubFile {
  path: string;
  content: string;
  message: string;
}

export class GitHubService {
  static async commitFile(file: GitHubFile): Promise<void> {
    try {
      // Get the current file (if it exists) to get the SHA
      let sha: string | undefined;
      try {
        const { data } = await octokit.rest.repos.getContent({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          path: file.path,
          ref: BRANCH,
        });
        
        if ('sha' in data) {
          sha = data.sha;
        }
      } catch {
        // File doesn't exist, that's okay for new files
        console.log('File does not exist, creating new file');
      }

      // Create or update the file
      await octokit.rest.repos.createOrUpdateFileContents({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: file.path,
        message: file.message,
        content: btoa(file.content), // Base64 encode the content
        branch: BRANCH,
        sha: sha, // Required for updates, undefined for new files
      });

      console.log(`Successfully committed ${file.path}`);
    } catch (error) {
      console.error('Error committing to GitHub:', error);
      throw error;
    }
  }

  static async deleteFile(path: string, message: string): Promise<void> {
    try {
      // Get the current file to get the SHA
      const { data } = await octokit.rest.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: path,
        ref: BRANCH,
      });

      if ('sha' in data) {
        await octokit.rest.repos.deleteFile({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          path: path,
          message: message,
          sha: data.sha,
          branch: BRANCH,
        });

        console.log(`Successfully deleted ${path}`);
      }
    } catch (error) {
      console.error('Error deleting file from GitHub:', error);
      throw error;
    }
  }

  static async listFiles(path: string): Promise<string[]> {
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: path,
        ref: BRANCH,
      });

      if (Array.isArray(data)) {
        return data
          .filter(item => item.type === 'file' && item.name.endsWith('.md'))
          .map(item => item.name);
      }

      return [];
    } catch (error) {
      console.error('Error listing files from GitHub:', error);
      return [];
    }
  }

  static async getFileContent(path: string): Promise<string> {
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: path,
        ref: BRANCH,
      });

      if ('content' in data) {
        return atob(data.content);
      }

      throw new Error('File content not found');
    } catch (error) {
      console.error('Error getting file content from GitHub:', error);
      throw error;
    }
  }
} 
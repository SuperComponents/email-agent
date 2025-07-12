import fs from 'fs-extra';
import path from 'path';
import { openai, VectorStore, FileObject } from './openai-client.js';
import { CONFIG } from './config.js';

export class VectorStoreManager {
  private vectorStoreId?: string;

  constructor(vectorStoreId?: string) {
    this.vectorStoreId = vectorStoreId || CONFIG.vectorStore.id;
  }

  async createVectorStore(name: string = 'Knowledge Base'): Promise<string> {
    console.log(`Creating vector store: ${name}`);
    
    const vectorStore = await openai.vectorStores.create({
      name,
      expires_after: {
        anchor: 'last_active_at',
        days: 7
      }
    });

    this.vectorStoreId = vectorStore.id;
    console.log(`Created vector store with ID: ${vectorStore.id}`);
    
    return vectorStore.id;
  }

  async uploadDocuments(): Promise<void> {
    if (!this.vectorStoreId) {
      throw new Error('Vector store ID not set. Create a vector store first.');
    }

    console.log('Finding markdown files...');
    const knowledgeBasePath = path.resolve(CONFIG.knowledgeBase.path);
    const markdownFiles = await this.findMarkdownFiles(knowledgeBasePath);
    
    console.log(`Found ${markdownFiles.length} files to process`);

    const fileIds: string[] = [];
    let fileCount = 0;

    try {
      for (const filePath of markdownFiles) {
        fileCount++;
        console.log(`\nProcessing file ${fileCount}/${markdownFiles.length}: ${path.basename(filePath)}`);
        
        // Process one file at a time to avoid memory issues
        const content = await fs.readFile(filePath, 'utf-8');
        const relativePath = path.relative(knowledgeBasePath, filePath);
        const category = this.extractCategory(relativePath);
        const title = this.extractTitle(content);
        
        // Create simple content with metadata
        const formattedContent = [
          `Source: ${relativePath}`,
          `Category: ${category}`,
          `Title: ${title}`,
          '---',
          '',
          content
        ].join('\n');

        const filename = `${category}_${path.basename(filePath, '.md')}.txt`;
        
        // Create temp file
        const tempDir = path.join(process.cwd(), 'temp');
        await fs.ensureDir(tempDir);
        const tempFilePath = path.join(tempDir, filename);
        await fs.writeFile(tempFilePath, formattedContent, 'utf-8');
        
        console.log(`Uploading: ${filename}`);
        
        // Upload to OpenAI
        const file = await openai.files.create({
          file: fs.createReadStream(tempFilePath),
          purpose: 'assistants',
        });

        fileIds.push(file.id);
        
        // Clean up immediately
        await fs.remove(tempFilePath);
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Add all files to vector store
      console.log(`\nAdding ${fileIds.length} files to vector store...`);
      
      await openai.vectorStores.fileBatches.create(this.vectorStoreId, {
        file_ids: fileIds,
      });

      console.log('Upload completed successfully!');
      
    } catch (error) {
      console.error('Error during upload:', error);
      
      // Clean up uploaded files on error
      console.log('Cleaning up uploaded files...');
      for (const fileId of fileIds) {
        try {
          await openai.files.delete(fileId);
        } catch (deleteError) {
          console.warn(`Failed to delete file ${fileId}:`, deleteError);
        }
      }
      
      throw error;
    } finally {
      // Clean up temp directory
      const tempDir = path.join(process.cwd(), 'temp');
      await fs.remove(tempDir);
    }
  }

  async findMarkdownFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    const entries = await fs.readdir(dir);
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        const subFiles = await this.findMarkdownFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.endsWith('.md')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  private extractCategory(relativePath: string): string {
    const pathParts = relativePath.split(path.sep);
    if (pathParts.length > 1) {
      return pathParts[0];
    }
    return 'general';
  }

  private extractTitle(content: string): string {
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
      return h1Match[1].trim();
    }
    return 'Untitled';
  }

  async searchDocuments(query: string, limit: number = 5): Promise<any[]> {
    if (!this.vectorStoreId) {
      throw new Error('Vector store ID not set');
    }

    try {
      console.log('Searching vector store directly...');
      
      // Use the direct search API (limit parameter not supported)
      const searchResults = await openai.vectorStores.search(this.vectorStoreId, {
        query: query
      });

      console.log(`Found ${searchResults.data.length} results`);

      // Take only the requested number of results
      const limitedResults = searchResults.data.slice(0, limit);

      return limitedResults.map((result, index) => ({
        content: {
          type: 'text',
          text: {
            value: result.content?.[0]?.text || 'No content available'
          }
        },
        metadata: {
          query,
          timestamp: new Date().toISOString(),
          score: result.score,
          filename: result.filename,
          file_id: result.file_id,
          result_index: index
        }
      }));

    } catch (error) {
      console.error('Direct search failed:', error.message);
      throw error; // Don't fallback anymore since direct search works
    }
  }

  async getVectorStoreInfo(): Promise<VectorStore | null> {
    if (!this.vectorStoreId) {
      return null;
    }

    try {
      const vectorStore = await openai.vectorStores.retrieve(this.vectorStoreId);
      return vectorStore as VectorStore;
    } catch (error) {
      console.error('Error retrieving vector store:', error);
      return null;
    }
  }

  async listFiles(): Promise<FileObject[]> {
    if (!this.vectorStoreId) {
      throw new Error('Vector store ID not set');
    }

    const files = await openai.vectorStores.files.list(this.vectorStoreId);
    return files.data as FileObject[];
  }

  async wipeVectorStore(): Promise<void> {
    if (!this.vectorStoreId) {
      throw new Error('Vector store ID not set');
    }

    console.log(`Wiping vector store: ${this.vectorStoreId}`);

    try {
      // List all files in the vector store
      const files = await this.listFiles();
      
      console.log(`Found ${files.length} files to delete`);

      // Delete all files from the vector store
      for (const file of files) {
        try {
          await openai.vectorStores.files.delete(this.vectorStoreId, file.id);
          console.log(`Deleted file: ${file.filename || file.id}`);
        } catch (error) {
          console.warn(`Failed to delete file ${file.id}:`, error);
        }
      }

      console.log('Vector store wiped successfully!');
    } catch (error) {
      console.error('Error wiping vector store:', error);
      throw error;
    }
  }

  async deleteVectorStore(): Promise<void> {
    if (!this.vectorStoreId) {
      throw new Error('Vector store ID not set');
    }

    console.log(`Deleting vector store: ${this.vectorStoreId}`);

    try {
      await openai.vectorStores.delete(this.vectorStoreId);
      console.log('Vector store deleted successfully!');
      this.vectorStoreId = undefined;
    } catch (error) {
      console.error('Error deleting vector store:', error);
      throw error;
    }
  }
}
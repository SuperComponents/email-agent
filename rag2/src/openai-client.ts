import OpenAI from 'openai';
import { CONFIG } from './config.js';

export const openai = new OpenAI({
  apiKey: CONFIG.openai.apiKey,
  project: CONFIG.openai.projectId,
});

// Test OpenAI client
export async function testOpenAIClient(): Promise<boolean> {
  try {
    console.log('Testing OpenAI client...');
    
    // Test basic API access
    const models = await openai.models.list();
    if (models.data.length > 0) {
      console.log('✅ OpenAI API connection successful');
      return true;
    } else {
      console.log('❌ OpenAI API returned no models');
      return false;
    }
  } catch (error) {
    console.log('❌ OpenAI API test failed:', error.message);
    return false;
  }
}

export type VectorStore = {
  id: string;
  name: string;
  file_counts: {
    in_progress: number;
    completed: number;
    failed: number;
    cancelled: number;
    total: number;
  };
  status: 'expired' | 'in_progress' | 'completed';
  created_at: number;
};

export type FileObject = {
  id: string;
  filename: string;
  bytes: number;
  created_at: number;
  purpose: string;
  status: 'uploaded' | 'processed' | 'error';
};
import { tool } from '@openai/agents';
import { OpenAI } from 'openai';
import { db } from '../../db';
import { knowledgeBaseArticles } from '../../db/schema/knowledge-base';
import { sql } from 'drizzle-orm';
import { env } from '../../config/environment';
import { wrapToolWithLogging } from './logging-wrapper';

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

interface RAGSearchParams {
  query: string;
  category?: string;
  limit?: number;
}

async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: env.EMBEDDING_MODEL,
    input: text,
  });
  return response.data[0].embedding;
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

export const ragSearchTool = tool({
  name: 'search_knowledge_base',
  description: 'Search the company knowledge base for relevant help articles and documentation',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query to find relevant knowledge base articles' },
      category: { type: 'string', description: 'Category filter (e.g., billing, technical, general) - pass empty string if not needed' },
      limit: { type: 'number', description: 'Maximum number of articles to return' }
    },
    required: ['query', 'category', 'limit'],
    additionalProperties: false
  },
  execute: wrapToolWithLogging(
    'search_knowledge_base',
    async (input: unknown) => {
      const { query, category, limit = 5 } = input as RAGSearchParams;
      try {
        // Get embedding for the query
        const queryEmbedding = await getEmbedding(query);

        // Get all articles (in production, you'd want to use a vector database)
        let articles = await db.select().from(knowledgeBaseArticles);
        
        if (category && category.trim() !== '') {
          articles = articles.filter(a => a.category === category);
        }

        // Calculate similarities and sort
        const articlesWithScores = articles
          .map(article => {
            if (!article.embedding) return null;
            const embedding = JSON.parse(article.embedding) as number[];
            const similarity = cosineSimilarity(queryEmbedding, embedding);
            return { article, similarity };
          })
          .filter(Boolean)
          .sort((a, b) => b!.similarity - a!.similarity)
          .slice(0, limit);

        return {
          success: true,
          articles: articlesWithScores.map(item => ({
            id: item!.article.id,
            title: item!.article.title,
            content: item!.article.content,
            category: item!.article.category,
            relevanceScore: Math.round(item!.similarity * 100),
          })),
        };
      } catch (error) {
        return {
          success: false,
          error: `Failed to search knowledge base: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    },
    (params: RAGSearchParams) => `Searched knowledge base for: "${params.query}"${params.category ? ` in category ${params.category}` : ''}`
  ),
});
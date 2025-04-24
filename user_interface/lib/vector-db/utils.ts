import { ChromaClient } from 'chromadb';
import fs from 'fs/promises';
import path from 'path';

const COLLECTION_NAME = 'chatbot_context';
const CHROMA_DB_PATH = path.join(process.cwd(), 'data', 'chroma_db');

// Process JSON object recursively and convert to text
function jsonToText(
  obj: Record<string, unknown>,
  parentKey: string = ''
): string[] {
  const texts: string[] = [];

  if (typeof obj === 'object' && obj !== null) {
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          texts.push(`${parentKey} ${index + 1}:`);
          texts.push(
            ...processObject(item as Record<string, unknown>).map(
              (line) => `  ${line}`
            )
          );
        } else {
          texts.push(
            `${parentKey} ${index + 1}: ${String(item).toLowerCase()}`
          );
        }
      });
    } else {
      if (
        (obj as Record<string, unknown>).potions ||
        (obj as Record<string, unknown>).herbs
      ) {
        const items =
          (obj as Record<string, unknown>).potions ||
          (obj as Record<string, unknown>).herbs;
        for (const [key, value] of Object.entries(
          items as Record<string, unknown>
        )) {
          const potionText = [`${key}:`];
          potionText.push(
            ...processObject(value as Record<string, unknown>).map(
              (line) => `  ${line}`
            )
          );
          texts.push(potionText.join('\n'));
        }
      } else {
        texts.push(...processObject(obj as Record<string, unknown>));
      }
    }
  } else {
    texts.push(String(obj).toLowerCase());
  }

  return texts;
}

// Process a single object and convert it to text
function processObject(obj: Record<string, unknown>): string[] {
  const texts: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        texts.push(`${lowerKey}: ${value.join(', ')}`);
      } else {
        texts.push(`${lowerKey}:`);
        texts.push(
          ...processObject(value as Record<string, unknown>).map(
            (line) => `  ${line}`
          )
        );
      }
    } else {
      texts.push(`${lowerKey}: ${String(value).toLowerCase()}`);
    }
  }

  return texts;
}

export class VectorDB {
  private client: ChromaClient;
  private collection: {
    id: string;
    add: (data: {
      ids: string[];
      documents: string[];
      metadatas: Record<string, string | number | boolean>[];
    }) => Promise<void>;
    query: (params: {
      queryTexts: string[];
      nResults: number;
    }) => Promise<{
      documents: string[][];
      metadatas: Record<string, unknown>[][];
    }>;
  } | null = null; // Updated type
  private collectionId: string | null = null;

  constructor() {
    this.client = new ChromaClient({
      path: 'http://localhost:8000',
    });
  }

  async initialize() {
    try {
      // Ensure the chroma_db directory exists
      await fs.mkdir(CHROMA_DB_PATH, { recursive: true });

      // Use getOrCreateCollection instead of createCollection
      this.collection = await this.client.getOrCreateCollection({
        name: COLLECTION_NAME,
        metadata: { 'hnsw:space': 'cosine' },
      });

      this.collectionId = this.collection.id;
      console.log('Initialized collection with ID:', this.collectionId);
    } catch (error) {
      console.error('Error initializing vector database:', error);
      throw error;
    }
  }

  async processJSONFile(filePath: string) {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const jsonData = JSON.parse(fileContent);

      // Convert JSON to text representation
      const texts = Object.entries(jsonData).flatMap(([key, value]) => {
        if (Array.isArray(value)) {
          return jsonToText({ [key]: value }); // Fixed type mismatch
        }
        return jsonToText(value as Record<string, unknown>);
      });

      // Process chunks in batches to avoid memory issues
      const batchSize = 100;
      for (let i = 0; i < texts.length; i += batchSize) {
        const batchTexts = texts.slice(i, i + batchSize);
        const documents = batchTexts;
        const metadatas = batchTexts.map((_, j) => ({
          source: filePath,
          chunk: i + j,
          total_chunks: texts.length,
        }));
        const ids = batchTexts.map(
          (_, j) => `${path.basename(filePath)}_${i + j}`
        );

        await this.collection?.add({
          ids,
          documents,
          metadatas,
        });

        console.log(
          `Processed batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(
            texts.length / batchSize
          )} for ${filePath}`
        );
      }

      console.log(
        `Completed processing ${filePath} with ${texts.length} total chunks`
      );
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
      throw error;
    }
  }

  async getRelevantContext(query: string, k: number = 5) {
    try {
      console.log('Querying for:', query);

      // Ensure collection exists and is properly initialized
      if (!this.collection || !this.collectionId) {
        await this.initialize();
      }

      const results = await this.collection.query({
        queryTexts: [query],
        nResults: k,
      });

      if (!results.documents || results.documents.length === 0) {
        console.log('No documents found in collection');
        return [];
      }

      console.log('Retrieved documents:', results.documents[0]);
      return results.documents[0].map((doc: string, i: number) => ({
        content: doc,
        metadata: results.metadatas[0][i],
      }));
    } catch (error) {
      console.error('Error querying vector database:', error);
      // If there's an error, try to reinitialize the collection
      await this.initialize();
      throw error;
    }
  }
}

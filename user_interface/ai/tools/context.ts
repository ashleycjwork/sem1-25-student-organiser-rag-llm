import { VectorDB } from '@/lib/vector-db/utils';

let vectorDB: VectorDB | null = null;

async function initializeVectorDB() {
  if (!vectorDB) {
    vectorDB = new VectorDB();
    await vectorDB.initialize();
  }
  return vectorDB;
}

export async function getRelevantContext(query: string) {
  try {
    const db = await initializeVectorDB();
    const results = await db.getRelevantContext(query, 5);
    return results.map(r => r.content).join('\n');
  } catch (error) {
    console.error('Error getting relevant context:', error);
    return '';
  }
} 
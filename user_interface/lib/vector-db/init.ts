import { VectorDB } from './utils';
import path from 'path';
import fs from 'fs/promises';

async function initializeVectorDB() {
  const vectorDB = new VectorDB();
  await vectorDB.initialize();

  // Process all JSON files in the data directory
  const dataDir = path.join(process.cwd(), 'data');
  try {
    const files = await fs.readdir(dataDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    for (const file of jsonFiles) {
      const filePath = path.join(dataDir, file);
      await vectorDB.processJSONFile(filePath);
    }

    console.log('Vector database initialized successfully with all JSON files');
  } catch (error) {
    console.error('Error processing JSON files:', error);
  }
}

// Run the initialization
initializeVectorDB().catch(console.error); 
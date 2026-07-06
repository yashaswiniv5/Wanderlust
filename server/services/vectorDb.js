const { Pinecone } = require('@pinecone-database/pinecone');
require('dotenv').config();

const apiKey = process.env.PINECONE_API_KEY;
const indexName = process.env.PINECONE_INDEX || 'quickstart';
const isMock = !apiKey || apiKey === 'your_pinecone_api_key_here';

let pc;
let index;

const initPinecone = async () => {
    if (!isMock) {
        try {
            pc = new Pinecone({ apiKey });
            index = pc.index(indexName);
            console.log("Pinecone Initialized");
        } catch (err) {
            console.error("Pinecone Init Error:", err);
        }
    } else {
        console.log("⚠️ Using MOCK Pinecone (Key missing)");
    }
};

const upsertVectors = async (vectors) => {
    if (isMock) return;
    try {
        await index.upsert(vectors);
    } catch (error) {
        console.error("Error upserting to Pinecone:", error);
    }
};

const queryVectors = async (vector, topK = 5) => {
    if (isMock) {
        // Return random dummy matches if mocking
        return { matches: [] };
    }
    try {
        const queryResponse = await index.query({
            vector,
            topK,
            includeMetadata: true
        });
        return queryResponse;
    } catch (error) {
        console.error("Error querying Pinecone:", error);
        return { matches: [] };
    }
};

const clearVectors = async () => {
    if (isMock) return;
    try {
        await index.deleteAll();
        console.log("Cleared all vectors from Pinecone.");
    } catch (error) {
        console.error("Error clearing Pinecone:", error);
    }
};

const ensureIndex = async () => {
    if (isMock) return;
    try {
        const existingIndexes = await pc.listIndexes();
        const indexExists = existingIndexes.indexes && existingIndexes.indexes.some(idx => idx.name === indexName);

        if (!indexExists) {
            console.log(`Index ${indexName} not found. Creating...`);
            await pc.createIndex({
                name: indexName,
                dimension: 768, // Gemini embedding dimension
                metric: 'cosine',
                spec: {
                    serverless: {
                        cloud: 'aws',
                        region: 'us-east-1'
                    }
                }
            });
            console.log("Index created. Waiting for initialization...");
            // Wait a bit for initialization
            await new Promise(resolve => setTimeout(resolve, 60000));
        } else {
            console.log(`Index ${indexName} already exists.`);
        }
    } catch (error) {
        console.error("Error ensuring index:", error);
    }
};

module.exports = { initPinecone, upsertVectors, queryVectors, clearVectors, ensureIndex, isMock };

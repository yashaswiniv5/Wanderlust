const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const isMock = !apiKey || apiKey === 'your_gemini_api_key_here';

let genAI;
let model;
let embeddingModel;

if (!isMock) {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Faster and more stable model
    embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" }); // Standard embedding model
}

const generateEmbedding = async (text) => {
    if (isMock) {
        console.log("⚠️ Using MOCK Embeddings (Gemini Key missing)");
        return Array(768).fill(0).map(() => Math.random()); // Gemini Text Embedding is 768 dim
    }
    try {
        const result = await embeddingModel.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error("Error generating embedding:", error);
        return [];
    }
};

const generateText = async (prompt, json = false) => {
    if (isMock) {
        console.log("⚠️ Using MOCK Generation (Keys missing)");
        return json ? "{}" : "Mock response";
    }

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        if (json) {
            // Clean up markdown code blocks if present
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            // Verify it parses
            try {
                JSON.parse(text);
            } catch (e) {
                console.warn("Failed to parse JSON from Gemini response, returning raw text or empty JSON");
            }
        }
        return text;
    } catch (error) {
        console.error("Error generating text:", error);
        return json ? "{}" : "Error generating content";
    }
};

const analyzeImage = async (imageBuffer, mimeType) => {
    if (isMock) {
        console.log("⚠️ Using MOCK Image Analysis (Gemini Key missing)");
        return "A beautiful scenic view with a peaceful atmosphere.";
    }
    try {
        const prompt = "Analyze this image and provide a concise visual description emphasizing the 'vibe', atmosphere, and key elements (e.g., 'peaceful mountain temple', 'bustling night market', 'serene beach sunset'). Return only the description.";

        const imagePart = {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error analyzing image:", error);
        return "Error analyzing image atmosphere.";
    }
};

module.exports = { generateEmbedding, generateText, analyzeImage, isMock };

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Destination = require('../models/Destination');
const { generateEmbedding, generateText, isMock } = require('../services/ai');
const { queryVectors } = require('../services/vectorDb');
const mockDestinations = require('../data/mockDestinations');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @route POST /api/itinerary/generate
router.post('/generate', async (req, res) => {
    try {
        const { city, days = 3, preferences } = req.body;

        let candidates = [];

        if (!isDbConnected()) {
            candidates = mockDestinations.filter(d => d.city.toLowerCase() === city.toLowerCase());
            if (candidates.length === 0) candidates = mockDestinations; // Fallback to Kyoto mock
        } else {
            // Real RAG Logic
            const vibeQuery = `${preferences} in ${city}`;
            const embedding = await generateEmbedding(vibeQuery);

            let vectorResults = { matches: [] };
            if (embedding && embedding.length > 0) {
                vectorResults = await queryVectors(embedding, 15);
            } else {
                console.log("⚠️ Embedding generation failed or quota exceeded. Falling back to simple DB search.");
            }

            if (vectorResults.matches && vectorResults.matches.length > 0) {
                const vectorIds = vectorResults.matches.map(m => m.id);
                // Get raw candidates
                let rawCandidates = await Destination.find({ vectorId: { $in: vectorIds } });

                // STEP 1: SMART FILTERING (The "Agent" Step)
                // The user requested a strict "Filtering Assistant" behavior.
                // We use the AI to prune the list before planning.

                const rawContext = rawCandidates.map(c =>
                    JSON.stringify({ name: c.name, city: c.city, type: c.type, description: c.description, rating: c.rating })
                ).join('\n');

                const filterPrompt = `
                You are a filtering assistant for a travel planning system.
                Your task is to select ONLY the relevant places from the given dataset based on user input.

                User Input:
                - Selected Location: ${city}
                - Number of Days: ${days}
                - Travel Vibe: ${preferences}
                
                Dataset to Filter:
                ${rawContext}

                Rules:
                1. Return ONLY places that belong to the selected location (${city}).
                2. Do NOT include places from other cities or regions.
                3. Prefer places that match the selected travel vibe (${preferences}).
                4. Ignore places that are far or unrelated.
                5. Do NOT generate new places.
                6. Do NOT modify place names.
                7. Output must be a clean JSON array of selected places objects.
                
                Return ONLY the filtered places JSON array. No explanations.
                `;

                try {
                    const filterResponse = await generateText(filterPrompt, true);
                    const cleanFilterJson = filterResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                    const filteredPlaces = JSON.parse(cleanFilterJson);

                    if (Array.isArray(filteredPlaces) && filteredPlaces.length > 0) {
                        console.log(`Smart Filter: Refined ${rawCandidates.length} raw candidates down to ${filteredPlaces.length} relevant spots.`);
                        // Use verified filtered list
                        candidates = filteredPlaces;
                    } else {
                        console.log("Smart Filter returned empty or invalid list. Falling back to raw candidates.");
                        candidates = rawCandidates;
                    }
                } catch (filterErr) {
                    console.error("Smart Filter AI Step failed:", filterErr);
                    // Fallback to raw candidates if filter crashes
                    candidates = rawCandidates;
                }
            }

            // Fallback to simple DB search if RAG failed mostly
            if (candidates.length < 3) {
                const extra = await Destination.find({ city: city }).limit(5);
                // Merge without duplicates (by name)
                const existingNames = new Set(candidates.map(c => c.name));
                extra.forEach(e => {
                    if (!existingNames.has(e.name)) {
                        candidates.push(e);
                    }
                });
            }
        }

        let itinerary;

        // Separate Logic: Pure Generation vs RAG Generation
        let prompt = "";

        if (candidates.length === 0) {
            console.log("No specific database matches found. Switching to Generative Mode.");
            prompt = `
            Act as an expert travel planner. Create a ${days}-day itinerary for a trip to ${city}.
            User Preferences: "${preferences}".
            
            Since no specific database locations were found, please suggest popular and suitable locations in ${city} matching the vibe.
            
            IMPORTANT INSTRUCTIONS:
            1. Create a detailed plan with 5 slots per day: Morning, Lunch, Afternoon, Dinner, Evening.
            2. For "Lunch" and "Dinner", you MUST suggestion a SPECIFIC real restaurant name. DO NOT say "Local Restaurant".
            3. For Morning, Afternoon, and Evening, use specific attraction names.
            
            Return the response strictly as valid JSON with this structure:
            {
                "summary": "Brief summary of the trip vibe",
                "days": [
                    {
                        "day": 1,
                        "plan": [
                            { "time": "Morning", "place": "Specific Attraction Name", "note": "Detailed activity description" },
                            { "time": "Lunch", "place": "Specific Restaurant Name", "note": "What to eat here" },
                            { "time": "Afternoon", "place": "Specific Attraction Name", "note": "Detailed activity description" },
                            { "time": "Evening", "place": "Specific Attraction Name", "note": "Detailed activity description" },
                            { "time": "Dinner", "place": "Specific Restaurant Name", "note": "What to eat here" }
                        ]
                    }
                ]
            }
            Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
            `;
        } else {
            console.log(`Found ${candidates.length} candidates. Using RAG Mode.`);
            const candidateContext = candidates.map(c =>
                `- ${c.name} (${c.type}): ${c.description}. Rating: ${c.rating}`
            ).join('\n');

            prompt = `
            Act as an expert travel planner. Create a ${days}-day itinerary for a trip to ${city}.
            User Preferences: "${preferences}".
            
            Use the following Available Locations from our database if they match the vibe:
            ${candidateContext}

            IMPORTANT INSTRUCTIONS:
            1. Create a detailed plan with 5 slots per day: Morning, Lunch, Afternoon, Dinner, Evening.
            2. For "Lunch" and "Dinner", you MUST suggested a SPECIFIC real restaurant name that exists in ${city}. DO NOT say "Local Restaurant" or "5 Star Restaurant". Give the actual name (e.g., "Hotel Haritha", "Spice Garden", etc.).
            3. For Morning, Afternoon, and Evening, use specific attraction names from the defined list or other famous spots.
            4. Do not use generic terms like "Relax at the beach" as the Place Name. Use "Perupalem Beach" instead.
            
            Return the response strictly as valid JSON with this structure:
            {
                "summary": "Brief summary of the trip vibe",
                "days": [
                    {
                        "day": 1,
                        "plan": [
                            { "time": "Morning", "place": "Specific Attraction Name", "note": "Detailed activity description" },
                            { "time": "Lunch", "place": "Specific Restaurant Name", "note": "What to eat here" },
                            { "time": "Afternoon", "place": "Specific Attraction Name", "note": "Detailed activity description" },
                            { "time": "Evening", "place": "Specific Attraction Name", "note": "Detailed activity description" },
                            { "time": "Dinner", "place": "Specific Restaurant Name", "note": "What to eat here" }
                        ]
                    }
                ]
            }
            Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
            `;
        }

        try {
            const aiResponse = await generateText(prompt, true);
            // Extra cleaning just in case
            const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            itinerary = JSON.parse(cleanJson);

            // Validate structure
            if (!itinerary.days || !Array.isArray(itinerary.days) || itinerary.days.length === 0) {
                throw new Error("Invalid AI response structure");
            }
        } catch (err) {
            console.error("AI Generation failed or returned invalid JSON, falling back to simple logic", err);

            // Fallback Logic ensuring valid structure
            itinerary = {
                summary: `A filtered list of top spots in ${city}. (AI Generation Unavailable)`,
                days: []
            };

            if (candidates.length > 0) {
                // Distribute candidates across days
                let candidateIndex = 0;
                for (let i = 1; i <= days; i++) {
                    const dayPlan = [];

                    // Morning
                    if (candidateIndex < candidates.length) {
                        dayPlan.push({ time: "Morning", place: candidates[candidateIndex].name, note: candidates[candidateIndex].description });
                        candidateIndex++;
                    } else {
                        dayPlan.push({ time: "Morning", place: `Explore ${city}`, note: "Visit local landmarks." });
                    }

                    // Lunch - Generic Fallback if no specific restaurant logic
                    dayPlan.push({ time: "Lunch", place: "Local Restaurant", note: "Enjoy authentic local cuisine." });

                    // Afternoon
                    if (candidateIndex < candidates.length) {
                        dayPlan.push({ time: "Afternoon", place: candidates[candidateIndex].name, note: candidates[candidateIndex].description });
                        candidateIndex++;
                    } else {
                        dayPlan.push({ time: "Afternoon", place: "City Park", note: "Relax and enjoy nature." });
                    }

                    // Evening
                    if (candidateIndex < candidates.length) {
                        dayPlan.push({ time: "Evening", place: candidates[candidateIndex].name, note: candidates[candidateIndex].description });
                        candidateIndex++;
                    } else {
                        dayPlan.push({ time: "Evening", place: "Sunset View", note: "Watch the sunset at a scenic spot." });
                    }

                    // Dinner
                    dayPlan.push({ time: "Dinner", place: "City Center Dining", note: "Dinner at a popular local spot." });

                    itinerary.days.push({ day: i, plan: dayPlan });
                }
            } else {
                // Total Fallback: No RAG matches AND AI failed.
                itinerary.summary = `Welcome to ${city}! (AI Generation Offline)`;
                for (let i = 1; i <= days; i++) {
                    itinerary.days.push({
                        day: i,
                        plan: [
                            { time: "Morning", place: `Explore ${city} Center`, note: "Visit the main landmarks and city square." },
                            { time: "Lunch", place: "Local Eatery", note: "Try famous local dishes." },
                            { time: "Afternoon", place: "Local Market", note: "Shop for souvenirs and local crafts." },
                            { time: "Evening", place: "City Walk", note: "Enjoy a peaceful evening walk." },
                            { time: "Dinner", place: "Popular Restaurant", note: "Dinner with a view." }
                        ]
                    });
                }
            }
        }

        res.json(itinerary);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route POST /api/itinerary/packing
router.post('/packing', async (req, res) => {
    // Static / Logic-based response (No AI)
    const { city, season } = req.body;

    const baseItems = {
        clothing: ["Comfortable walking shoes", "Light jacket", "Casual outfits"],
        essentials: ["Passport/ID", "Phone charger", "Power bank", "Cash (Local Currency)"],
        accessories: ["Sunglasses", "Daypack", "Water bottle"]
    };

    if (season === "Winter" || season === "Autumn") {
        baseItems.clothing.push("Warm coat", "Scarf", "Gloves");
    } else {
        baseItems.clothing.push("Hat", "Sunscreen", "Light layers");
    }

    res.json(baseItems);
});

// @route POST /api/itinerary/culture
router.post('/culture', async (req, res) => {
    // Static response
    res.json({
        dos: ["Bow lightly when greeting", "Remove shoes when entering homes/temples", "Keep voice down in public"],
        donts: ["Don't tip (service is included)", "Don't eat or drink while walking", "Don't talk loudly on the phone on trains"]
    });
});

module.exports = router;

const mongoose = require('mongoose');
const Destination = require('../models/Destination');
const { generateEmbedding } = require('../services/ai');
const { initPinecone, upsertVectors, clearVectors, ensureIndex } = require('../services/vectorDb');
const connectDB = require('../config/db');
require('dotenv').config();

const andhraDestinations = [
    {
        name: "Dwaraka Tirumala Temple",
        city: "Dwaraka Tirumala",
        country: "India",
        type: "Temple",
        rating: 4.8,
        priceTier: "Free",
        openingHours: "6:00 AM - 9:00 PM",
        description: "Known as Chinna Tirupati, this renowned pilgrimage site is dedicated to Lord Venkateswara and attracts devotees with its rich history and stunning architecture.",
        reviews: ["Divine atmosphere.", "Very well maintained.", "Peaceful darshan."],
        isHiddenGem: false,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Dwaraka_Tirumala_Temple_Gopuram.jpg"
    },
    {
        name: "Kolleru Lake",
        city: "Eluru",
        country: "India",
        type: "Nature",
        rating: 4.6,
        priceTier: "Free",
        openingHours: "24 Hours",
        description: "One of India's largest freshwater lakes and a designated bird sanctuary. A paradise for birdwatching enthusiasts supporting diverse flora and fauna.",
        reviews: ["Great for bird watching.", "Beautiful nature.", "Best visited in winter."],
        isHiddenGem: false,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Kolleru_Lake_Eluru.jpg/1280px-Kolleru_Lake_Eluru.jpg"
    },
    {
        name: "Perupalem Beach",
        city: "Mogalthur",
        country: "India",
        type: "Beach",
        rating: 4.5,
        priceTier: "Free",
        openingHours: "24 Hours",
        description: "A serene coastal destination known for its golden sandy beach, swaying palm trees, and peaceful ambiance. Ideal for relaxation and scenic photography.",
        reviews: ["Clean beach.", "Nice place for family.", "Beautiful sunrise."],
        isHiddenGem: true,
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
    },
    {
        name: "Ksheera Ramalingeswara Swamy Temple",
        city: "Palakollu",
        country: "India",
        type: "Temple",
        rating: 4.7,
        priceTier: "Free",
        openingHours: "5:30 AM - 8:30 PM",
        description: "One of the five holy Pancharama Kshetras dedicated to Lord Shiva. Known for its towering Gopuram and architectural beauty.",
        reviews: ["Ancient temple.", "Powerful vibration.", "Architectural marvel."],
        isHiddenGem: false,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Ksheerarama_Temple_Gopuram.jpg"
    },
    {
        name: "Polavaram Project",
        city: "Polavaram",
        country: "India",
        type: "Landmark",
        rating: 4.5,
        priceTier: "Free",
        openingHours: "9:00 AM - 5:00 PM",
        description: "A significant engineering marvel on the Godavari River. Visitors come to see the grand scale of the irrigation project and the spillway.",
        reviews: ["Massive structure.", "Engineering wonder.", "Good view point."],
        isHiddenGem: false,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Polavaram_Project_Spillway_Works.jpg/1280px-Polavaram_Project_Spillway_Works.jpg"
    },
    {
        name: "Eluru Buddha Park",
        city: "Eluru",
        country: "India",
        type: "Park",
        rating: 4.4,
        priceTier: "$",
        openingHours: "10:00 AM - 8:00 PM",
        description: "Features a magnificent 74-foot tall statue of Lord Buddha in the middle of a pond. A peaceful place for walking and relaxing.",
        reviews: ["Huge statue.", "Nice park for evening.", "Calm and quiet."],
        isHiddenGem: false,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Buddha_Statue_at_Eluru.jpg/800px-Buddha_Statue_at_Eluru.jpg"
    },
    {
        name: "Sri Someswara Janardhana Swamy Temple",
        city: "Bhimavaram",
        country: "India",
        type: "Temple",
        rating: 4.7,
        priceTier: "Free",
        openingHours: "5:00 AM - 8:00 PM",
        description: "A spiritual hub dedicated to Lord Shiva and one of the Pancharama temples. The Shiva Lingam here is known to change color according to the lunar phase.",
        reviews: ["Must visit for Shiva devotees.", "Unique phenomenon.", "Divine place."],
        isHiddenGem: false,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Someswara_Temple_Bhimavaram.jpg/1024px-Someswara_Temple_Bhimavaram.jpg"
    },
    {
        name: "Pattiseema",
        city: "Polavaram",
        country: "India",
        type: "Nature",
        rating: 4.6,
        priceTier: "Free",
        openingHours: "6:00 AM - 7:00 PM",
        description: "Scenic beauty known for the Sri Veerabhadra Swamy Temple situated on the Devakuta Parvatha hillock in the middle of the Godavari river.",
        reviews: ["Scenic boat ride.", "Beautiful temple location.", "Nature and devotion."],
        isHiddenGem: true,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Pattiseema_Temple_View.jpg/1280px-Pattiseema_Temple_View.jpg"
    },
    {
        name: "Kovvur Goshpada Kshetram",
        city: "Kovvur",
        country: "India",
        type: "Temple",
        rating: 4.5,
        priceTier: "Free",
        openingHours: "6:00 AM - 8:00 PM",
        description: "Located on the banks of Godavari, this is a holy spot where it is believed a cow worshiped Lord Shiva. Great view of the rail-cum-road bridge.",
        reviews: ["Holy ghats.", "Great river view.", "Spiritual experience."],
        isHiddenGem: false,
        imageUrl: "https://lh3.googleusercontent.com/p/AF1QipN-zF-R-x-X-x-X-x-X-x-X.jpg"
    },
    {
        name: "Sri Vasavi Kanyaka Parameswari Temple",
        city: "Penugonda",
        country: "India",
        type: "Temple",
        rating: 4.8,
        priceTier: "Free",
        openingHours: "6:00 AM - 9:00 PM",
        description: "A fascinating temple with a multi-colored, seven-storied tower. Considered the 'Kasi of Vysyas' and a place of great architectural diligence.",
        reviews: ["Stunning architecture.", "Very clean and organized.", "Spiritual center."],
        isHiddenGem: false,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Penugonda_Vasavi_Temple.jpg/800px-Penugonda_Vasavi_Temple.jpg"
    },
    // --- HIDDEN GEMS ---
    {
        name: "Gandikota",
        city: "Kadapa",
        country: "India",
        type: "Canyon",
        rating: 4.7,
        priceTier: "Free",
        openingHours: "24 Hours",
        description: "Known as the 'Grand Canyon of India', Gandikota features a spectacular gorge formed by the Penna River and an ancient fort.",
        reviews: ["Breathtaking views.", "Best for camping.", "Historical fort."],
        isHiddenGem: true,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Gandikota_Canyon.jpg/1280px-Gandikota_Canyon.jpg"
    },
    {
        name: "Belum Caves",
        city: "Kurnool",
        country: "India",
        type: "Cave",
        rating: 4.6,
        priceTier: "$",
        openingHours: "10:00 AM - 5:00 PM",
        description: "The second longest cave system in India, known for its unique stalactite and stalagmite formations.",
        reviews: ["Amazing natural wonder.", "Underground adventure.", "Well maintained."],
        isHiddenGem: true,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Belum_Caves_Inside_View.jpg/1280px-Belum_Caves_Inside_View.jpg"
    },
    {
        name: "Lambasingi",
        city: "Visakhapatnam",
        country: "India",
        type: "Hill Station",
        rating: 4.5,
        priceTier: "Free",
        openingHours: "24 Hours",
        description: "Often called the 'Kashmir of Andhra Pradesh', it is the only place in the state that receives snowfall-like conditions in winter.",
        reviews: ["Chilly weather.", "Beautiful strawberry farms.", "Misty mornings."],
        isHiddenGem: true,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Lambasingi_Morning_Mist.jpg/1280px-Lambasingi_Morning_Mist.jpg"
    },
    {
        name: "Coringa Wildlife Sanctuary",
        city: "Kakinada",
        country: "India",
        type: "Nature",
        rating: 4.6,
        priceTier: "$",
        openingHours: "9:00 AM - 5:00 PM",
        description: "The second largest mangrove forest in India, home to diverse bird species and the critically endangered white-backed vulture.",
        reviews: ["Great boat ride.", "Mangrove forest walk.", "Bird watching paradise."],
        isHiddenGem: true,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Coringa_Mangroves_Boardwalk.jpg/1280px-Coringa_Mangroves_Boardwalk.jpg"
    },
    {
        name: "Yaganti",
        city: "Kurnool",
        country: "India",
        type: "Temple",
        rating: 4.8,
        priceTier: "Free",
        openingHours: "6:00 AM - 8:00 PM",
        description: "Famous for the growing Nandi idol and natural caves where saints meditated. A place of mystery and devotion.",
        reviews: ["Growing Nandi is a miracle.", "Peaceful location.", "Historical caves."],
        isHiddenGem: true,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Yaganti_Temple_Complex.jpg/1280px-Yaganti_Temple_Complex.jpg"
    },
    {
        name: "Lepakshi",
        city: "Anantapur",
        country: "India",
        type: "Historical",
        rating: 4.7,
        priceTier: "Free",
        openingHours: "6:00 AM - 6:00 PM",
        description: "Home to the Veerabhadra Temple with its famous hanging pillar and a colossal Nandi statue carved from a single block of stone.",
        reviews: ["Architectural masterpiece.", "Hanging pillar mystery.", "Huge Nandi statue."],
        isHiddenGem: true,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Lepakshi_Nandi.jpg/1280px-Lepakshi_Nandi.jpg"
    },
    {
        name: "Ethipothala Waterfalls",
        city: "Nagarjuna Sagar",
        country: "India",
        type: "Waterfall",
        rating: 4.4,
        priceTier: "$",
        openingHours: "6:30 AM - 9:00 PM",
        description: "A stunning 70-foot high waterfall formed by the combination of three streams, offering a scenic view and crocodile breeding center.",
        reviews: ["Beautiful waterfall.", "Nice evening view.", "Crocodile park is cool."],
        isHiddenGem: true,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Ethipothala_Falls.jpg/1280px-Ethipothala_Falls.jpg"
    },
    {
        name: "Maredumilli",
        city: "East Godavari",
        country: "India",
        type: "Forest",
        rating: 4.6,
        priceTier: "Free",
        openingHours: "24 Hours",
        description: "A dense forest area known for its biodiversity, waterfalls, and eco-tourism projects. Famous for bamboo chicken.",
        reviews: ["Dense jungle experience.", "Bamboo chicken is tasty.", "Waterfalls are refreshing."],
        isHiddenGem: true,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Maredumilli_Forest_Road.jpg/1280px-Maredumilli_Forest_Road.jpg"
    },
    {
        name: "Horsley Hills",
        city: "Chittoor",
        country: "India",
        type: "Hill Station",
        rating: 4.3,
        priceTier: "Free",
        openingHours: "24 Hours",
        description: "A scenic hill station known as the 'Ooty of Andhra'. Offers pleasant weather, viewpoints, and the world's largest Banyan tree nearby.",
        reviews: ["Relaxing weekend getaway.", "Good viewpoints.", "Pleasant climate."],
        isHiddenGem: true,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Horsley_Hills_Viewpoint.jpg/1280px-Horsley_Hills_Viewpoint.jpg"
    },
    {
        name: "Konaseema",
        city: "East Godavari",
        country: "India",
        type: "Nature",
        rating: 4.7,
        priceTier: "Free",
        openingHours: "24 Hours",
        description: "A delta region known for its lush green coconut groves, paddy fields, and backwaters, resembling the beauty of Kerala.",
        reviews: ["Lush greenery.", "Beautiful backwaters.", "Culture and food."],
        isHiddenGem: true,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Konaseema_Greenery.jpg/1280px-Konaseema_Greenery.jpg"
    },
    // --- POPULAR PLACES ---
    {
        name: "Tirumala Tirupati Devasthanams",
        city: "Tirumala",
        country: "India",
        type: "Temple",
        rating: 4.9,
        priceTier: "Free",
        openingHours: "3:00 AM - 1:00 AM",
        description: "The richest temple in the world dedicated to Lord Venkateswara. Situated on seven hills, it attracts millions of pilgrims annually.",
        reviews: ["Divine energy.", "Very crowded but worth it.", "Best laddu prasadam."],
        isHiddenGem: false,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Tirumala_090615.jpg/1280px-Tirumala_090615.jpg"
    },
    {
        name: "RK Beach",
        city: "Visakhapatnam",
        country: "India",
        type: "Beach",
        rating: 4.6,
        priceTier: "Free",
        openingHours: "24 Hours",
        description: "Ramakrishna Beach is a popular hangout spot known for the submarine museum, Kali temple, and vibrant street food culture.",
        reviews: ["Great evening walk.", "Submarine museum is must.", "Crowded but lively."],
        isHiddenGem: false,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Ramakrishna_Beach_Vizag.jpg/1280px-Ramakrishna_Beach_Vizag.jpg"
    },
    {
        name: "Kanaka Durga Temple",
        city: "Vijayawada",
        country: "India",
        type: "Temple",
        rating: 4.8,
        priceTier: "Free",
        openingHours: "4:00 AM - 9:00 PM",
        description: "Situated on Indrakeeladri hill, this temple is dedicated to Goddess Durga. The Dasara festival here is celebrated with great pomp.",
        reviews: ["Powerful goddess.", "Great view of city.", "Dasara celebrations are grand."],
        isHiddenGem: false,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Vijayawada_Kanaka_Durga_Temple.jpg/1280px-Vijayawada_Kanaka_Durga_Temple.jpg"
    },
    {
        name: "Srisailam",
        city: "Kurnool",
        country: "India",
        type: "Temple",
        rating: 4.7,
        priceTier: "Free",
        openingHours: "4:30 AM - 10:00 PM",
        description: "Home to the Mallikarjuna Jyotirlinga and Bhramaramba Shakti Peetham. Located in the Nallamala hills near the Krishna river dam.",
        reviews: ["Jyotirlinga and Shaktipeeth.", "Scenic drive.", "Spiritual vibes."],
        isHiddenGem: false,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Srisailam_Temple_Main_Gopuram.jpg/1280px-Srisailam_Temple_Main_Gopuram.jpg"
    },
    {
        name: "Simhachalam Temple",
        city: "Visakhapatnam",
        country: "India",
        type: "Temple",
        rating: 4.7,
        priceTier: "Free",
        openingHours: "7:00 AM - 9:00 PM",
        description: "Dedicated to Lord Narasimha, the idol is covered in sandalwood paste year-round, revealing its true form only on Akshaya Tritiya.",
        reviews: ["Beautiful architecture.", "Hilltop temple.", "Peaceful atmosphere."],
        isHiddenGem: false,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Simhachalam_Temple_Gopuram.jpg/1280px-Simhachalam_Temple_Gopuram.jpg"
    },
    {
        name: "Araku Valley",
        city: "Visakhapatnam",
        country: "India",
        type: "Hill Station",
        rating: 4.5,
        priceTier: "Free",
        openingHours: "24 Hours",
        description: "A bustling hill station famous for its coffee plantations, tribal culture, and the scenic train journey through tunnels.",
        reviews: ["Coffee is amazing.", "Tribal museum is good.", "Train journey is best."],
        isHiddenGem: false,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Araku_Valley_View.jpg/1280px-Araku_Valley_View.jpg"
    },
    {
        name: "Kailasagiri",
        city: "Visakhapatnam",
        country: "India",
        type: "Park",
        rating: 4.6,
        priceTier: "$",
        openingHours: "10:00 AM - 8:00 PM",
        description: "A hilltop park offering panoramic views of the sea and city. Features huge Shiva-Parvati statues and a ropeway ride.",
        reviews: ["Best view of Vizag.", "Ropeway is fun.", "Relaxing park."],
        isHiddenGem: false,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Kailasagiri_Shiva_Parvati.jpg/1280px-Kailasagiri_Shiva_Parvati.jpg"
    },
    {
        name: "Sri Kalahasti Temple",
        city: "Chittoor",
        country: "India",
        type: "Temple",
        rating: 4.7,
        priceTier: "Free",
        openingHours: "6:00 AM - 9:00 PM",
        description: "One of the Panchabhoota Sthalams representing the element of Air (Vayu). Known for its Rahu-Ketu Pooja.",
        reviews: ["Ancient architecture.", "Vayu lingam.", "Powerful poojas."],
        isHiddenGem: false,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Srikalahasti_Temple_Gopuram.jpg/1280px-Srikalahasti_Temple_Gopuram.jpg"
    },
    {
        name: "Undavalli Caves",
        city: "Vijayawada",
        country: "India",
        type: "Historical",
        rating: 4.4,
        priceTier: "$",
        openingHours: "9:00 AM - 6:00 PM",
        description: "Rock-cut caves from the 4th century featuring a monolithic statue of Lord Vishnu in a reclining posture.",
        reviews: ["History buffs love it.", "Great rock carvings.", "Good view from top."],
        isHiddenGem: false,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Undavalli_Caves.jpg/1280px-Undavalli_Caves.jpg"
    },
    {
        name: "Borra Caves",
        city: "Visakhapatnam",
        country: "India",
        type: "Cave",
        rating: 4.5,
        priceTier: "$",
        openingHours: "10:00 AM - 5:00 PM",
        description: "Million-year-old limestone caves with spectacular stalactite and stalagmite formations, illuminated by colorful lights.",
        reviews: ["Colorful caves.", "Natural wonder.", "Train ride to reach is good."],
        isHiddenGem: false,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Borra_Caves_Lights.jpg/1280px-Borra_Caves_Lights.jpg"
    }
];

// Fallback to a nice placeholder if specific images are broken or 403
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1582510003544-4d00b7853848?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";

const seedData = async () => {
    try {
        await connectDB();
        await initPinecone();
        await ensureIndex();

        // Clear existing data
        await Destination.deleteMany({});
        console.log("MongoDB Destination collection cleared.");

        await clearVectors();

        const pineconeCodeRecords = [];

        // 60 seconds delay to avoid rate limiting
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

        console.log("Starting to process locations...");
        for (const dest of andhraDestinations) {
            console.log(`Processing ${dest.name}...`);
            // Delay before requesting embedding
            await delay(10000);

            // Generate Text for Embedding
            const textToEmbed = `${dest.name} ${dest.description} ${dest.type} in ${dest.city}. ${dest.rating} stars. ${dest.reviews.join(" ")}`;

            // Base delay
            await delay(2000);

            let embedding = [];
            let retries = 0;
            const MAX_RETRIES = 3;

            while (retries <= MAX_RETRIES) {
                try {
                    embedding = await generateEmbedding(textToEmbed);
                    if (embedding && embedding.length > 0) {
                        break; // Success
                    }
                } catch (err) {
                    // Ignore, checks below
                }

                if (retries < MAX_RETRIES) {
                    console.log(`Embedding failed (likely rate limit). Retrying in 60s (Attempt ${retries + 1}/${MAX_RETRIES})...`);
                    await delay(60000);
                } else {
                    console.error(`Failed to generate embedding for ${dest.name} after retries.`);
                }
                retries++;
            }

            // Create Mongo Doc
            const newDest = new Destination({
                ...dest,
                // Ensure imageUrl is set, fallback if needed
                imageUrl: dest.imageUrl || PLACEHOLDER_IMAGE,
                vectorId: `dest_${Date.now()}_${Math.random().toString(36).substring(7)}`
            });

            await newDest.save();
            console.log(`Saved ${dest.name} to MongoDB`);

            if (embedding && embedding.length > 0) {
                pineconeCodeRecords.push({
                    id: newDest.vectorId,
                    values: embedding,
                    metadata: {
                        mongoId: newDest._id.toString(),
                        name: newDest.name,
                        city: newDest.city,
                        description: dest.description
                    }
                });
            }
        }

        // Upsert to Pinecone (Batch)
        if (pineconeCodeRecords.length > 0) {
            console.log(`Upserting ${pineconeCodeRecords.length} vectors to Pinecone...`);
            await upsertVectors(pineconeCodeRecords);
        }

        console.log("Seeding Complete!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seedData();

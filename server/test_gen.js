const testGen = async () => {
    try {
        const res = await fetch('http://localhost:5000/api/itinerary/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                city: 'Dwaraka Tirumala',
                days: 1,
                preferences: 'temple'
            })
        });
        console.log("Status:", res.status);
        const data = await res.json();
        console.log("Data:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
};

testGen();

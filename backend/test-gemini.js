const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function checkModels() {
    try {
        // Need to use the SDK's model manager if available, or just fetch the URL directly since the SDK might abstract it.
        // Actually, the JS SDK doesn't expose listModels directly on the main instance easily in all versions.
        // Let's use a REST call to look under the hood if the SDK fails us, but first let's see if we can find a working model blindly.

        console.log("Checking gemini-1.5-pro-latest...");
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
            const result = await model.generateContent("Hi");
            console.log("Success with gemini-1.5-pro-latest");
            return;
        } catch (e) { console.log("Failed gemini-1.5-pro-latest"); }

        console.log("Checking gemini-pro-vision...");
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
            // gemini-pro-vision requires image usually, text only might fail or work.
            const result = await model.generateContent("Hi");
            console.log("Success with gemini-pro-vision");
            return;
        } catch (e) { console.log("Failed gemini-pro-vision: " + e.message); }

        // Try to fetch via raw fetch to see list
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

        console.log("Fetching models list via REST...");
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("Could not list models. Response:", data);
        }

    } catch (error) {
        console.error("Script error:", error);
    }
}

checkModels();

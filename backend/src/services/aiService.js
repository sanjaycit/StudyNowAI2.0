const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);



const generateRoadmap = async (topicName, subjectName, difficulty) => {
    console.log(`[AI Service] generateRoadmap called for: Topic="${topicName}", Subject="${subjectName}", Difficulty="${difficulty}"`);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Create a structured study roadmap for the topic "${topicName}" in the subject "${subjectName}". 
        The difficulty level is "${difficulty}".
        
        The output must be a valid JSON array of objects, where each object represents a step in the roadmap.
        Each object should have the following properties:
        - "title": A short title for the step.
        - "description": A brief description of what to study in this step.
        
        Example format:
        [
            { "title": "Introduction", "description": "Overview of the basic concepts..." },
            { "title": "Key Principles", "description": "Deep dive into..." }
        ]
        
        Do not include any markdown formatting (like \`\`\`json). Just return the raw JSON string.`;

        console.log("[AI Service] Sending prompt to Gemini...");
        const result = await model.generateContent(prompt);
        console.log("[AI Service] Response received from Gemini.");

        const response = await result.response;
        const text = response.text();
        console.log("[AI Service] Raw text response:", text);

        // Clean up text if it contains markdown code blocks
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        console.log("[AI Service] Cleaned text:", cleanedText);

        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("AI Generation Error:", error);
        throw new Error("Failed to generate roadmap via Gemini");
    }
};

const generateStepResources = async (stepTitle, topicName, subjectName) => {
    console.log(`[AI Service] generateStepResources called for: Step="${stepTitle}", Topic="${topicName}"`);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Find 5 high-quality learning resources for the specific step "${stepTitle}" which is part of learning "${topicName}" in the subject "${subjectName}".
        
        Provide a variety of resources (Articles, YouTube Videos, Documentation, Interactive Tutorials).
        
        For each resource, provide:
        - "title": The title of the resource.
        - "type": "Article", "Video", "Documentation", or "Course".
        - "description": A very brief 1-sentence reason why this is good.
        - "relevance": A number between 80 and 99 representing the percentage recommendation score (e.g. 95).
        - "url": A specific valid URL if you are certain it exists (like a specific MDN page, Youtube video, or Wikipedia article). If you are not 100% sure of the exact deep-link, provide the main domain or set to null.
        
        Output must be a valid JSON array of objects. Do not include markdown formatting.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        console.log("[AI Service] Resources generated");

        let parsed = JSON.parse(cleanedText);

        // Handle case where AI returns a stringified JSON (double encoded)
        if (typeof parsed === 'string') {
            console.log("[AI Service] Parsed result is a string, attempting to parse again...");
            try {
                parsed = JSON.parse(parsed);
            } catch (e) {
                console.warn("[AI Service] Second parse failed, returning empty array.");
                return [];
            }
        }

        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("AI Resources Generation Error:", error);
        // Fallback or rethrow
        return [];
    }
};

module.exports = {
    generateRoadmap,
    generateStepResources
};

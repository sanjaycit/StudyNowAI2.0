const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);



const generateRoadmap = async (topicName, subjectName, difficulty) => {
    console.log(`[AI Service] generateRoadmap called for: Topic="${topicName}", Subject="${subjectName}", Difficulty="${difficulty}"`);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });

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

module.exports = {
    generateRoadmap,
};

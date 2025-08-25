import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { text, context, question } = await request.json();

    if (!text) {
        return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "Google API key not configured" }, { status: 500 });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const userPrompt = question
            ? "A user has a specific question about a highlighted section of a research paper. Answer the following question based on the provided text and context."
            : "A user has highlighted a section of a research paper and needs help understanding it. Explain the following highlighted text in a clear and concise way, assuming the user is a beginner in the field.";

        const prompt = `
You are an expert research assistant. ${userPrompt}

**User's Question:**
---
${question || "Not provided. Please provide a general explanation of the highlighted text."}
---

**Highlighted Text:**
---
${text}
---

**Full Context from the page:**
---
${context || "No additional context was provided."}
---

Answer:
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const explanation = response.text();

        return NextResponse.json({ explanation });
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return NextResponse.json({ error: "Failed to get explanation from AI" }, { status: 500 });
    }
}

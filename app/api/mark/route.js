import OpenAI from "openai";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import { NextResponse } from "next/server";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
    try {
        const formData = await req.formData();

        // Extract metadata
        const studentLevel = formData.get("studentLevel");
        const subject = formData.get("subject");
        const topic = formData.get("topic");
        const mode = formData.get("mode");

        // Extract images
        const workbookFiles = formData.getAll("workbookFiles");
        const answerKeyFiles = formData.getAll("answerKeyFiles");

        if (!workbookFiles || workbookFiles.length === 0) {
            return NextResponse.json({ error: "No workbook pages uploaded." }, { status: 400 });
        }

        if (!process.env.OPENAI_API_KEY) {
            console.error("OPENAI_API_KEY is missing");
            return NextResponse.json({ error: "Server misconfiguration: API Key missing." }, { status: 500 });
        }

        // Helper to process files into OpenAI image_url objects
        const fileToMesssageContent = async (file) => {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64 = buffer.toString("base64");
            // Assuming images are jpeg or png usually. We can grab type from file.type
            const mimeType = file.type || "image/jpeg";
            return {
                type: "image_url",
                image_url: {
                    url: `data:${mimeType};base64,${base64}`,
                    detail: "high"
                },
            };
        };

        const workbookImages = await Promise.all(workbookFiles.map(fileToMesssageContent));
        const answerKeyImages = await Promise.all(answerKeyFiles.map(fileToMesssageContent));

        const userMessageContent = [
            {
                type: "text",
                text: `Context: Student Level: ${studentLevel}, Subject: ${subject}, Topic: ${topic || "Unknown"}. Mode: ${mode}. \n\nPlease mark these pages used the provided system instructions.`
            },
            ...workbookImages,
            // If answer keys exist, label them
            ...(answerKeyImages.length > 0 ? [
                { type: "text", text: "--- The following images are the Answer Keys / Marking Scheme ---" },
                ...answerKeyImages
            ] : [])
        ];

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userMessageContent }
            ],
            temperature: 0.4,
        });

        const text = response.choices[0].message.content;

        return NextResponse.json({ result: text });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Failed to process request." }, { status: 500 });
    }
}

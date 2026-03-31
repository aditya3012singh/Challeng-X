import { GoogleGenerativeAI } from "@google/generative-ai";
import env from "../config/env.js";
import logger from "../utils/logger.js";

class AIService {
    constructor() {
        this.genAI = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;
    }

    async generateHint(problem, currentCode, language) {
        if (!this.genAI) {
            throw new Error("AI Service is not configured (Missing API Key)");
        }

        const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are "Cyber-Mentor", a professional coding assistant for the ChallegX platform.
            Your goal is to provide a helpful, concise hint to a user who is stuck on a programming problem.
            
            PROBLEM TITLE: ${problem.title}
            PROBLEM DESCRIPTION: ${problem.description}
            USER'S CURRENT CODE (${language}):
            \`\`\`${language}
            ${currentCode}
            \`\`\`

            INSTRUCTIONS:
            1. DO NOT provide the complete solution or code.
            2. Identify the logical hurdle the user might be facing based on their code.
            3. Provide a hint that nudges them toward the right data structure, algorithm, or edge case they might have missed.
            4. Keep the tone professional, encouraging, and "cyber-themed".
            5. Return the response in small, readable paragraphs.
            
            Return ONLY the hint text.
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            logger.error("AI Hint Generation Error:", error);
            throw new Error("Failed to generate AI hint");
        }
    }

    async generateReview(problem, finalCode, language, result) {
        if (!this.genAI) {
            throw new Error("AI Service is not configured (Missing API Key)");
        }

        const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are "Code Surgeon", an elite code optimization scanner for ChallegX.
            The user has just completed a challenge. Provide a brief "Medical Report" on their code.
            
            PROBLEM: ${problem.title}
            RESULT: ${result} (e.g., Success/Failure)
            CODE (${language}):
            \`\`\`${language}
            ${finalCode}
            \`\`\`

            INSTRUCTIONS:
            1. Be very concise (max 150 words).
            2. Mention one specific optimization (Time or Space complexity).
            3. Use a "Surgeon" / "Diagnostic" persona.
            4. If the code was perfect, compliment them on its efficiency.
            
            Return ONLY the report text.
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            logger.error("AI Review Generation Error:", error);
            throw new Error("Failed to generate AI report");
        }
    }

    async generateGameMasterComment(type, context) {
        if (!this.genAI) throw new Error("AI Service missing");
        
        const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
            You are the "Game Master" for a high-stakes "Squid Game" style coding tournament on the "ChallegX" platform.
            Your tone is authoritative, slightly sinister, and mysterious (like The Frontman).
            
            Event Type: ${type}
            Context: ${JSON.stringify(context)}
            
            Task: Generate a ONE-LINE atmospheric broadcast message to the players. 
            Keep it under 100 characters. Do not use emojis. 
            Make it sound like a broadcast over a loudspeaker.
            
            Example: "Round 2 has begun. 40 of you remain. Efficiency is survival."
            Example: "Half the time has elapsed. The weak are being exposed."
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim().replace(/"/g, '');
        } catch (error) {
            logger.error("AI Game Master Error:", error);
            return "Attention players. Focus and proceed.";
        }
    }

    async generateProblem(difficulty, tags = []) {
        if (!this.genAI) throw new Error("AI Service missing");

        const model = this.genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
            Generate a new competitive programming problem.
            Difficulty: ${difficulty}
            Tags: ${tags.join(", ")}
            
            Return a JSON object in this format:
            {
                "title": "Problem Title",
                "description": "Full Markdown description with examples",
                "difficulty": "${difficulty}",
                "timeLimitMs": 1000,
                "memoryLimitMb": 256,
                "tags": ["Array", "Math"],
                "testcases": [
                    { "input": "input1", "output": "output1", "isSample": true, "explanation": "Why this output?" },
                    { "input": "input2", "output": "output2", "isSample": false },
                    { "input": "input3", "output": "output3", "isSample": false }
                ]
            }
            
            Ensure the problem is unique, creative, and the test cases are accurate.
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return JSON.parse(response.text());
        } catch (error) {
            logger.error("AI Problem Generation Error:", error);
            throw new Error("Failed to generate creative problem");
        }
    }

    async generateLiveComment(player1, player2, problem) {
        if (!this.genAI) throw new Error("AI Service missing");

        const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
            You are the "ChallegX Live Analyst", a high-energy, technical esports commentator.
            You are observing a live 1v1 coding battle.
            
            Player 1: ${player1.username} (${player1.progress} tasks passed)
            Player 2: ${player2.username} (${player2.progress} tasks passed)
            Problem: ${problem.title}
            
            Task: Provide a ONE-SENTENCE hype commentary for the spectators. 
            Keep it under 120 characters. Use professional esports terminology.
            
            Example: "${player1.username} is executing a perfect sweep, but ${player2.username} is closing the logic gap!"
            Example: "Both players are deadlocked on the main loop. Who will optimize first?"
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim().replace(/"/g, '');
        } catch (error) {
            return "The competition is heating up. High-level logic on display!";
        }
    }

    async generateSolution(problem, language) {
        if (!this.genAI) throw new Error("AI Service missing");

        const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
            You are a competitive programmer solving a challenge on ChallegX.
            PROBLEM: ${problem.title}
            DESCRIPTION: ${problem.description}
            LANGUAGE: ${language}
            
            Task: Provide a COMPLETE, working solution for this problem in ${language}.
            The solution must be concise and pass all standard test cases.
            If the language is Java, use a class named "Main" with a static main method.
            If C++, include necessary headers.
            
            Return ONLY the source code. No explanations, no markdown blocks.
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text().trim();
            // Remove markdown code blocks if AI included them despite instructions
            text = text.replace(/```[a-z]*\n/g, '').replace(/\n```/g, '');
            return text;
        } catch (error) {
            logger.error("AI Solution Generation Error:", error);
            return "// Solution could not be generated at this time.";
        }
    }
}

export default new AIService();

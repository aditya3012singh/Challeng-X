import { GoogleGenerativeAI } from "@google/generative-ai";
import env from "../../core/config/env.js";
import logger from "../../core/logger/logger.js";

class AIService {
    constructor() {
        // Trim key to prevent issues with trailing \r or spaces
        const key = env.GEMINI_API_KEY ? env.GEMINI_API_KEY.trim() : null;
        this.genAI = key ? new GoogleGenerativeAI(key) : null;
    }

    async generateHint(problem, currentCode, language) {
        if (!this.genAI || env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            return "CHALLENGX_SYSTEM: AI Hinting is currently in 'Sandbox Mode'. Please check your Neural Link (GEMINI_API_KEY). [MOCK HINT]: Try refining your logic for the edge cases specified in the problem description.";
        }

        const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are "Cyber-Mentor", a professional coding assistant for the ChallengX platform.
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
            console.error("DEBUG: Gemini API Error:", error);
            logger.error("AI Hint Generation Error:", error);
            return "CHALLENGX_SYSTEM: The Neural Link is unstable (API Error). [FALLBACK]: Review your algorithm's efficiency and ensure you're using the correct data structures.";
        }
    }

    async generateCodeSurgeonReport(problem, finalCode, language, result) {
        if (!this.genAI || env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            return "CHALLENGX_SURGEON: Missing Neural Link (GEMINI_API_KEY). Providing mock diagnostics: The code appears syntactically sound, but complexity could be reduced by avoiding nested loops.";
        }

        const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are "Code Surgeon", an elite code optimization scanner for ChallengX.
            The user has just completed a challenge. Provide a brief "Medical Report" on their code.
            
            PROBLEM: ${problem.title}
            RESULT: ${result} (Success)
            CODE (${language}):
            \`\`\`${language}
            ${finalCode}
            \`\`\`

            INSTRUCTIONS:
            1. Be very concise (max 120 words).
            2. Predict the Time complexity (e.g. O(N)) and Space complexity.
            3. Detect the algorithmic pattern (e.g., "Two Pointers", "DFS", "Dynamic Programming").
            4. Suggest ONE specific optimization for speed or memory.
            5. Use a "Surgeon" / "Diagnostic" persona with medical terminology (e.g., "Logic flow is healthy", "Symptoms of high complexity").
            
            Return ONLY the report text in clean Markdown.
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("DEBUG: Gemini API Error (Surgeon):", error);
            return "CHALLENGX_SURGEON: Neural Link unstable. [MOCK DIAGNOSTIC]: Your code structure is solid, but remember to watch out for redundant calculations in your main loops.";
        }
    }

    async generateGameMasterComment(type, context) {
        if (!this.genAI) throw new Error("AI Service missing");
        
        const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
            You are the "Game Master" for a high-stakes "Squid Game" style coding tournament on the "ChallengX" platform.
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
        if (!this.genAI || env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
             // Mock problem for testing
             return {
                 title: "Mock AI Problem",
                 description: "This is a mock problem because the AI Neural Link is not fully established. Solve: Find the sum of two numbers.",
                 difficulty,
                 tags: ["Basic", "Testing"],
                 testcases: [{ input: "1 2", output: "3", isSample: true }]
             };
        }

        const model = this.genAI.getGenerativeModel({ 
            model: "gemini-1.5-pro",
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
            console.error("DEBUG: Gemini API Error (Problem):", error);
            return {
                title: "Efficiency Protocol 101",
                description: "Identify the mystery number in a sorted sequence with O(log N) complexity.",
                difficulty,
                tags: ["Binary Search", "Foundations"],
                testcases: [{ input: "5\n1 2 3 4 5\n3", output: "2", isSample: true }]
            };
        }
    }

    async generateLiveComment(player1, player2, problem) {
        if (!this.genAI || env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            return "The data stream is silent. Waiting for Neural Link...";
        }

        const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const prompt = `
            You are the "ChallengX Live Analyst", a high-energy, technical esports commentator.
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
            console.error("DEBUG: Gemini API Error (Comment):", error);
            return "The competition is heating up. High-level logic on display!";
        }
    }

    async generateSolution(problem, language) {
        if (!this.genAI || env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
            return "// AI Solution disabled. Use valid GEMINI_API_KEY.\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Mock Solution: GCD is calculated here.\");\n    }\n}";
        }

        const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
            You are a competitive programmer solving a challenge on ChallengX.
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
            console.error("DEBUG: Gemini API Error (Solution):", error);
            return "// Solution could not be generated at this time.";
        }
    }
}

export default new AIService();
